import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;

    await prisma.task.deleteMany({ where: { userId } });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
    const SCHEDULE: Record<string, { aspect: string; description: string; plannedHours: number }[]> = {
      Monday: [
        { aspect: 'English', description: 'English session', plannedHours: 1 },
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'BE', description: 'BE', plannedHours: 2 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Tuesday: [
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'FE', description: 'FE', plannedHours: 2 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Wednesday: [
        { aspect: 'English', description: 'English session', plannedHours: 1 },
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 2 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Thursday: [
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'BE', description: 'BE', plannedHours: 2 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Friday: [
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'AI', description: 'AI', plannedHours: 2 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Saturday: [
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'FE', description: 'FE', plannedHours: 3 },
        { aspect: 'AI', description: 'AI', plannedHours: 2 },
        { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 1 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
      Sunday: [
        { aspect: 'English', description: 'Shadowing', plannedHours: 0.5 },
        { aspect: 'BE', description: 'BE', plannedHours: 2 },
        { aspect: 'Soft_skills', description: 'Soft-skills', plannedHours: 1 },
        { aspect: 'Reading', description: 'Reading', plannedHours: 0.5 },
      ],
    };

    for (const day of DAYS) {
      for (const t of SCHEDULE[day]) {
        await prisma.task.create({
          data: {
            userId,
            aspect: t.aspect as any,
            description: t.description,
            plannedHours: t.plannedHours,
            day: day as any,
          },
        });
      }
    }

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: [{ day: 'asc' }],
    });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

export { router as weeklyResetRouter };
