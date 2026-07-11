import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId, name, category, size } = req.body;
    const document = await prisma.document.create({
      data: {
        requestId,
        name,
        category,
        size: size || '1.5 MB'
      }
    });
    return res.status(201).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to upload document' });
  }
};

export const updateDocumentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const document = await prisma.document.update({
      where: { id },
      data: { status, reason }
    });
    return res.status(200).json({ success: true, data: document });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update document' });
  }
};
