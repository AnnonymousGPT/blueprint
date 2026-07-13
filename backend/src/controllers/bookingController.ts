import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

// Helper to parse date and time slot into a clean Javascript Date object
export const parseDateTime = (dateStr: string, timeStr: string): Date => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date();
    }
    
    // Parse slot timeStr e.g. "10:00 AM" or "02:30 PM"
    const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const ampm = timeMatch[3].toUpperCase();
      
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      date.setHours(hours, minutes, 0, 0);
    } else {
      const [h, m] = timeStr.split(':');
      if (h && m) {
        date.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      }
    }
    return date;
  } catch (e) {
    return new Date();
  }
};

export const createBooking = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId, date, time, type, expertId } = req.body;
    if (!requestId || !expertId || !date || !time) {
      return res.status(400).json({ error: 'Missing required parameters.' });
    }

    // Resolve expertId (User ID from frontend) to Expert Profile ID
    const expert = await prisma.expert.findUnique({
      where: { userId: expertId }
    });
    if (!expert) {
      return res.status(404).json({ error: 'Expert not found.' });
    }

    const scheduledAt = parseDateTime(date, time);

    const booking = await prisma.booking.create({
      data: {
        requestId,
        userId: req.user!.id,
        expertId: expert.id,
        scheduledAt,
        type: type || 'VIDEO',
        status: 'CONFIRMED'
      }
    });

    return res.status(201).json({ success: true, data: booking });
  } catch (error: any) {
    console.error('Failed to create booking:', error?.message);
    if (error?.code === 'P2002' || error?.message?.includes('Unique constraint')) {
      return res.status(400).json({ error: 'This time slot is already booked. Please choose a different date or time.' });
    }
    return res.status(500).json({ error: 'Failed to create booking' });
  }
};
