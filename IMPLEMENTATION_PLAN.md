# CEECO Marketing AI — implementation and deployment plan

## Objective
A CEECO International marketing command centre for organizing enquiries, creating reviewed marketing content and eventually measuring campaigns across Kanhangad, Mangalore and Sreekandapuram.

## Architecture
- **Frontend:** Next.js App Router + TypeScript; intended for Vercel (frontend/ root).
- **Backend:** Django REST Framework + SimpleJWT (backend/).
- **Database:** SQLite for local development by default; set DATABASE_URL for managed PostgreSQL in production.
- **AI:** OpenAI Responses API called from the backend only. The browser must never receive OPENAI_API_KEY.

## Present starter capabilities
- Responsive workspace UI with section navigation, browser-local lead capture, and CSV export of local records.
- Backend data models and authenticated REST viewsets for leads, campaigns, content drafts and activities.
- JWT obtain/refresh endpoints, public health endpoint, and a server-side AI draft endpoint that persists the returned draft.
- GET /api/dashboard/summary/ provides counts for data visible to the authenticated user.
- UI labels local/demo data and API gaps rather than representing placeholders as real analytics.

## Important limits
This is an MVP scaffold, not a fully tested production CRM. The lead form in the current frontend writes to the current browser's local storage only; it is not yet wired to the API. Campaign/task UI screens are informative empty states, not full CRUD screens. Role-aware visibility currently uses Django's is_staff flag and ownership/assignment filters; a full branch-scoped role model and cross-branch security tests remain work items. JWT access tokens are saved in local storage in the starter UI; add refresh, expiry and stronger session handling before wider team access. Authentication invitations, password reset, rate limiting, audit logs, CSV import validation, analytics attribution, and official Meta/WhatsApp integrations are not complete.

Never enter real customer records until authentication and access permissions are reviewed and verified. Do not publish content directly from AI output: a human must review every draft.

## Local setup
1. Install Python 3.12+ and Node.js 20+.
2. Backend: change to the backend directory, create/activate a virtual environment, install requirements.txt, then run python manage.py makemigrations marketing, python manage.py migrate, python manage.py createsuperuser, and python manage.py runserver.
3. Frontend in another terminal: change to the frontend directory, run npm install, copy .env.example to .env.local, then run npm run dev.
4. To run checks, use python manage.py check and npm run typecheck / npm run build in the corresponding directories.

## Environment matrix

| Variable | Where | Required | Purpose |
|---|---|---|---|
| DJANGO_SECRET_KEY | Backend | Yes for production | Django signing key |
| DJANGO_DEBUG | Backend | Set False in production | Debug behavior |
| DATABASE_URL | Backend | PostgreSQL in production | Database connection string |
| DJANGO_ALLOWED_HOSTS | Backend | Yes for production | Comma-separated hostnames |
| CORS_ALLOWED_ORIGINS | Backend | Yes | Exact frontend origin(s), comma-separated |
| OPENAI_API_KEY | Backend | Only for live AI generation | Private provider credential |
| OPENAI_MODEL | Backend | No | Defaults to gpt-4.1-mini |
| NEXT_PUBLIC_API_BASE_URL | Frontend | Yes for hosted use | Backend base ending in /api |

Do not put secrets in the frontend environment or source files. Values prefixed with NEXT_PUBLIC_ are exposed to browsers.

## Deployment sequence
1. **Render database/service:** connect the GitHub repository, deploy the Python service from the repository. The provided blueprint uses backend/ as the root; manual service creation should use commands that start with cd backend &&. Provision PostgreSQL and set DATABASE_URL.
2. Set DJANGO_SECRET_KEY, DJANGO_DEBUG=False, DJANGO_ALLOWED_HOSTS, CORS_ALLOWED_ORIGINS, OPENAI_MODEL, and optionally OPENAI_API_KEY as backend environment variables. A provider key is not required for the health check.
3. Deploy the Vercel project using frontend/ as root and set NEXT_PUBLIC_API_BASE_URL=https://<render-service-host>/api.
4. Update backend CORS_ALLOWED_ORIGINS to the exact Vercel origin after the frontend URL is known.
5. Run migrations and create a Django superuser. Check /api/health/, JWT login, authenticated CRUD permissions, and AI generation when configured.
6. Do not call it production-ready until the security/tests/operations items above have been completed and a live smoke-test recorded.

## Recovery
Keep migrations in source control once stabilized, take database backups before schema changes, rotate secrets if exposed, and use each host's previous successful deployment for rollback. Do not commit .env files, customer exports or provider keys.
