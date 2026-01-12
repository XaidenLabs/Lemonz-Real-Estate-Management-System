# Overview

- **Project:** Backend API for LPMS (Node.js + Express, located in `server/`).
- **Purpose:** Provide REST endpoints for user management, property listings, messaging, payments, subscriptions, escrow and transactions.

## Tech Stack

- Node.js (Express)
- MongoDB (Mongoose models in `models/`)
- Controllers in `controllers/`, routes in `routes/` and services in `services/`.

## Quick Start

- Install dependencies: `cd server && npm install`.
- Copy sample env: `cp .env.sample .env` and fill in real values (see below).
- Start server in development: `npm run dev` or `npm start` depending on scripts in `package.json`.

## Environment Variables

Put secrets and configuration in `server/.env` (see `server/.env.sample`). Common important values:

- `PORT` - Port for server (example: `3000`).
- `MONGO_URI` - MongoDB connection string.
- `JWT_SECRET` - Secret used to sign JWT tokens.
- `FRONTEND_URL` - Frontend base URL for CORS or email links.
  -- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - SMTP settings for outgoing emails (Gmail recommended; use app password).
- `EMAIL_USER` / `EMAIL_PASSWORD` - SMTP credentials (for Gmail use an app password). Configure `SMTP_HOST`/`SMTP_PORT`/`SMTP_SECURE` or use defaults in `server/.env.sample`.
- `EMAIL_FROM` - Optional: default from address used for outgoing emails (falls back to `SMTP_USER`).
- `PAYLUK_API_KEY` - Payluk (escrow) API key for escrow operations.
- `PAYLUK_API_BASE` - Base URL for Payluk API (e.g. https://api.payluk.ng).
- `PAYLUK_WEBHOOK_SECRET` - Webhook secret to verify Payluk (escrow) webhooks.
- `PAYLUK_WEBHOOK_ALGO` - Optional: HMAC algorithm for webhook verification (`sha256` or `sha512`). Default: `sha256`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Image upload provider (optional).

## Folder Layout

- `controllers/` - Express route handlers per feature.
- `models/` - Mongoose schema definitions (User, Property, Transaction, Chat, etc.).
- `routes/` - Route definitions wiring controllers.
- `services/` - Business logic / external integrations (escrow.service, id-validation.service, payout.service).
- `middlewares/` - Auth, file upload, verification middleware.
- `utils/` - Utilities and helpers.

## Database & Migrations

- This project uses MongoDB. Provide a running MongoDB instance and set `MONGO_URI` accordingly.
- There is no built-in migration tool in the repo; apply schema changes carefully and consider using a migration library if needed.

## Key Commands

- Install: `cd server && npm install`.
- Dev start (common): `npm run dev` (watch mode) — check `server/package.json` for actual scripts.
- Production start: `npm start`.

## Testing & Seeding

- If you add seed scripts, put them under `scripts/` and document usage here.

## Security & Deployment Notes

- Keep `JWT_SECRET` and payment provider keys secret.
- For production, enable secure TLS, proper CORS and rate limiting.

---

See `server/.env.sample` for example environment entries.
