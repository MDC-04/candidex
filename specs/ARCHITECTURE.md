# Candidex – Architecture and Conventions

## 1. Repository structure (mono-repo)
candidex/
  frontend/
    candidex-frontend/
  backend/
    candidex-backend/
  specs/
    (this folder)

This structure is chosen for simplicity and portfolio readability. It can later be split into separate repositories if needed.

## 2. Frontend architecture (Angular)
Recommended structure inside src/app:
- core: singleton services, auth, interceptors, guards, config
- shared: reusable UI components, pipes, directives
- layout: shell layout (sidenav + toolbar)
- pages: route-level components (dashboard, applications, auth)
- features (optional later): isolated domains, lazy loaded modules

Routing rules:
- Public routes: /login, /register
- Protected routes: /dashboard, /applications, /pipeline, /applications/:id

UI stack:
- Angular Material for consistency and fast delivery
- Responsive layout (desktop first but mobile ready)

State:
- MVP can use simple service state + RxJS
- Future: NgRx can be added if complexity grows

## 3. Backend architecture (Spring Boot)
Recommended layers:
- web: controllers + request/response DTOs
- application: services (use cases), business rules, orchestrations
- domain: domain models, enums
- infrastructure: repositories, database configuration, security implementation details

Guidelines:
- Controllers contain no business logic; they validate input and delegate to services
- Services handle ownership checks and orchestration
- Repositories are Spring Data Mongo repositories
- DTOs are separated from persistence objects (avoid leaking internal model details)
- All endpoints are under /api/v1

## 4. Coding conventions
- Use consistent naming: Application, ApplicationStatus, ApplicationSource
- Prefer explicit DTOs: ApplicationCreateRequest, ApplicationUpdateRequest, ApplicationResponse
- Validation:
  - Backend: javax/jakarta validation annotations
  - Frontend: reactive forms validation mirrored from backend constraints
- Dates:
  - appliedDate and nextAction.date are ISO date strings (YYYY-MM-DD)
  - createdAt, updatedAt are ISO date-time strings

## 5. Extensibility
The architecture must support future features:
- Workspaces and roles (owner/member)
- Multiple next actions per application
- File uploads (resume/cover letter)
- AI assistant and scoring
- Mobile client consuming the same API

The MVP should avoid hardcoding assumptions that would block these evolutions (for example, keep API versioning and consistent DTO boundaries).
