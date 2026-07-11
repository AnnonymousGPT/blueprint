import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import * as authCtrl from '../controllers/authController';
import * as requestCtrl from '../controllers/requestController';
import * as bookingCtrl from '../controllers/bookingController';
import * as docCtrl from '../controllers/documentController';
import * as messageCtrl from '../controllers/messageController';
import * as notificationCtrl from '../controllers/notificationController';

const router = Router();

// Auth
router.post('/auth/send-otp', authCtrl.sendOtp);
router.post('/auth/verify-otp', authCtrl.verifyOtp);
router.post('/auth/register', authCtrl.register);
router.get('/auth/me', authenticateToken, authCtrl.getMe);
router.get('/experts', authCtrl.getExperts);

// Requests
router.post('/requests', authenticateToken, requireRole(['CLIENT']), requestCtrl.createRequest);
router.get('/requests', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), requestCtrl.getRequests);
router.patch('/requests/:id', authenticateToken, requireRole(['EXPERT', 'ADMIN']), requestCtrl.updateRequestStatus);
router.post('/requests/:id/assign', authenticateToken, requireRole(['CLIENT', 'ADMIN']), requestCtrl.assignExpert);

// Documents — specific string routes MUST come before parameterized :id routes
router.get('/documents/upload-url', authenticateToken, requireRole(['CLIENT']), docCtrl.getUploadUrl);
router.post('/documents/upload', authenticateToken, requireRole(['CLIENT']), docCtrl.uploadDocument);
router.post('/documents/confirm', authenticateToken, requireRole(['CLIENT']), docCtrl.confirmUpload);
router.get('/documents/by-request/:requestId', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), docCtrl.getDocumentsByRequest);
router.get('/documents/:id/download', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), docCtrl.getDocumentDownloadUrl);
router.patch('/documents/:id', authenticateToken, requireRole(['EXPERT', 'ADMIN']), docCtrl.updateDocumentStatus);

// Bookings
router.post('/bookings', authenticateToken, requireRole(['CLIENT', 'EXPERT']), bookingCtrl.createBooking);

// Messages
router.get('/messages/unread/count', authenticateToken, requireRole(['CLIENT', 'EXPERT']), messageCtrl.getUnreadCount);
router.get('/messages/:otherUserId', authenticateToken, requireRole(['CLIENT', 'EXPERT']), messageCtrl.getMessages);
router.post('/messages', authenticateToken, requireRole(['CLIENT', 'EXPERT']), messageCtrl.sendMessage);

// Notifications
router.get('/notifications', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), notificationCtrl.getNotifications);
router.post('/notifications/read-all', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), notificationCtrl.markAllRead);
router.patch('/notifications/:id/read', authenticateToken, requireRole(['CLIENT', 'EXPERT', 'ADMIN']), notificationCtrl.markRead);


export default router;
