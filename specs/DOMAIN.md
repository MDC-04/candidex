# Candidex – Domain Model and Business Rules

## 1. Domain overview
Candidex manages job applications for authenticated users. Each record is owned by exactly one user (MVP). Future versions may add workspaces and shared ownership.

## 2. Entities

### 2.1 User
Represents an authenticated user.

Fields:
- id: string (Mongo ObjectId)
- email: string (unique, required, lowercase)
- passwordHash: string (required, never exposed to client)
- fullName: string (optional)
- createdAt: ISO date-time (required)
- updatedAt: ISO date-time (required)

Constraints:
- email must be unique
- password must never be stored in plain text

### 2.2 Application
Represents a job application.

Fields:
- id: string (Mongo ObjectId)
- userId: string (required, owner)
- companyName: string (required, 1..120)
- roleTitle: string (required, 1..120)
- location: string (optional, 0..120)  (e.g., Paris, Remote, Hybrid)
- source: ApplicationSource (required)
- status: ApplicationStatus (required)
- appliedDate: ISO date (optional)
- salaryMin: number (optional, >= 0)
- salaryMax: number (optional, >= 0, salaryMax >= salaryMin if both set)
- currency: string (optional, default "EUR")
- tags: string[] (optional, each 1..30, max 10 tags)
- links: ApplicationLinks (optional)
- notes: string (optional, 0..5000)
- nextAction: NextAction (optional)
- createdAt: ISO date-time (required)
- updatedAt: ISO date-time (required)

### 2.3 ApplicationLinks
Optional links related to an application.
- jobPostingUrl: string (optional, URL)
- companyWebsiteUrl: string (optional, URL)
- resumeUrl: string (optional, URL)
- coverLetterUrl: string (optional, URL)

Notes:
- In MVP, these are only URLs.
- Future: can become file uploads stored in S3 or similar.

### 2.4 NextAction
Reminder associated with an application.
- date: ISO date (required if NextAction exists)
- note: string (optional, 0..300)
- done: boolean (optional, default false)

Notes:
- In MVP, only one next action per application.
- Future: multiple tasks per application can be added.

## 3. Enums

### 3.1 ApplicationStatus
- APPLIED
- HR_INTERVIEW
- TECH_INTERVIEW
- OFFER
- REJECTED
- GHOSTED

Future extensibility:
- ON_HOLD
- CONTRACT_SIGNED
- WITHDRAWN

### 3.2 ApplicationSource
- LINKEDIN
- COMPANY_WEBSITE
- REFERRAL
- JOB_BOARD
- EMAIL
- OTHER

Future extensibility:
- WELCOME_TO_THE_JUNGLE
- INDEED
- GLASSDOOR

## 4. Business rules (MVP)
1. Ownership: every Application must have userId equal to the authenticated user.
2. Validation: companyName and roleTitle are required.
3. Status is required; default status on creation is APPLIED if not provided.
4. Search/filter must never return other users’ data.
5. Updates:
   - userId cannot be changed
   - createdAt is immutable
6. Deletion:
   - only owner can delete
7. Salary range:
   - if salaryMin and salaryMax set, salaryMax >= salaryMin

## 5. Suggested Mongo indexes
Applications:
- { userId: 1, updatedAt: -1 }
- { userId: 1, status: 1, updatedAt: -1 }
- text index (optional MVP): companyName, roleTitle, notes

Users:
- { email: 1 } unique
