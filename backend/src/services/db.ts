import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
});

// Soft Delete Middleware (High Priority #2)
prisma.$use(async (params, next) => {
  const modelsWithSoftDelete = ['User', 'ServiceRequest'];
  
  if (modelsWithSoftDelete.includes(params.model || '')) {
    // 1. Intercept DELETE and convert to UPDATE (Soft Delete Helper)
    if (params.action === 'delete') {
      params.action = 'update';
      params.args.data = { deletedAt: new Date() };
    }
    if (params.action === 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data) {
        params.args.data.deletedAt = new Date();
      } else {
        params.args.data = { deletedAt: new Date() };
      }
    }

    // 2. Intercept FIND queries and filter out deleted records globally (unless explicitly bypassed)
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      if (params.args.where && params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }
    
    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      } else {
        params.args.where = { deletedAt: null };
      }
    }
  }

  return next(params);
});

export default prisma;
export * from '@prisma/client';
