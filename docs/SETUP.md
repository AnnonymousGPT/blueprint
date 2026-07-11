# Production Setup & Deployment Guide

This guide details instructions for setting up the **Blueprint Advisor** full-stack SaaS platform on a VPS (Ubuntu) or local development environment.

---

## 🛠️ Prerequisites

Ensure your system has the following installed:
1. **Node.js** (v18 or v20)
2. **PostgreSQL** (v14 or newer) OR **Docker** + **Docker Compose**
3. **Nginx** (for reverse proxying)
4. **npm**

---

## 🚀 Local Development Setup

### 1. Database Setup
Create a PostgreSQL database named `blueprint_advisor`.
```sql
CREATE DATABASE blueprint_advisor;
```

### 2. Backend Installation & Configurations
Navigate to the `backend/` directory, copy `.env.example` to `.env` and fill in the credentials.
```bash
cd backend
cp .env.example .env
npm install
```

Configure your `.env` values:
- `DATABASE_URL`: `"postgresql://username:password@localhost:5432/blueprint_advisor?schema=public"`
- `JWT_ACCESS_SECRET` & `JWT_REFRESH_SECRET`: Secure cryptographic strings.
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay Dashboard API credentials (leave default mock parameters for offline development testing).
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY`: AWS/S3 credentials for document management (leave empty for local mock file upload emulation).

### 3. Prisma Schema migrations & Database Seeding
From the workspace root directory:
```bash
# Generate Prisma Client classes
npx prisma generate --schema=prisma/schema.prisma

# Run database migrations
npx prisma migrate dev --name init --schema=prisma/schema.prisma

# Seed database with sample data
npx ts-node prisma/seed.ts
```

### 4. Running the Applications

#### Run Backend Dev Server (Port 5000)
```bash
cd backend
npm run dev
```

#### Run Client Application (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

#### Run Admin Dashboard (Port 5174)
```bash
cd admin
npm install
npm run dev
```

#### Run Expert Dashboard (Port 5175)
```bash
cd expert
npm install
npm run dev
```

---

## 🐳 Containerized Production Deployment (Docker)

To deploy the entire stack using Docker Compose:

### 1. Build and Run Container Services
From the workspace root (where `docker-compose.yml` is located):
```bash
# Build backend and launch Postgres + Nginx Gateway
docker-compose up -d --build
```

### 2. Execute Production migrations inside Docker container
```bash
# Locate the backend container name (e.g. blueprint_backend)
docker exec -it blueprint_backend npx prisma migrate deploy
docker exec -it blueprint_backend npm run prisma:seed
```

### 3. Verify Health Checks
Check if all services are successfully running:
```bash
docker-compose ps
```

---

## 🔒 Nginx Production Proxy Mappings

Deploy the custom reverse proxy rules located in [nginx.conf](file:///c:/Users/daksh/OneDrive/Documents/dx/blue/docker/nginx.conf) to `/etc/nginx/nginx.conf` on your VPS.

Make sure to map the static HTML bundles after building the frontend projects:
```bash
# Compile builds
cd frontend && npm run build
cd ../admin && npm run build
cd ../expert && npm run build
```

Then copy the `dist/` folders to `/usr/share/nginx/html/` as defined in the Nginx config.
```bash
# Reload nginx config
sudo nginx -s reload
```
