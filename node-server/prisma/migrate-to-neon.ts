/**
 * Migrate data from local database to Neon (deployed).
 *
 * Usage:
 *   SOURCE_DATABASE_URL="postgresql://schedule:schedule@localhost:5432/schedule_db" \
 *   TARGET_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require" \
 *   npx ts-node prisma/migrate-to-neon.ts
 *
 * Get TARGET_DATABASE_URL from: fly secrets list -a schedule-board (then fly ssh console to echo it)
 * Or from Neon dashboard: https://console.neon.tech
 */

import { PrismaClient } from '@prisma/client';

const SOURCE_URL = process.env.SOURCE_DATABASE_URL;
const TARGET_URL = process.env.TARGET_DATABASE_URL;

if (!SOURCE_URL || !TARGET_URL) {
  console.error('Missing env vars. Set SOURCE_DATABASE_URL and TARGET_DATABASE_URL');
  process.exit(1);
}

const source = new PrismaClient({
  datasources: { db: { url: SOURCE_URL } },
});

const target = new PrismaClient({
  datasources: { db: { url: TARGET_URL } },
});

async function main() {
  console.log('Reading from local database...');
  const users = await source.user.findMany({ include: { tasks: { include: { progressLogs: true } } } });

  if (users.length === 0) {
    console.log('No users found in source database.');
    return;
  }

  const userIdMap = new Map<string, string>();
  const taskIdMap = new Map<string, string>();

  for (const u of users) {
    const existing = await target.user.findUnique({ where: { username: u.username } });
    let targetUser;
    if (existing) {
      targetUser = existing;
      console.log(`User "${u.username}" already exists in target, will add tasks.`);
    } else {
      targetUser = await target.user.create({
        data: { username: u.username, password: u.password, email: u.email ?? undefined },
      });
      console.log(`Created user "${u.username}" in target.`);
    }
    userIdMap.set(u.id, targetUser.id);

    // Delete existing tasks for this user in target (to avoid duplicates)
    await target.task.deleteMany({ where: { userId: targetUser.id } });

    for (const t of u.tasks) {
      const newTask = await target.task.create({
        data: {
          userId: targetUser.id,
          aspect: t.aspect,
          description: t.description,
          plannedHours: t.plannedHours,
          studiedHours: t.studiedHours,
          day: t.day,
        },
      });
      taskIdMap.set(t.id, newTask.id);

      for (const log of t.progressLogs) {
        await target.progressLog.create({
          data: {
            taskId: newTask.id,
            loggedHours: log.loggedHours,
            date: log.date,
          },
        });
      }
    }
    console.log(`  Migrated ${u.tasks.length} tasks (with progress logs) for ${u.username}`);
  }

  console.log('\nMigration complete.');
}

main()
  .then(async () => {
    await source.$disconnect();
    await target.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await source.$disconnect();
    await target.$disconnect();
    process.exit(1);
  });
