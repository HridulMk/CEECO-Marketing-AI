# CEECO Marketing AI

CEECO International marketing command-centre starter built with Next.js, TypeScript, Django REST Framework and a server-side Groq AI integration.

## Status

The source scaffold is committed to GitHub. This is **not yet a verified live deployment or a production-ready CRM**. The frontend dashboard currently stores lead entries in the browser's local storage; connect the API before treating records as shared team data.

The UI intentionally avoids invented production metrics. Campaign and task screens are currently placeholders for API-backed CRUD. Authentication endpoints and protected Django API endpoints are included, but role/branch administration, complete UI-to-API integration, token refresh in the browser, automated security review and operational controls remain unfinished.

## Structure

- `frontend/` — responsive Next.js dashboard and AI marketing studio
- `backend/` — Django REST API, JWT authentication, lead/campaign/draft/activity models and server-side Groq AI draft generation
- `IMPLEMENTATION_PLAN.md` — local setup, environment matrix, known gaps and deploy checklist
- `backend/render.yaml` — Render service blueprint

## Stack

- Frontend: Next.js App Router, React, TypeScript, custom responsive CSS
- Backend: Django REST Framework, SimpleJWT
- Database: SQLite locally by default; PostgreSQL via DATABASE_URL in hosting
- AI: Groq Chat Completions API, configured only in backend environment
- Intended deployment: Vercel frontend + Render backend + managed PostgreSQL

## Local setup

1. Use Python 3.12+ and Node.js 20+.
2. In `backend/`: install `requirements.txt`, copy `.env.example` to `.env`, run `python manage.py makemigrations marketing`, `python manage.py migrate`, `python manage.py createsuperuser`, then `python manage.py runserver`.
3. In `frontend/`: install packages with `npm install`, copy `.env.example` to `.env.local`, then run `npm run dev`.
4. Run `python manage.py check`, `python manage.py test`, `npm run typecheck` and `npm run build` before any release.

## Required hosting configuration

Frontend environment:
- `NEXT_PUBLIC_API_BASE_URL=https://<your-backend-host>/api`

Backend environment:
- `DJANGO_SECRET_KEY` — strong generated secret
- `DJANGO_DEBUG=False`
- `DATABASE_URL` — managed PostgreSQL connection string
- `DJANGO_ALLOWED_HOSTS` — backend hostname(s)
- `CORS_ALLOWED_ORIGINS` — exact Vercel origin(s), comma-separated
- `GROQ_API_KEY` — private Groq API key; required for AI generation
- `GROQ_MODEL=openai/gpt-oss-120b` — optional; model defaults to this value

Never commit `.env` files or place provider keys in a `NEXT_PUBLIC_*` variable. The AI endpoint returns a service-unavailable response when the server-side key is missing.

## Before team use

Do not import real customer enquiries until you have verified live migrations, authentication, permission boundaries, backups and CORS. Complete branch-based access control, user invite/password-reset flow, rate limiting, audit logging, retention/deletion policies, CSV validation, analytics attribution and deployment smoke tests. Review and approve every AI content draft manually. WhatsApp/Meta publishing and outbound messaging are not integrated.
