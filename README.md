# CEECO Marketing AI

CEECO International marketing command-center starter (MVP) with a Next.js frontend and Django REST API.

## Project status

This repository is being initialized from the CEECO Marketing AI starter. It is an implementation starter, not yet a verified production deployment. Do not enter real customer data or production secrets until authentication, access controls, tests, migrations, and live deployment have been verified.

## Architecture

- `frontend/` — Next.js App Router + TypeScript frontend
- `backend/` — Django REST Framework API
- Intended hosting: Vercel frontend, Render backend, managed PostgreSQL
- AI key is configured server-side only; never commit `.env` files or expose secrets through `NEXT_PUBLIC_*` variables.

## Local setup

See `IMPLEMENTATION_PLAN.md` and `CODING_PROMPT.md` for the implementation and deployment checklist. Copy each `.env.example` file to a local environment file and fill secrets locally; do not commit these files.

## Deployment checklist

1. Configure Vercel with `frontend/` as the root directory.
2. Configure Render with `backend/` and provision PostgreSQL.
3. Set backend secrets (`DJANGO_SECRET_KEY`, `DATABASE_URL`, AI provider key, allowed hosts, and CORS origins) in Render's environment dashboard.
4. Set the frontend API base URL in Vercel.
5. Run database migrations and create an admin account.
6. Verify health, login, permissions, CRUD, and AI endpoints against the live deployment before team use.

## Limitations

Some dashboard metrics may be demonstration data. External social publishing, messaging, email sending, and third-party lead integrations are not enabled unless explicitly implemented and configured. Add rate limiting, backups, audit logs, monitoring, tests, and data-consent checks before production use.
