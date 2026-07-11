import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';

// Map frontend category strings to valid DocCategory enum values
const normalizeCategoryToEnum = (raw: string): string => {
  const mapping: Record<string, string> = {
    'PAN': 'PAN',
    'AADHAAR': 'AADHAAR',
    'GST': 'GST',
    'GST_CERTIFICATE': 'GST',
    'BANK_STATEMENT': 'BANK_STATEMENT',
    'BANK': 'BANK_STATEMENT',
    'ITR': 'ITR',
    'ITR_COPY': 'ITR',
    'BUSINESS': 'BUSINESS',
    'BUSINESS_DOCUMENTS': 'BUSINESS',
    'BIZ': 'BUSINESS'
  };
  const upper = (raw || '').toUpperCase().replace(/\s+/g, '_');
  return mapping[upper] || 'BUSINESS';
};

export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required to upload documents.' });
    }

    const { requestId, name, category, size } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Document name and category are required.' });
    }

    const normalizedCategory = normalizeCategoryToEnum(category);

    // Generate a unique file key (no real S3 in demo, use a placeholder key)
    const fileKey = `docs/${userId}/${normalizedCategory.toLowerCase()}/${Date.now()}_${name}`;

    const document = await prisma.document.create({
      data: {
        userId,
        requestId: requestId || null,
        name,
        key: fileKey,
        category: normalizedCategory as any,
        size: size || '1.5 MB'
      }
    });
    return res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    console.error('Document upload error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to upload document', detail: error?.message });
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
  } catch (error: any) {
    console.error('Document status update error:', error?.message || error);
    return res.status(500).json({ error: 'Failed to update document', detail: error?.message });
  }
};
