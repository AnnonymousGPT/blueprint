import { Response } from 'express';
import prisma from '../services/db';
import { AuthenticatedRequest } from '../middleware/auth';
import { supabase } from '../services/supabaseClient';
import { getSignedDownloadUrl } from '../services/s3';

const BUCKET = 'documents';

// Map frontend category strings to valid DocCategory enum values
const normalizeCategoryToEnum = (raw: string): string => {
  const mapping: Record<string, string> = {
    'PAN': 'PAN', 'AADHAAR': 'AADHAAR', 'GST': 'GST', 'GST_CERTIFICATE': 'GST',
    'BANK_STATEMENT': 'BANK_STATEMENT', 'BANK': 'BANK_STATEMENT',
    'ITR': 'ITR', 'ITR_COPY': 'ITR', 'BUSINESS': 'BUSINESS',
    'BUSINESS_DOCUMENTS': 'BUSINESS', 'BIZ': 'BUSINESS'
  };
  const upper = (raw || '').toUpperCase().replace(/\s+/g, '_');
  return mapping[upper] || 'BUSINESS';
};

// POST /documents/upload — legacy metadata-only upload (backward compat)
export const uploadDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });
    const { requestId, name, category, size } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required.' });
    const normalizedCategory = normalizeCategoryToEnum(category);
    const fileKey = `docs/${userId}/${normalizedCategory.toLowerCase()}/${Date.now()}_${name}`;
    const document = await prisma.document.create({
      data: { userId, requestId: requestId || null, name, key: fileKey, category: normalizedCategory as any, size: size || '1.5 MB' }
    });
    return res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    console.error('Document upload error:', error?.message);
    return res.status(500).json({ error: 'Failed to upload document', detail: error?.message });
  }
};

// GET /documents/upload-url — signed URL for direct Supabase Storage upload
export const getUploadUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });
    const { fileName, category, contentType } = req.query as any;
    if (!fileName || !category) return res.status(400).json({ error: 'fileName and category required.' });
    
    const normalizedCat = normalizeCategoryToEnum(category);
    const storagePath = `${userId}/${normalizedCat.toLowerCase()}/${Date.now()}_${fileName}`;
    
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(storagePath);
    if (error) {
      console.error('Signed upload URL error:', error.message);
      return res.status(500).json({ error: 'Failed to generate upload URL', detail: error.message });
    }
    
    return res.json({ success: true, signedUrl: data.signedUrl, token: data.token, storagePath });
  } catch (error: any) {
    console.error('Upload URL error:', error?.message);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
};

// POST /documents/confirm — confirm upload after file stored in Supabase Storage
export const confirmUpload = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required.' });
    const { storagePath, fileName, category, size, requestId } = req.body;
    if (!storagePath || !fileName || !category) {
      return res.status(400).json({ error: 'storagePath, fileName, category required.' });
    }
    const normalizedCategory = normalizeCategoryToEnum(category);
    const document = await prisma.document.create({
      data: {
        userId, requestId: requestId || null,
        name: fileName, key: storagePath,
        category: normalizedCategory as any,
        size: size || '1 MB'
      }
    });
    return res.status(201).json({ success: true, data: document });
  } catch (error: any) {
    console.error('Confirm upload error:', error?.message);
    return res.status(500).json({ error: 'Failed to confirm upload', detail: error?.message });
  }
};

// GET /documents/:id/download — signed download URL
export const getDocumentDownloadUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const signedUrl = await getSignedDownloadUrl(doc.key, 3600);
    return res.json({ success: true, url: signedUrl, document: doc });
  } catch (error: any) {
    console.error('Download URL error:', error?.message);
    return res.status(500).json({ error: 'Failed to generate download URL' });
  }
};

// GET /documents/by-request/:requestId — list docs for a request
export const getDocumentsByRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const docs = await prisma.document.findMany({
      where: { requestId },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: docs });
  } catch (error: any) {
    console.error('Get docs error:', error?.message);
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
};

// PATCH /documents/:id — update status (expert approval/rejection)
export const updateDocumentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const document = await prisma.document.update({
      where: { id }, data: { status, reason }
    });
    return res.status(200).json({ success: true, data: document });
  } catch (error: any) {
    console.error('Document status update error:', error?.message);
    return res.status(500).json({ error: 'Failed to update document', detail: error?.message });
  }
};
