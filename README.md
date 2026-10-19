# Whippie Intern PWA

The progressive web app for DAAR Communications interns and NYSC IT personnel. Built with Next.js 14 (App Router), TanStack Query, Tailwind CSS, and Sonner.

---

## What it does

- **Attendance** — GPS-verified check-in / check-out with geofence enforcement
- **Tasks** — view assigned tasks, start work, submit, respond to change requests
- **Reports** — daily/weekly reports: draft, edit, submit, view HR feedback
- **Notes & Todos** — local-only personal workspace (no sync)
- **Timeline & Documents** — internship milestones and required document checklist
- **Notifications** — real-time feed of HR actions, task updates, approvals
- **Profile** — edit personal info, manage sign-in methods (password + Google)

---

## Auth flow

1. **Signup** — creates account as `UNVERIFIED_EMAIL`, sends verification email via Resend
2. **Verify email** — user clicks link → `/auth/verify-email?token=...` → PWA POSTs token → status becomes `PENDING_HR_VERIFICATION`
3. **HR approval** — HR approves on the web dashboard → status becomes `ACTIVE` → welcome email sent
4. **Login** — smart two-step: enter email → detect auth method (password/google/both/none) → show right UI
5. **Google OAuth** — full-page redirect → `/auth/google/success#token=...` → in-memory token store
6. **Forgot password** → email reset link → `/auth/reset-password?token=...` → new password
7. **Account linking** — add/remove Google or password in Profile → Sign-in methods

### Token strategy

| Token | Storage | Lifetime |
|-------|---------|----------|
| Access token | In-memory (`auth.api.ts`) | 15 min |
| Refresh token | HTTP-only cookie (`whippe_refresh_token`) | 7 days, rotated on use |

On page load, `useSession` tries `GET /auth/me`. On 401, it silently calls `POST /auth/refresh` (cookie sent automatically), gets a new access token, then retries `/auth/me`.

---

## Routes

```
(auth)/
  login/                 ← smart two-step login
  signup/                ← create account
  verify-email/          ← email verification (auto-POSTs ?token=)
  verification-pending/  ← waiting for HR approval
  account-rejected/      ← HR rejected
  forgot-password/       ← request reset email
  reset-password/        ← set new password (?token=)
  google/success/        ← OAuth callback handler (reads #token= fragment)

(app)/                   ← guarded by AppAuthGuard (INTERN + ACTIVE only)
  home/                  ← dashboard
  attendance/            ← check-in/check-out
  tasks/                 ← task list + detail
  reports/               ← report list + create/edit/view
  notes/                 ← local notes & todos
  timeline/              ← timeline + documents
  notifications/         ← notification feed
  profile/               ← profile + sign-in methods
```

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env.local
# Fill in NEXT_PUBLIC_API_URL

# 3. Start dev server
npm run dev
```

The API must be running at `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`).

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | API base URL, e.g. `http://localhost:5000` |

---

## PWA

In **development**, the service worker is disabled (avoids caching confusion). In **production** (`npm run build && npm start`), `next-pwa` generates the service worker automatically into `public/`. The manifest is at `public/manifest.json`.

To test as a PWA locally:
```bash
npm run build
npm start
# Open http://localhost:3000 in Chrome → three-dot menu → Install app
```

---

## Phases completed

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Foundation — design system, shell, API client, ThemeProvider | ✅ |
| 1 | Auth — login, signup, Google OAuth, email verification, forgot/reset password | ✅ |
| 2 | Dashboard — attendance card, tasks summary, progress, notifications feed | ✅ |
| 3 | Tasks + Submissions | ✅ |
| 4 | Reports | ✅ |
| 5 | Notes & Todos (local) | ✅ |
| 6 | Attendance — geofence, check-in/out, history | ✅ |
| 7 | Notifications | ✅ |
| 8 | Timeline, Documents, Profile | ✅ |
| 9 | Network resilience — offline banner, 401 silent refresh | ✅ |
| 10 | PWA hardening — manifest, install prompt, service worker | ✅ |
