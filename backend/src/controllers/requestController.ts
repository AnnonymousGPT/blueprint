import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { broadcastRequestUpdate } from '../index';

export const createRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { serviceId, serviceName, assignedExpertId, amount } = req.body;
    const request = await prisma.serviceRequest.create({
      data: {
        userId: req.user!.id,
        serviceId: serviceId || 'srv-001',
        serviceName,
        assignedExpertId: assignedExpertId || null,
        amount: amount || 1499,
        status: (assignedExpertId ? 'EXPERT_ASSIGNED' : 'NEW') as any,
      } as any
    });

    // Auto-associate any previously unassociated uploaded documents of this user with the new request
    await prisma.document.updateMany({
      where: {
        userId: req.user!.id,
        requestId: null
      },
      data: {
        requestId: request.id
      }
    });

    return res.status(201).json({ success: true, data: request });
  } catch (error: any) {
    console.error('createRequest failed:', error?.message);
    return res.status(500).json({ error: 'Failed to create request' });
  }
};

export const getRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    let whereClause: any = { userId: req.user!.id };
    
    if (req.user!.role === 'EXPERT') {
      const expert = await prisma.expert.findUnique({
        where: { userId: req.user!.id }
      });
      if (!expert) {
        return res.status(200).json({ success: true, data: [] });
      }
      whereClause = { assignedExpertId: expert.id };
    }

    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: { 
        user: true, 
        assignedExpert: {
          include: {
            user: true
          }
        }, 
        documents: true, 
        bookings: true 
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map user relation to client for frontend backward compatibility
    const formatted = requests.map((r: any) => ({
      ...r,
      client: r.user
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error: any) {
    console.error('getRequests failed:', error?.message);
    return res.status(500).json({ error: 'Failed to get requests' });
  }
};

export const updateRequestStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, progressPercent } = req.body;
    
    if (req.user!.role !== 'EXPERT') {
      return res.status(403).json({ error: 'Only experts can update status' });
    }
    
    const request = await prisma.serviceRequest.update({
      where: { id },
      data: { status, progressPercent }
    });
    
    // Broadcast via socket.io
    broadcastRequestUpdate(id, request);
    
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update request' });
  }
};

export const assignExpert = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const request = await prisma.serviceRequest.update({
      where: { id },
      data: { assignedExpertId: req.user!.id, status: 'EXPERT_ASSIGNED' }
    });
    return res.status(200).json({ success: true, data: request });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to assign' });
  }
};
