import { AsyncLocalStorage } from 'async_hooks';

export interface LogContext {
  requestId?: string;
  correlationId?: string;
  userId?: string;
}

export const loggerContext = new AsyncLocalStorage<LogContext>();

function formatMessage(level: string, message: string, meta?: any): string {
  const context = loggerContext.getStore() || {};
  const logObj = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    ...meta
  };
  return JSON.stringify(logObj);
}

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(formatMessage('INFO', message, meta));
  },
  warn: (message: string, meta?: any) => {
    console.warn(formatMessage('WARN', message, meta));
  },
  error: (message: string, meta?: any) => {
    console.error(formatMessage('ERROR', message, meta));
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(formatMessage('DEBUG', message, meta));
    }
  }
};
