# Changelog & Release Engineering Specification (v1.0.0)

## Version Tag: `v1.0.0-rc1`

## Release Summary
This release transitions Blueprint Advisor from prototype/MVP status to a production-ready client-advisory platform. All major security flaws (IDOR, session leakage, unseparated secrets, and rate limiters) have been completely resolved. Infrastructure, environment configs, storage buckets, and mobile capabilities are fully operational. Payments are simulated locally in Demo Mode.

---

## 1. Changelog

### Security Remediation (P0)
- **IDOR Protection**: Resolved access control bypass on `/api/documents/:id/download`, `/api/documents/by-request/:requestId`, and request updates. Verified resource ownership check middleware.
- **JWT Key Separation**: Segregated access keys (`JWT_ACCESS_SECRET`) and refresh keys (`JWT_REFRESH_SECRET`).
- **Session Revocation**: Implemented refresh token DB persistence in the `Session` table. Invalidation matches both active refreshes and `/api/auth/logout`.
- **OTP Brute-Force Block**: Limited OTP verification attempts to 3. Codes are wiped upon third failure.
- **API Rate Limiter**: Added express-rate-limit to `/api/auth/send-otp` (5 reqs/15m), `/api/auth/verify-otp` (10 reqs/15m), and general data routes (100 reqs/15m).

### Infrastructure & Environments
- **Health Checks**: Implemented health checks (`/health`), system status (`/ready`), and Node process monitoring (`/live`).
- **Structured Logging**: Created a correlation-aware JSON console logger via AsyncLocalStorage to attach `requestId` and `correlationId` headers.
- **Observability Metrics**: Added `/api/metrics` to expose requests count, average latency, and active session counts.
- **Supabase Storage**: Bound backend document management to Supabase buckets with signed upload and download URL generation.

### Mobile & Frontends
- **Privacy & Terms pages**: Built dynamic inline Compliance Modal under settings supporting Privacy policies, Terms of Service, Data retention policies, and Account Deletion flows.
- **Account Deletion**: Added a secure account purge API (`DELETE /api/auth/account`) which cascade-deletes user profile, documents, and sessions.
- **Android Capabilities**: Synced `AndroidManifest.xml` camera, notification, audio, and storage permissions.

---

## 2. Release Artifacts
1. **Frontend Compiled Bundle**: `/frontend/dist/`
2. **Backend Server Executables**: `/backend/dist/`
3. **Database Setup Migration**: `/backend/prisma/schema.prisma`
4. **Android Native Manifest**: `/frontend/android/app/src/main/AndroidManifest.xml`

---

## 3. Rollback Procedures

### Step 1: Database Migration Rollback
If the schema upgrade causes runtime issues, execute the prisma migration rollback:
```bash
npx prisma migrate resolve --rolled-back "20260711012546_init"
```

### Step 2: Deployment Reversion
- **Render Backend**: Select the previous successful deploy commit and click "Rollback to this deploy" in the Render web dashboard.
- **Vercel Frontend**: Select the previous stable deployment history build and click "Redeploy to Production".

### Step 3: Local Storage / State Reset
If client sessions are corrupted during rollback, clear the local cache:
```javascript
localStorage.clear();
```
