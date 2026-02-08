# Candidex – REST API Contract (v1)

Base URL:
- /api/v1

All timestamps are ISO 8601. All requests and responses use JSON.

This API is designed to be stable and extensible. New fields may be added in responses without breaking existing clients.

## 1. Auth

### 1.1 Register
POST /api/v1/auth/register

Request:
{
  "email": "user@example.com",
  "password": "strongPassword123",
  "fullName": "Mohamed Chellaf"
}

Response 201:
{
  "user": { "id": "u1", "email": "user@example.com", "fullName": "Mohamed Chellaf" },
  "accessToken": "jwt-access-token"
}

### 1.2 Login
POST /api/v1/auth/login

Request:
{
  "email": "user@example.com",
  "password": "strongPassword123"
}

Response 200:
{
  "user": { "id": "u1", "email": "user@example.com", "fullName": "Mohamed Chellaf" },
  "accessToken": "jwt-access-token"
}

### 1.3 Current user
GET /api/v1/me
Authorization: Bearer <accessToken>

Response 200:
{
  "id": "u1",
  "email": "user@example.com",
  "fullName": "Mohamed Chellaf",
  "createdAt": "2026-02-07T20:00:00Z"
}

## 2. Applications

### 2.1 Create application
POST /api/v1/applications
Authorization: Bearer <accessToken>

Request:
{
  "companyName": "Datadog",
  "roleTitle": "Software Engineer Intern",
  "location": "Paris",
  "source": "LINKEDIN",
  "status": "APPLIED",
  "appliedDate": "2026-02-01",
  "tags": ["spring", "angular"],
  "links": { "jobPostingUrl": "https://..." },
  "notes": "First contact on LinkedIn.",
  "nextAction": { "date": "2026-02-10", "note": "Follow up", "done": false }
}

Response 201:
{
  "id": "a1",
  "userId": "u1",
  "companyName": "Datadog",
  "roleTitle": "Software Engineer Intern",
  "location": "Paris",
  "source": "LINKEDIN",
  "status": "APPLIED",
  "appliedDate": "2026-02-01",
  "tags": ["spring", "angular"],
  "links": { "jobPostingUrl": "https://..." },
  "notes": "First contact on LinkedIn.",
  "nextAction": { "date": "2026-02-10", "note": "Follow up", "done": false },
  "createdAt": "2026-02-07T21:00:00Z",
  "updatedAt": "2026-02-07T21:00:00Z"
}

### 2.2 List applications
GET /api/v1/applications?status=APPLIED&q=datadog&source=LINKEDIN&tag=spring&from=2026-01-01&to=2026-12-31&page=1&size=20&sort=updatedAt,desc
Authorization: Bearer <accessToken>

Query parameters (all optional):
- status: ApplicationStatus
- source: ApplicationSource
- tag: string (single tag)
- q: string (free text)
- from/to: ISO date (appliedDate range)
- page: number (default 1)
- size: number (default 20, max 100)
- sort: field,dir (default updatedAt,desc)

Response 200:
{
  "items": [ { ...ApplicationResponse } ],
  "page": 1,
  "size": 20,
  "totalItems": 53,
  "totalPages": 3
}

### 2.3 Get application by id
GET /api/v1/applications/{id}
Authorization: Bearer <accessToken>

Response 200:
{ ...ApplicationResponse }

### 2.4 Update application (partial)
PATCH /api/v1/applications/{id}
Authorization: Bearer <accessToken>

Request example:
{
  "status": "HR_INTERVIEW",
  "notes": "HR call scheduled.",
  "nextAction": { "date": "2026-02-12", "note": "Prepare interview", "done": false }
}

Response 200:
{ ...ApplicationResponse }

### 2.5 Delete application
DELETE /api/v1/applications/{id}
Authorization: Bearer <accessToken>

Response 204 (no body)

## 3. Dashboard / Analytics (MVP)

### 3.1 Summary metrics
GET /api/v1/dashboard/summary
Authorization: Bearer <accessToken>

Response 200:
{
  "totalApplications": 42,
  "byStatus": {
    "APPLIED": 10,
    "HR_INTERVIEW": 8,
    "TECH_INTERVIEW": 6,
    "OFFER": 1,
    "REJECTED": 12,
    "GHOSTED": 5
  },
  "upcomingNextActions": 4
}

### 3.2 Weekly trend
GET /api/v1/dashboard/weekly-trend?weeks=8
Authorization: Bearer <accessToken>

Response 200:
{
  "weeks": 8,
  "items": [
    { "weekStart": "2026-01-05", "applicationsCreated": 5 },
    { "weekStart": "2026-01-12", "applicationsCreated": 7 }
  ]
}

## 4. Error format (standard)
All errors follow:
{
  "timestamp": "2026-02-07T21:10:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation error",
  "path": "/api/v1/applications",
  "details": [
    { "field": "companyName", "message": "must not be blank" }
  ]
}

Common status codes:
- 400 validation errors
- 401 missing/invalid token
- 403 forbidden (ownership)
- 404 resource not found
