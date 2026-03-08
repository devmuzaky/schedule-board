import { Router } from 'express';
import { PrismaClient, Day, Aspect } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

router.get('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { progressLogs: true },
      orderBy: [{ day: 'asc' }],
    });
    res.json(tasks);
  } catch (e) {
    next(e);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { aspect, description, plannedHours, day } = req.body;
    if (!aspect || !description || plannedHours == null || !day) {
      res.status(400).json({ error: 'aspect, description, plannedHours, day required' });
      return;
    }
    const task = await prisma.task.create({
      data: {
        userId,
        aspect,
        description,
        plannedHours: parseFloat(plannedHours),
        day,
      },
    });
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { day, studiedHours, description, aspect, plannedHours } = req.body;

    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const updates: {
      day?: Day;
      studiedHours?: number;
      description?: string;
      aspect?: Aspect;
      plannedHours?: number;
    } = {};
    if (day !== undefined) updates.day = day as Day;
    if (studiedHours !== undefined) updates.studiedHours = parseFloat(studiedHours);
    if (description !== undefined) updates.description = description;
    if (aspect !== undefined) updates.aspect = aspect as Aspect;
    if (plannedHours !== undefined) updates.plannedHours = parseFloat(plannedHours);

    const task = await prisma.task.update({
      where: { id },
      data: updates,
    });
    res.json(task);
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const existing = await prisma.task.findFirst({ where: { id, userId } });
    if (!existing) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export { router as tasksRouter };
