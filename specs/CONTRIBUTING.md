# Contributing to Candidex

This project is currently developed by a single maintainer, but contributions and improvements are welcome through pull requests.

## 1. Setup (high level)
Frontend:
- Angular, Angular Material

Backend:
- Spring Boot
- MongoDB

Local run will be documented in the main README as the project evolves.

## 2. Branching
Recommended:
- main: stable
- feature branches: feature/<short-name>
- fix branches: fix/<short-name>

## 3. Commit message style
Use conventional commits:
- feat: new feature
- fix: bug fix
- chore: tooling or maintenance
- docs: documentation changes
- refactor: refactoring without changing behavior
- test: tests

Examples:
- feat(frontend): add applications table view
- feat(backend): implement JWT authentication
- fix(frontend): handle empty filter state

## 4. Code quality expectations
Frontend:
- Prefer readable components, small services
- Use Angular reactive forms for validation
- Avoid business logic inside components; keep it in services

Backend:
- Controllers are thin
- Services contain use case logic
- Repository layer only handles persistence
- Use validation annotations on DTOs

## 5. Pull request checklist
- Code compiles and runs locally
- No secrets in code
- API changes documented (API.md updated if relevant)
- Basic tests added or updated when reasonable

## 6. Extensibility note
Candidex is designed to evolve. When adding new features, keep backward compatibility in mind, and avoid breaking API contracts under /api/v1.
