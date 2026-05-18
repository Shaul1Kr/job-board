# Job Board — Claude Code Context

## Project overview

A full-stack job board platform where **employers** can post and manage jobs, and **candidates** can browse and apply. Built as a portfolio project to demonstrate Team Lead-level fullstack skills.

## Tech stack

### Backend

- **Framework:** NestJS (v10+)
- **Database:** MongoDB with Mongoose
- **Auth:** JWT + Passport (`@nestjs/passport`, `passport-jwt`)
- **Validation:** `class-validator` + `class-transformer` on all DTOs
- **Config:** `@nestjs/config` with `.env` files
- **Docs:** Swagger (`@nestjs/swagger`)
- **File uploads:** AWS S3 (for CV/PDF uploads)
- **Testing:** Jest + Supertest

### Frontend

- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS
- **Server state:** React Query (`@tanstack/react-query`)
- **HTTP:** Axios with interceptors
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v6

### Infrastructure

- **Local dev:** Docker Compose (app + MongoDB)
- **Backend deploy:** Render or Railway
- **Frontend deploy:** Vercel
- **Storage:** AWS S3 for file uploads

---

## Project structure

```
job-board/
├── backend/                  # NestJS app
│   ├── src/
│   │   ├── auth/             # AuthModule — register, login, JWT strategy
│   │   ├── users/            # UsersModule — user schema, service
│   │   ├── jobs/             # JobsModule — CRUD, search, filters
│   │   ├── applications/     # ApplicationsModule — apply flow
│   │   ├── common/           # Guards, interceptors, decorators, filters
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── decorators/
│   │   │   └── filters/
│   │   ├── config/           # Config module, env validation
│   │   └── main.ts
│   ├── test/                 # E2E tests
│   ├── .env
│   └── Dockerfile
├── frontend/                 # React + Vite app
│   ├── src/
│   │   ├── api/              # Axios instance + API functions per module
│   │   ├── components/       # Shared UI components
│   │   ├── pages/            # Route-level page components
│   │   ├── hooks/            # Custom React Query hooks
│   │   └── types/            # TypeScript interfaces
│   └── .env
├── docker-compose.yml
└── CLAUDE.md
```

---

## Coding conventions

### NestJS (backend)

- Every module has: `module.ts`, `controller.ts`, `service.ts`, `schema.ts`, `dto/`
- DTOs live in a `dto/` folder inside their module: `create-job.dto.ts`, `update-job.dto.ts`
- Always use `class-validator` decorators on every DTO field — never trust raw input
- Mongoose schemas in `*.schema.ts` — export both the Schema and the Document type
- Services handle all business logic — controllers are thin (only call service methods)
- Use `@ApiTags`, `@ApiOperation`, `@ApiBearerAuth` on every controller for Swagger

### Auth & Guards

- `JwtAuthGuard` protects any route that requires a logged-in user
- `RolesGuard` + `@Roles()` decorator for role-specific access
- Two roles: `employer` and `candidate`
- JWT payload shape: `{ sub: userId, email, role }`
- Never trust the request body for user identity — always read from `req.user` (set by Guard)

### Response shape

All API responses follow this shape:

```typescript
{
  data: T,
  message: string,
  statusCode: number
}
```

Enforced by `TransformInterceptor` globally in `main.ts`.

### Error handling

- Use NestJS built-in `HttpException` subclasses (`NotFoundException`, `UnauthorizedException`, etc.)
- Global `AllExceptionsFilter` catches unhandled errors and returns the standard shape
- Never expose raw MongoDB errors or stack traces to the client

### MongoDB / Mongoose

- Index on `title` and `location` fields in the Job schema for search performance
- Use `$text` index for free-text job search
- Pagination always via `skip` + `limit` query params (default limit: 10)
- Aggregation pipelines only in the service layer, never in the controller

### React (frontend)

- All API calls go through custom hooks in `src/hooks/` (wrapping React Query)
- Axios instance in `src/api/axios.ts` with JWT interceptor (attaches Bearer token automatically)
- Forms use React Hook Form + Zod schema — no manual validation logic
- Loading and error states are always handled — no silent failures
- Protected routes wrapped with `<ProtectedRoute>` component that checks auth state
- Role-based UI: check `user.role` to show/hide employer vs candidate features

---

## MongoDB schemas (quick reference)

### User

```typescript
{ email, passwordHash, role: 'employer' | 'candidate', createdAt }
```

### Job

```typescript
{ title, description, location, type: 'full-time'|'part-time'|'remote', salary?,
  companyName, postedBy: ObjectId(User), isActive: boolean, createdAt }
// Indexes: text index on (title, description), index on location
```

### Application

```typescript
{ job: ObjectId(Job), candidate: ObjectId(User), cvUrl?, coverLetter?,
  status: 'pending'|'reviewed'|'rejected', appliedAt }
// Unique compound index on (job, candidate) — one application per job per user
```

---

## API endpoints (planned)

```
POST   /auth/register
POST   /auth/login

GET    /jobs                  # public — list with search & pagination
GET    /jobs/:id              # public — job detail
POST   /jobs                  # employer only
PATCH  /jobs/:id              # employer only (own jobs)
DELETE /jobs/:id              # employer only (own jobs)

POST   /jobs/:id/apply        # candidate only
GET    /jobs/:id/applications # employer only (own job)

GET    /users/me              # any authenticated user
```

---

## Environment variables

### Backend `.env`

```
MONGO_URI=mongodb://localhost:27017/job-board
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=job-board-cvs
PORT=3000
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:3000
```

---

## 14-day build plan

- [x] Day 1 — Project setup, Docker Compose, MongoDB connection
- [ ] Day 2 — Auth module: register, login, JWT
- [ ] Day 3 — Guards + Roles (JwtAuthGuard, RolesGuard)
- [ ] Day 4 — Jobs CRUD with DTOs and validation
- [ ] Day 5 — Applications module + Mongoose indexes
- [ ] Day 6 — Search & filters + pagination
- [ ] Day 7 — Interceptors + Swagger docs
- [ ] Day 8 — React setup + Auth pages
- [ ] Day 9 — Job listings page with React Query
- [ ] Day 10 — Job detail + Apply flow
- [ ] Day 11 — Employer dashboard
- [ ] Day 12 — Docker + AWS S3 for CV uploads
- [ ] Day 13 — Tests (Jest unit + Supertest E2E)
- [ ] Day 14 — README, deploy, LinkedIn post

---

## How to ask Claude Code for help

When asking for help, always reference the relevant file with `#`. Examples:

- "In `#src/jobs/jobs.service.ts`, add a search method that filters by title and location"
- "In `#src/auth/auth.module.ts`, wire up the JwtStrategy correctly"
- "In `#frontend/src/hooks/useJobs.ts`, add a `useApplyToJob` mutation"

Keep tasks small and file-scoped. One feature at a time works best.
