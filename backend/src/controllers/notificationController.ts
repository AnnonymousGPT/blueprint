import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  try {
    await prisma.notification.updateMany({
      where: { userId },
      data: { read: true }
    });
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark all as read' });
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  try {
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true }
    });
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notification status' });
  }
};
