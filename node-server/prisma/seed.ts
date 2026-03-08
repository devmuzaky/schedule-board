import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
type Day = (typeof DAYS)[number];

interface SeedTask {
  aspect: string;
  description: string;
  plannedHours: number;
  day: Day;
}

const SCHEDULE: Record<Day, SeedTask[]> = {
  Monday: [
    { aspect: 'English', description: 'English session', plannedHours: 1, day: 'Monday' },
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Monday' },
    { aspect: 'BE', description: 'BE', plannedHours: 2, day: 'Monday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Monday' },
  ],
  Tuesday: [
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Tuesday' },
    { aspect: 'FE', description: 'FE', plannedHours: 2, day: 'Tuesday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Tuesday' },
  ],
  Wednesday: [
    { aspect: 'English', description: 'English session', plannedHours: 1, day: 'Wednesday' },
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Wednesday' },
    { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 2, day: 'Wednesday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Wednesday' },
  ],
  Thursday: [
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Thursday' },
    { aspect: 'BE', description: 'BE', plannedHours: 2, day: 'Thursday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Thursday' },
  ],
  Friday: [
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Friday' },
    { aspect: 'AI', description: 'AI', plannedHours: 2, day: 'Friday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Friday' },
  ],
  Saturday: [
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Saturday' },
    { aspect: 'FE', description: 'FE', plannedHours: 3, day: 'Saturday' },
    { aspect: 'AI', description: 'AI', plannedHours: 2, day: 'Saturday' },
    { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 1, day: 'Saturday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Saturday' },
  ],
  Sunday: [
    { aspect: 'English', description: 'Shadowing', plannedHours: 0.5, day: 'Sunday' },
    { aspect: 'BE', description: 'BE', plannedHours: 2, day: 'Sunday' },
    { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 1, day: 'Sunday' },
    { aspect: 'Reading', description: 'Reading', plannedHours: 0.5, day: 'Sunday' },
  ],
};

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { username: 'moezaky' },
    update: {},
    create: {
      username: 'moezaky',
      password: hashedPassword,
    },
  });

  // Delete existing tasks for this user (for idempotent reseed)
  await prisma.task.deleteMany({ where: { userId: user.id } });

  for (const day of DAYS) {
    const tasks = SCHEDULE[day];
    for (const t of tasks) {
      await prisma.task.create({
        data: {
          userId: user.id,
          aspect: t.aspect as any,
          description: t.description,
          plannedHours: t.plannedHours,
          day: t.day as any,
        },
      });
    }
  }

  console.log('Seed completed: user moezaky and schedule tasks created.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
