# FogGui Developer Guide

## Overview

FogGui is a Next.js 15 + TypeScript application that provides a web UI for FOG server operations (authentication, group/image selection, multicast start/schedule/cancel, and task monitoring). It uses:

- **App Router** in `src/app`
- **NextAuth (credentials)** for local user auth backed by SQLite (`user.db`)
- **FOG REST API proxy routes** under `src/app/api/**`
- **Client hooks + service layer** for dashboard data loading
- **Startup instrumentation** for DB migrations and a scheduled-task reconciliation job

---

## Top-Level Files and Folders

- **`.env`**: local runtime/environment variables (API URL/tokens, auth secret, disk options, dummy-data toggle).
- **`.gitignore`**: excludes build artifacts, env files, IDE data, and `user.db`.
- **`.idea/`**: IntelliJ/WebStorm project metadata.
- **`README.md`**: high-level technical docs (setup, architecture, API summary).
- **`developer-guide.md`**: this file.
- **`package.json`**: scripts (`dev`, `build`, `start`, `lint`) and project dependencies.
- **`package-lock.json` / `pnpm-lock.yaml`**: lockfiles (both npm and pnpm are present).
- **`pnpm-workspace.yaml`**: pnpm workspace/build settings (`sharp`, `sqlite3` built deps).
- **`next.config.ts`**: Next.js config (currently minimal/default).
- **`next-env.d.ts`**: Next.js TypeScript ambient types.
- **`tsconfig.json`**: TypeScript compiler settings and `@/*` alias to `src/*`.
- **`tailwind.config.ts`**: Tailwind content scan paths + theme token extension.
- **`postcss.config.mjs`**: PostCSS setup with Tailwind plugin.
- **`eslint.config.mjs`**: ESLint flat config (TypeScript rule customization).
- **`seed-admin.js`**: one-off script to create/seed an admin user in SQLite.
- **`user.db`**: SQLite file used for local auth users and scheduled multicast metadata.

### `public/`

- **Purpose**: static assets served directly by Next.js.
- **Dummy data JSON files**:
  - `dummyData.json` (hosts)
  - `dummyGroupData.json` (groups)
  - `dummyGroupAssociation.json` (group-to-host links)
  - `dummyImageData.json` (images)
  - `dummyTaskData.json` (task data)
- **UI icons/assets**: `favicon.ico`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.

---

## Source Code (`src/`)

### `src/instrumentation.ts`

- Next.js server-start hook (`register()`).
- Runs DB migrations and starts the reconciliation background job in Node runtime.

### `src/middleware.ts`

- Route-guard middleware using JWT from NextAuth.
- Protects `/dashboard` and `/admin*`; redirects unauthenticated users to `/` and non-admins away from admin routes.

### `src/app/` (App Router)

- **`layout.tsx`**: root app layout; loads global CSS, server session, session provider, and top menu wrapper.
- **`page.tsx`**: login page (credentials sign-in via NextAuth).
- **`dashboard/page.tsx`**:
  - Main multicast control UI.
  - Uses dashboard/task/session hooks.
  - Starts/schedules multicast and cancels active/scheduled sessions.
- **`userview/page.tsx`**: authenticated user page for changing password.
- **`admin/create-account/page.tsx`**: admin page to create local user accounts.

---

## API Layer (`src/app/api/`)

### Auth and DB

- **`database.ts`**:
  - Opens SQLite DB.
  - Initializes `users` table and default admin account.
  - Exposes `runMigrations()` for `scheduled_multicast_tasks` table.
- **`auth/[...nextauth]/route.ts`**: NextAuth GET/POST handler passthrough.
- **`users/route.ts`**: reads local users from SQLite.
- **`create-account/route.ts`**: creates local user with hashed password (`bcryptjs`).
- **`change-password/route.ts`**: validates existing password and updates hash.

### FOG Proxy Endpoints (read operations)

- **`groups/route.ts`** → `GET /fog/group`
- **`groupassociations/route.ts`** → `GET /fog/groupassociation`
- **`hosts/route.ts`** → `GET /fog/host`
- **`images/route.ts`** → `GET /fog/image`
- **`tasks/route.ts`** → `GET /fog/task`
- **`tasks/active/route.ts`** → `GET /fog/task/active`

### Action Endpoints

- **`actions/list/tasktype/route.ts`**: list task types from FOG.
- **`actions/tests/route.ts`**: connectivity/test endpoint (currently fetches `/fog/group/41`).
- **`actions/multicast/route.ts`**:
  - `POST`: immediate start or scheduled multicast, depending on payload.
  - `DELETE`: cancel active multicast session.
- **`actions/multicast/sessions/route.ts`**: list active multicast sessions.
- **`actions/multicast/scheduled/route.ts`**:
  - `GET`: list scheduled tasks from FOG.
  - `DELETE`: cancel scheduled multicast task (also marks local reconciliation record as cancelled).

---

## UI Components (`src/components/`)

