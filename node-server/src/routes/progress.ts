import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, optionalAuthMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

router.get('/logs', optionalAuthMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.json([]);
      return;
    }
    const logs = await prisma.progressLog.findMany({
      where: { task: { userId } },
      include: { task: true },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (e) {
    next(e);
  }
});

router.get('/export', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const logs = await prisma.progressLog.findMany({
      where: { task: { userId } },
      include: { task: true },
      orderBy: { date: 'desc' },
    });
    const header = 'Date,Task,Aspect,Description,Logged Hours\n';
    const rows = logs.map(
      (l) =>
        `${l.date.toISOString()},"${l.task.description}","${l.task.aspect}","${l.task.description}",${l.loggedHours}`
    );
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=progress-export.csv');
    res.send(header + rows.join('\n'));
  } catch (e) {
    next(e);
  }
});

router.post('/:taskId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { taskId } = req.params;
    const { loggedHours } = req.body;

    if (loggedHours == null || parseFloat(loggedHours) <= 0) {
      res.status(400).json({ error: 'loggedHours must be a positive number' });
      return;
    }

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const hours = parseFloat(loggedHours);
    const newStudied = task.studiedHours + hours;

    await prisma.$transaction([
      prisma.progressLog.create({
        data: { taskId, loggedHours: hours },
      }),
      prisma.task.update({
        where: { id: taskId },
        data: { studiedHours: newStudied },
      }),
    ]);

    const updated = await prisma.task.findUnique({
      where: { id: taskId },
      include: { progressLogs: true },
    });
    res.status(201).json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete('/log/:logId', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.userId;
    const { logId } = req.params;

    const log = await prisma.progressLog.findUnique({
      where: { id: logId },
      include: { task: true },
    });
    if (!log || log.task.userId !== userId) {
      res.status(404).json({ error: 'Log not found' });
      return;
    }

    const newStudied = Math.max(0, log.task.studiedHours - log.loggedHours);

    await prisma.$transaction([
      prisma.progressLog.delete({ where: { id: logId } }),
      prisma.task.update({
        where: { id: log.taskId },
        data: { studiedHours: newStudied },
      }),
    ]);

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export { router as progressRouter };
