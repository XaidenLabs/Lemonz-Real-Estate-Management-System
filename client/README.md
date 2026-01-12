# Overview

- **Project:** Mobile frontend for LPMS (React Native / Expo project located in `client/`).
- **Purpose:** App for browsing and managing properties, messaging, payments and subscriptions (used by users and proprietors).

## Quick Start

- Install dependencies: `npm install` or `yarn` inside the `client` folder.
- Copy environment sample: `cp .env.sample .env` and edit values as needed.
- Start development server (Expo): `npm start`.
- Open the app on a device/emulator using Expo, or run `npm run android`.

## Environment

Place runtime config in `client/.env` (see `client/.env.sample`).

## Folder Layout

- `app/` - file-based screens and route layout (`(auth)`, `agent`, `user` folders).
- `components/` - reusable UI components split by feature (agent, common, user).
- `assets/` - images, illustrations, icons and static assets.
- `contexts/` - React Contexts (AuthContext, ChatContext, PreferencesContext, PropertyContext, ReviewContext).
- `services/` - small service helpers and API wrapper (`api.js`, `countryApi.js`, `geocode.js`, etc.).
- `config/` - app-level configuration (`index.js`).

## Key Commands

- Install: `cd client && npm install`.
- Start (Expo / Metro): `npm start`.
- Android: `npm run android`.
- Build (EAS / managed workflow): `eas build --platform android` (see `eas.json`).

## Development Notes

- Use `contexts` to add or modify cross-screen state (Auth, Chats, Preferences).
- `services/api.js` contains the configured API client; keep the base URL and auth handling consistent with backend expectations.
- When adding native modules or permissions, update `android/` and any EAS config and note required steps in this README.

---

See `client/.env.sample` for example environment variables.
