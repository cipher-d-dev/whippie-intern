# Whippe Intern PWA — Incremental Build Phases

The PWA is built against the shared Express API.

It must not create duplicate backend business logic.

---

# PHASE 0 — PWA Scaffolding

## Objective

Create the mobile-first application skeleton.

## Structure

```text
apps/intern-pwa/
├── app/
│   ├── (auth)/
│   ├── (app)/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
├── features/
├── lib/
│   ├── api/
│   ├── auth/
│   └── pwa/
├── hooks/
├── types/
├── public/
└── package.json
```

## Build

- Next.js
- TypeScript
- Tailwind
- PWA configuration
- API client
- basic mobile shell
- installability metadata
- loading/error boundary

Do not build attendance/tasks yet.

## Definition of Done

The PWA runs, is installable in supported browsers and has a clean mobile shell.

---

# PHASE 1 — Account Creation, Authentication and Verification Status

## Dependency

Backend/Web Phase 1.

## Context

The intern has already completed AIT's physical screening.

The PWA provides account creation after that screening.

Supported signup methods:

```text
Continue with Google
OR
Create account manually
```

Neither method automatically activates the intern.

New accounts start as:

```text
PENDING_HR_VERIFICATION
```

## Build

Create/extend:

```text
features/auth/
features/account-verification/
features/profile/
app/(auth)/login/
app/(auth)/signup/
app/(app)/verification-pending/
app/(app)/profile/
```

The exact Next.js route grouping may follow the existing project structure.

## Signup

Manual signup should collect only information actually required by AIT. Do not invent unnecessary identity fields.

Google signup should authenticate through the backend's selected OAuth implementation. The backend creates/links the Whippe account and places it into pending verification.

## Pending State

After signup, show:

- account created
- waiting for HR verification
- verification status
- expiry date/countdown where useful
- permitted profile information
- logout

Do not show the normal intern dashboard.

## Verification Outcomes

### Approved

```text
PENDING_HR_VERIFICATION
        ↓
ACTIVE
        ↓
Intern dashboard becomes available
```

### Rejected

Show a clear rejected/blocked state. Do not allow active-intern features.

### Expired

If the account reaches the 30-day unverified limit, the backend deletes it. The PWA must gracefully handle the resulting unauthenticated/expired state.

## 30-Day Display

The PWA may display the expiry date or remaining time. This is informational only. The backend is authoritative.

## Tests

- manual signup
- Google signup
- pending state
- pending user blocked from dashboard
- approved user reaches dashboard
- rejected user blocked
- expired/deleted account handled cleanly
- logout
- session expiry

## Definition of Done

A screened intern can create a Whippe account using Google or manual signup, remain in a restricted pending state, and enter the normal intern PWA only after HR approval.

---

# PHASE 2 — Intern Dashboard

## Dependency

Intern record APIs.

## Build

Create:

```text
features/dashboard/
app/(app)/home/
```

Show only available real data:

- attendance status
- pending tasks
- deadlines
- report reminders
- recent feedback
- notifications

Do not invent dashboard metrics.

---

# PHASE 3 — Tasks and Submissions

## Dependency

Web Phase 6.

## Build

Create:

```text
features/tasks/
features/submissions/
app/(app)/tasks/
```

Screens:

- task list
- task detail
- submission
- feedback
- resubmission

## Workflow

```text
Supervisor creates task
        ↓
API stores task
        ↓
Intern PWA fetches task
        ↓
Intern works
        ↓
Intern submits
        ↓
Supervisor reviews in Web
        ↓
Feedback/changes
        ↓
Intern sees result
```

## Tests

- own task access
- cannot access another intern's task
- submit
- duplicate submit handling
- feedback display

---

# PHASE 4 — Reports

## Dependency

Web Phase 7.

## Build

Create:

```text
features/reports/
app/(app)/reports/
```

Implement:

- create
- edit draft
- submit
- view history
- feedback/status

## Network Consideration

Drafts may be safely persisted locally if practical.

Final submission must be confirmed by server.

## Tests

- draft
- submit
- retry
- ownership
- feedback

---

# PHASE 5 — Notes and To-Dos

## Build

Create:

```text
features/notes/
features/todos/
app/(app)/notes/
```

Implement:

- create/edit/delete note
- create/complete/delete to-do

These are personal unless explicitly submitted/shared.

---

# PHASE 6 — Attendance and Presence Verification

## Dependency

Web Phase 8 / attendance API.

## Build

Create:

```text
features/attendance/
app/(app)/attendance/
```

Implement:

- permission explanation
- location acquisition
- accuracy capture
- geofence check request
- QR scanning where configured
- check-in submission
- result state
- previous attendance

## Important

The PWA gathers signals.

The backend decides validity.

Do not place authoritative attendance rules only in the browser.

## Failure States

Handle:

- location denied
- location unavailable
- poor accuracy
- outside geofence
- expired QR
- already checked in
- network failure
- server rejection
- flagged attempt

## Tests

Mock browser location/network conditions and verify each state.

---

# PHASE 7 — Notifications

## Dependency

Web Phase 11.

## Build

Create:

```text
features/notifications/
app/(app)/notifications/
```

Implement:

- list
- read/unread
- related navigation

Push notifications are optional later.

---

# PHASE 8 — Timeline and Documents

## Dependency

Web onboarding/documents and exit work.

## Build

Create:

```text
features/timeline/
features/documents/
app/(app)/timeline/
```

Show:

- onboarding milestones
- supervisor assignment
- important tasks
- reports
- evaluations where appropriate
- completion state
- intern-facing documents

Never expose private HR notes.

---

# PHASE 9 — Network Resilience

## Objective

Improve reliability on inconsistent mobile networks.

## Build

- cached app shell
- retry
- clear offline state
- draft persistence where safe
- duplicate submission protection

Do not attempt complete offline support.

Attendance remains server-authoritative.

---

# PHASE 10 — PWA Hardening

Test:

- Android Chrome
- iPhone Safari
- home-screen installation
- permissions
- session expiry
- poor network
- viewport sizes
- touch interactions
- security boundaries

Fix actual issues found.

Do not add features just for polish.

---

# PHASE 11 — Optional AI

Possible:

- task explanation
- report drafting
- report summary
- permission-aware assistant

AI calls go through the API.

No client-side provider credentials.
