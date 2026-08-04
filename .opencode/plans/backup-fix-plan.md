# Backup & Restore Fix Plan

## Diagnosis (verified live)
All backup APIs return **403 for every user** because the middleware sets `x-user-role` = **username** (`superadmin`), while the 5 backup routes compare `ctx.username` against the role names `"Owner"`/`"Admin"`. Result: `GET /api/backup?type=dashboard` → 403, `GET /api/backup/cloud` → 403 (proven via curl).

Three blockers:
1. **403 role-check bug** — all backup routes (local + cloud) unusable.
2. **B2_KEY_ID was empty** — cloud provider fell back to MockStorageProvider. (User has now added it; verify `grep B2_KEY_ID .env`.)
3. **Scheduler dead** — `createDailyScheduleJobs()`/`scheduleBackupJob()` never called; running dev server also predates `instrumentation.ts`, so the scheduler isn't loaded until restart.

Environment that already works: mysqldump/mysql binaries, all 5 backup tables exist, `@aws-sdk/client-s3` installed, Prisma client generated, dev server up (PID 33213).

## Changes

### 1. `src/lib/company-context.ts` — add shared role helpers
```ts
import { prisma } from "@/lib/prisma";

export async function getUserRole(ctx: CompanyContext): Promise<string> {
  const uc = await prisma.userCompany.findFirst({
    where: { userId: ctx.userId, companyId: ctx.companyId },
    include: { role: { select: { name: true } } },
  });
  return uc?.role?.name || "";
}
export async function isOwner(ctx): Promise<boolean> { return (await getUserRole(ctx)) === "Owner"; }
export async function isAdmin(ctx): Promise<boolean> { const r = await getUserRole(ctx); return r === "Owner" || r === "Admin"; }
```
(Same pattern as `src/app/api/company/settings/route.ts`.)

### 2. Fix role checks in the 5 backup route files
- `src/app/api/backup/route.ts` — replace `requireAdminRole()` (header read) with `isAdmin(ctx)` in GET/POST/PUT.
- `src/app/api/backup/[id]/route.ts` — replace local `isAdmin(ctx.username)` with `isAdmin(ctx)` in GET/DELETE.
- `src/app/api/backup/restore/route.ts` — replace `ctx.username !== "Owner" && ...` with `!await isAdmin(ctx)`.
- `src/app/api/backup/cloud/route.ts` — GET → `isOwner(ctx)`; POST → `isAdmin(ctx)`.
- `src/app/api/backup/retry-upload/route.ts` — replace username check with `isAdmin(ctx)`.

### 3. Wire the scheduler
- `src/lib/backup/scheduler.ts` — call `createDailyScheduleJobs()` inside `startScheduler()` (after initial `processScheduledBackups()`), and also once after settings PUT when `autoBackupEnabled` turns on.
- `src/app/api/backup/route.ts` PUT handler — after upserting setting, if `autoBackupEnabled` is true, call `scheduleBackupJob()` for today's `backupTime`.

### 4. Restart dev server
Kill PID 33213, `nohup npm run dev > /tmp/nextdev.log 2>&1 &` so instrumentation loads the scheduler.

### 5. Verify local backup E2E
- Login as superadmin, generate token, `POST /api/backup` → expect success, file in `storage/backups/6/`, history row, logs.
- `GET /api/backup?type=dashboard`, `?type=history`, download via `GET /api/backup/[id]`, settings `PUT`, `DELETE`, restore history `GET`.
- Confirm no 403s.

### 6. Verify cloud E2E (B2_KEY_ID now present)
- `PUT /api/backup` with `cloudBackupEnabled: true` → `POST /api/backup/cloud {backupId}` → expect upload, CloudBackup row, `uploadStatus=UPLOADED`.
- `GET /api/backup/cloud` → status/usage. Retry path via `POST /api/backup/retry-upload`.

### 7. Update AGENTS.md
Record the `getUserRole` helper convention (never read role from `x-user-role`; it is the username) and B2 env var requirement.

## Notes
- Do NOT modify the frontend (approved/final).
- Reuse `runBackup`/`runRestore`/`uploadToCloud` from `backup-utils.ts` as-is.
