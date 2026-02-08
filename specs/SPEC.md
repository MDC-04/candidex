# Candidex – Mini Product Spec (MVP)

## 1. Vision
Candidex is a web-based SaaS application that helps users track, manage, and analyze their job applications. The goal is to make a job search more structured through a pipeline, reminders, and simple analytics.

This document defines the MVP scope. The product is designed to be extensible: additional features can be added later without breaking the core architecture.

## 2. Target users
Primary user: a single candidate (student, junior, or professional) who wants to centralize applications and follow a clear process.

Future: team/workspace mode can be added later, but is out of scope for the MVP.

## 3. MVP scope

### Included in MVP
1. Authentication: register, login, logout
2. Job application management: create, edit, delete
3. Status pipeline: move applications across stages
4. Search and filters: query + filtering by status/source/tags/date range
5. Next action reminders: store a next action date and note per application
6. Dashboard: basic metrics and charts

### Explicitly excluded from MVP (future enhancements)
1. AI scoring or automatic matching
2. Team/workspace collaboration
3. Subscription/billing
4. External integrations (LinkedIn/ATS calendar sync)
5. Push notifications (mobile), browser notifications
6. Advanced analytics (funnels, cohorts), beyond basic metrics

## 4. Key screens (UI)
1. Auth: Login, Register
2. Dashboard: summary metrics, charts
3. Applications list: table view with filters and actions
4. Pipeline board: kanban-style status view
5. Application detail: full application data, notes, links, next action

## 5. Status model (MVP)
Statuses are ordered:
1. APPLIED
2. HR_INTERVIEW
3. TECH_INTERVIEW
4. OFFER
5. REJECTED
6. GHOSTED

Notes:
- REJECTED and GHOSTED are terminal states for reporting, but users may still move applications if needed.
- The model is extensible: additional statuses can be added later (e.g., ON_HOLD, CONTRACT_SIGNED).

## 6. Core user stories
1. As a user, I can create an account and log in to my private workspace.
2. As a user, I can add a job application with company, role, dates, source, and notes.
3. As a user, I can update an application status as the process advances.
4. As a user, I can view applications in a table and filter/search them.
5. As a user, I can view applications in a pipeline/kanban board grouped by status.
6. As a user, I can open an application detail page to see and edit all fields.
7. As a user, I can set a next action date and note (reminder) per application.
8. As a user, I can see upcoming next actions in a dedicated view or dashboard section.
9. As a user, I can see simple analytics (counts by status, weekly trend).
10. As a user, my data is isolated and secure; I cannot access other users’ data.

## 7. Non-functional requirements (MVP)
- Clean UI with Angular Material, responsive for mobile readiness
- REST API, versioned under /api/v1
- Clear validation and error messages
- Docker-friendly local run
- Basic automated checks (lint/test/build) can be added progressively

## 8. Extensibility statement
Candidex is built to evolve. The MVP should be implemented with maintainable code structure and stable API contracts so that future features (AI, teams, integrations, billing, mobile) can be added without major rewrites.
