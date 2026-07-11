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
        status: assignedExpertId ? 'EXPERT_ASSIGNED' : 'NEW',
      }
    });
    return res.status(201).json({ success: true, data: request });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create request' });
  }
};

export const getRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const whereClause = req.user!.role === 'EXPERT' ? { assignedExpertId: req.user!.id } : { userId: req.user!.id };
    const requests = await prisma.serviceRequest.findMany({
      where: whereClause,
      include: { 
        client: true, 
        assignedExpert: {
          include: {
            expert: true
          }
        }, 
        documents: true, 
        bookings: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.status(200).json({ success: true, data: requests });
  } catch (error) {
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
