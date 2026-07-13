import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { logger, loggerContext } from '../services/logger';

// Simple UUID generator fallback
const generateUuid = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// In-memory metrics tracking for API latency and error rates
export const requestMetrics = {
  totalRequests: 0,
  errorCount: 0,
  latencySum: 0,
  averageLatency: 0,
  activeSessions: 0
};

export const loggerMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const requestId = (req.headers['x-request-id'] as string) || generateUuid();
  const correlationId = (req.headers['x-correlation-id'] as string) || requestId;
  const userId = req.user?.id || undefined;

  // Set correlation headers in response
  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);

  const startTime = process.hrtime();

  const context = { requestId, correlationId, userId };

  loggerContext.run(context, () => {
    logger.info(`Incoming Request: ${req.method} ${req.url}`, {
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress
    });

    // Capture response completion to calculate duration and errors
    res.on('finish', () => {
      const diff = process.hrtime(startTime);
      const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6;

      // Update metrics
      requestMetrics.totalRequests += 1;
      requestMetrics.latencySum += durationMs;
      requestMetrics.averageLatency = requestMetrics.latencySum / requestMetrics.totalRequests;
      
      if (res.statusCode >= 400) {
        requestMetrics.errorCount += 1;
        logger.error(`Request Failed: ${req.method} ${req.url} - Status ${res.statusCode}`, {
          durationMs,
          status: res.statusCode
        });
      } else {
        logger.info(`Request Completed: ${req.method} ${req.url} - Status ${res.statusCode}`, {
          durationMs,
          status: res.statusCode
        });
      }
    });

    next();
  });
};
