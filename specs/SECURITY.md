# Candidex – Security Specification (MVP)

## 1. Security goals
- Protect user data (strict isolation by user)
- Secure authentication and authorization
- Provide a clean foundation for future multi-tenant/team features

## 2. Authentication model
MVP uses JWT access tokens:
- access token contains userId and email
- client sends Authorization: Bearer <token> to protected endpoints

Refresh tokens:
- optional for MVP
- can be added later with a /auth/refresh endpoint and a refresh token cookie

## 3. Password security
- Passwords are hashed using BCrypt
- No password is ever logged or returned

## 4. Authorization rules
- Ownership rule: Application.userId must match authenticated userId
- All application queries are filtered by authenticated userId
- Forbidden access returns 403 (not 404) if resource exists but is not owned (implementation choice may vary; MVP can return 404 to avoid information disclosure)

## 5. Token storage (frontend)
Recommended:
- Store access token in memory
- Optionally persist in sessionStorage for refresh on reload
- Avoid localStorage if possible (XSS risk)

Note:
- This choice is extensible. If refresh tokens are added in HttpOnly cookies, the access token strategy can evolve.

## 6. CORS
- Allow frontend origin(s) in dev (http://localhost:4200)
- Restrict in production to the deployed frontend domain
- Allow Authorization header and standard methods (GET, POST, PATCH, DELETE)

## 7. Input validation
- Backend validates all incoming DTOs
- Reject invalid payloads with 400 and structured error format
- Do not trust frontend validation alone

## 8. Logging
- Never log tokens or passwords
- Logs should include request path, status, and correlation id if added later

## 9. Future security extensions (not required in MVP)
- Rate limiting
- Account email verification
- Password reset flow
- Audit logs for updates (who changed what)
- Workspace roles and permissions
