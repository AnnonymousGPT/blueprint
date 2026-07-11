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
      orderBy: {
        createdAt: 'asc'
      }
    });
    return res.status(200).json({ success: true, data: messages });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req: AuthenticatedRequest, res: Response) => {
  const { receiverId, content } = req.body;
  const myId = req.user!.id;
  try {
    const message = await prisma.message.create({
      data: {
        senderId: myId,
        receiverId,
        content
      }
    });
    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
