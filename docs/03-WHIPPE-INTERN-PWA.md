# Whippe Intern PWA — Application Specification

## 1. Purpose

The Intern PWA is the mobile-first client for interns and NYSC IT personnel.

It provides the daily intern experience without requiring App Store distribution.

---

# 2. Stack

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- TanStack Query
- PWA/service-worker support
- Shared Express API

No direct MongoDB access.

---

# 3. Account Creation and Verification

Intern account creation happens after AIT's physical screening.

Supported signup methods:

- Google account
- manual account signup

New accounts start as:

```text
PENDING_HR_VERIFICATION
```

Google authentication does not equal HR approval.

Until HR verifies the account, the intern must not receive normal active-intern functionality.

Pending accounts that remain unverified for 30 days are deleted by the backend.

The PWA must clearly handle:

- pending verification
- approved
- rejected
- expired/deleted

---

# 4. Core Areas

## Authentication

- login
- logout
- session
- recovery
- profile

## Dashboard

The dashboard should answer:

- Did I check in?
- What tasks are pending?
- What is due?
- Do I need to submit a report?
- Did my supervisor send feedback?
- Is there anything urgent?

## Attendance

Intern starts check-in.

Client collects available signals.

Backend validates.

Result:

- accepted
- rejected
- flagged

Possible signals:

- location
- geofence
- GPS accuracy
- rotating QR
- timestamp
- IP/network risk
- VPN/proxy risk
- browser/device signals
- mock-location indicators where technically available

## Tasks

- list
- details
- progress
- submission
- feedback
- resubmission
- deadlines

## Reports

- create
- edit
- submit
- feedback
- history

## Notes / To-Dos

Personal productivity.

These are not automatically HR-visible.

## Notifications

- task
- deadline
- feedback
- report
- attendance
- completion reminders

## Timeline

- onboarding
- start
- supervisor assignment
- work/report milestones
- evaluation
- completion

## Documents

Relevant intern-facing document status/downloads.

## AI Assistant

Optional later.

Potential uses:

- task explanation
- report structure
- report summary
- questions about accessible Whippe information

---

# 4. UX

- mobile-first
- lightweight
- good on average mobile networks
- clear offline state
- clear loading/error states
- Android Chrome
- iPhone Safari
- installable PWA

Do not attempt to make every feature fully offline.

Attendance remains server-validated.

---

# 5. First Useful Release

An intern should be able to:

> log in → see what matters today → check in → receive/complete work → submit reports → receive feedback → see internship progress.