- **`MenuBar.tsx`**: top navigation with role-aware links and logout flow.
- **`MenubarWrapper.tsx`**: hides menu on login page and while session is loading.
- **`SessionProviderWrapper.tsx`**: wraps app with NextAuth `SessionProvider`.
- **`DashboardSelectField.tsx`**: reusable select control used by the dashboard left panel.
- **`DashboardSectionHeader.tsx`**: right-panel section title, badge, and cancel action UI.
- **`DashboardEmptyState.tsx`**: empty-state placeholder for no selected group/no data.
- **`DashboardScheduledTaskCard.tsx`**: selectable scheduled-task row/card rendering.
- **`DashboardActiveHostsCard.tsx`**: active host task card rendering.

---

## Client Hooks (`src/hooks/`)

- **`useDashboardData.ts`**: parallel fetch of groups/images/hosts/group associations.
- **`useGroups.ts`**: groups list state + loading/error.
- **`useHosts.ts`**: hosts list state + loading/error.
- **`useImages.ts`**: images list state + loading/error.
- **`useGroupAssociations.ts`**: group-association state + loading/error.
- **`useActiveTasks.ts`**: active task state + refetch; includes 10-second polling interval.
- **`useMulticastSessions.ts`**: multicast sessions state + refetch.
- **`useScheduledMulticast.ts`**: scheduled tasks state + refetch.

---

## Service Layer (`src/services/`)

These are fetch wrappers consumed by hooks. They map API/dummy payloads into typed data.

- **`groupServices.ts`**: loads groups from `/api/groups` or `dummyGroupData.json`.
- **`imageServices.ts`**: loads images from `/api/images` or `dummyImageData.json`.
- **`hostServices.ts`**: loads hosts from `/api/hosts` or `dummyData.json`.
- **`groupAssociationServices.ts`**: loads associations from `/api/groupassociations` or dummy JSON.
- **`activeTaskServices.ts`**: loads active tasks from `/api/tasks/active`.
- **`multicastServices.ts`**:
  - reads active multicast sessions from `/api/actions/multicast/sessions`.
  - reads scheduled tasks from `/api/actions/multicast/scheduled`.
  - creates multicast sessions (`POST /api/actions/multicast`).
  - cancels active sessions and scheduled tasks (`DELETE` endpoints).

---

## Core Libraries (`src/lib/`)

- **`auth-options.ts`**:
  - NextAuth credentials provider config.
  - Validates users from SQLite + bcrypt.
  - Adds `id`, `username`, `role` to JWT/session.
- **`db.ts`**:
  - `openDb()` helper using `sqlite` package.
  - Promise wrappers (`dbRun`, `dbAll`) around sqlite3 operations.
- **`fogApi.ts`**:
  - Shared FOG fetch helper with required FOG auth headers.
  - Throws on non-OK HTTP responses.
- **`fogTasks.ts`**:
  - Domain logic for starting/scheduling/canceling multicast tasks.
  - Updates FOG hosts/groups and stores scheduled-task metadata in local DB.
- **`reconScheduledTask.ts`**:
  - Background reconciliation loop (every 60s).
  - Finds upcoming scheduled tasks and pre-applies correct image/kernel device to hosts.
- **`formatTime.ts`**: normalizes UI datetime-local input into FOG payload format.
- **`taskStates.ts`**: shared task-state label/color map for UI rendering.
- **`errorHandler.ts`**: handle errors catching.

---

## Styling (`src/styles/`)

- **`globals.css`**: Tailwind layers + base body styles + utility classes for buttons/table/heading.

---

## Type Definitions (`src/types/`)

- **`group.ts`**: `Group` model.
- **`groupassociation.ts`**: group-to-host association model.
- **`host.ts`**: `Host` model.
- **`image.ts`**: image model + related embedded FOG types.
- **`task.ts`**: task, active task, multicast session, scheduled task payload/models.
- **`next-auth.d.ts`**: NextAuth module augmentation for custom `Session.user` and `User` fields.

---

## Runtime Flow (High Level)

1. App starts → `instrumentation.ts` triggers DB migration + reconciliation scheduler.
2. User signs in at `/` via NextAuth credentials backed by SQLite users table.
3. Dashboard hooks call services, which call internal API routes.
4. API routes proxy to FOG endpoints or local DB (SQLite for users and scheduled task metadata).
5. Multicast POST/DELETE APIs execute orchestration in `lib/fogTasks.ts`.
6. Reconciliation job continuously guards scheduled-task image consistency before execution.

---

## Notes for Contributors from Dev Le

- Use `NEXT_PUBLIC_USE_DUMMY_DATA=true` to run dashboard with `public/*.json` mock data.
- Keep all FOG HTTP logic inside `src/lib/fogApi.ts` + route handlers for consistency.
- Prefer extending `src/services/*` + `src/hooks/*` when adding dashboard data sources.
- DB schema additions should be appended via `runMigrations()` in `src/app/api/database.ts`.
- Due to FogAPI documentation gaps, trial-and-error and reverse engineering from the FOG web app (`<ip_address>/fog/management/index.php?node=home`) are practical approaches for payload discovery.
- The simplified API documentation can be found here: `https://news.fogproject.org/simplified-api-documentation/`
- The forum is also a good source for troubleshooting and fixes: `https://forums.fogproject.org/`
