import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId, date, time, type, expertId } = req.body;
    const booking = await prisma.booking.create({
      data: {
        requestId,
        date,
        time,
        type: type || 'VIDEO',
        userId: req.user!.id,
        expertId
      }
    });
    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create booking' });
  }
};
