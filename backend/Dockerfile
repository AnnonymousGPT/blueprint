# Multi-stage production build for TypeScript Express Server
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY prisma ./prisma/

RUN npm ci

COPY backend/src ./src

RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY backend/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 5000

CMD ["npm", "run", "start"]

