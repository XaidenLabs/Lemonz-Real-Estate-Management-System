# Escrow.com integration (sandbox)

This folder contains a minimal integration with Escrow.com using their hosted transaction flow.

## Setup

1. Copy `server/.env.sample` to `server/.env` and fill in the sandbox keys provided by Escrow.com.

2. Install dependencies (if not already installed):

```bash
cd server
npm install
```

3. For local webhook testing, expose your local server using `ngrok` and register the `https://<ngrok-id>.ngrok.io/transactions/webhook/escrow` URL in the Escrow.com sandbox webhook settings.

## Notes

- The implementation creates an `Escrow` model and a small `escrow.service` adapter. The adapter uses an expected REST surface under `ESCROW_COM_API_BASE` but provider-specific field names may differ — inspect sandbox responses and adjust mapping in `controllers/escrow.controller.js`.
- Webhook verification uses `ESCROW_COM_WEBHOOK_SECRET`. The handler expects HMAC-SHA256 signature in header `x-escrow-signature` (or `x-signature`). If Escrow.com uses a different verification scheme, update `services/escrow.service.js` accordingly.
- API endpoints:
  - `POST /api/escrows` — create an escrow and receive `processUrl` inside the created `escrow` document.
  - `GET /api/escrows/:id` — fetch escrow
  - `POST /api/escrows/:id/release` — request release (buyer/admin)
  - `POST /api/escrows/:id/cancel` — cancel (buyer/admin)
  - `POST /api/escrows/:id/dispute` — flag dispute

Webhook endpoints (provider should call one of these):

- `POST /transactions/webhook/escrow` (top-level path)
- `POST /api/transaction/webhook/escrow` (alternate path)

Frontend: the simplest flow is to call `POST /api/escrows` then open the returned `escrow.processUrl` in the device browser using `Linking.openURL(processUrl)` or embed in `react-native-webview`.
