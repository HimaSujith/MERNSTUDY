# Lead CRM

A lead management CRM for property consultants — lead pipeline, follow-ups, and reminders. Built with the MERN stack (MongoDB, Express, React, Node.js) for a single agency with admin / manager / agent roles.

## Stack

- **Backend**: Node.js, Express, Mongoose, JWT auth (access + refresh), bcrypt, node-cron, nodemailer
- **Frontend**: React (Vite), Tailwind CSS, React Router, TanStack Query, axios, Recharts
- **Tests**: Jest + Supertest + mongodb-memory-server (backend)

## Project layout

```
/server   Express API (src/config, models, controllers, routes, middleware, services)
/client   React frontend (Vite)
```

## Prerequisites

- Node.js 20+
- A MongoDB instance — any of:
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) free tier (recommended, no local install)
  - Local MongoDB via Docker: `docker compose up -d` (uses the included `docker-compose.yml`)
  - A local MongoDB Community Server install

## Setup

1. Install dependencies (from the repo root — this is an npm workspaces monorepo):
   ```
   npm install
   ```

2. Configure the backend:
   ```
   cp server/.env.example server/.env
   ```
   Edit `server/.env`:
   - `MONGO_URI` — your MongoDB connection string
   - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — set to long random strings (don't use the placeholders in production)
   - `SMTP_*` — your SMTP credentials for reminder emails (use [Ethereal](https://ethereal.email/) for a free disposable dev inbox, or leave blank to skip email sending and rely on in-app notifications only)
   - `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — credentials for the first admin account

3. Configure the frontend:
   ```
   cp client/.env.example client/.env
   ```
   The default (`VITE_API_URL=/api`) works out of the box with the Vite dev proxy — no changes needed for local dev.

4. Seed the first admin user:
   ```
   npm run seed:admin
   ```

5. Start both servers:
   ```
   npm run dev
   ```
   - API: http://localhost:5000
   - App: http://localhost:5173

6. Log in with the `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` you set in `server/.env`. As admin, create manager and agent accounts under **Agents & Managers** — there is no public self-registration by design.

## How roles work

- **Admin** — sees and manages everything; only admin can create other admins/managers, reassign roles, or delete leads.
- **Manager** — sees their own leads plus their direct reports' leads (set via a user's `reportsTo`); can create agent accounts and reassign leads within their team.
- **Agent** — sees only leads assigned to them.

## Reminders

A cron job (`REMINDER_CRON_SCHEDULE` in `.env`, default every 5 minutes) sweeps pending follow-ups due within 30 minutes or overdue, creates an in-app notification, and sends a reminder email. The in-app notification bell polls every 60 seconds — no websockets needed at this scale.

## Tests

```
npm run test:server
```

Runs against an in-memory MongoDB (no real database needed) and is fully offline (no real SMTP calls).

## Notes

- If your project path ever contains special shell characters (e.g. `&`), Windows `.cmd` shims used by `npm`/`npx`/`nodemon`/`vite` will break. Keep the path plain.
- The reminder cron is in-process and assumes a single server instance. If you ever scale to multiple instances, set `ENABLE_CRON=false` on all but one to avoid duplicate reminder emails.
- If MongoDB Atlas fails to connect with `querySrv ECONNREFUSED` even though your connection string is correct, it's usually a network/corporate DNS server that won't resolve `*.mongodb.net` SRV records (public DNS resolves them fine). Set `DNS_SERVERS=8.8.8.8,1.1.1.1` in `server/.env` to work around it — already applied in this project's config.
