import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const getMessages = async (req: AuthenticatedRequest, res: Response) => {
  const { otherUserId } = req.params;
  const myId = req.user!.id;
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    // Mark incoming messages as read
    await prisma.message.updateMany({
      where: { senderId: otherUserId, receiverId: myId, isRead: false },
      data: { isRead: true }
    });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { receiverId, content, fileUrl } = req.body;
  const myId = req.user!.id;
  try {
    const message = await prisma.message.create({
      data: {
        senderId: myId,
        receiverId,
        content,
        fileUrl: fileUrl || null
      }
    });
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

// GET /messages/unread/count
export const getUnreadCount = async (req: AuthenticatedRequest, res: Response) => {
  const myId = req.user!.id;
  try {
    const count = await prisma.message.count({
      where: { receiverId: myId, isRead: false }
    });
    return res.json({ success: true, count });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get unread count' });
  }
};
