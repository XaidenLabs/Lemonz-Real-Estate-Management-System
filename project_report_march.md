# Lemonz Real Estate Management System
## Integration & Stabilization Report

**Date:** March 14, 2026

### Executive Summary
This report summarizes recent debugging, integration, and refactoring efforts aimed at stabilizing the Lemonz backend API and resolving critical blockers with third-party providers, specifically **Payluk** (Escrow & Virtual Accounts) and **Paystack** (Payments), alongside cross-platform file upload fixes for the Expo frontend.

---

### 1. File Upload & ID Verification Stabilization
**Issue:** Android devices encountered `Network request failed` errors, and the Node server crashed with `TypeError: Busboy is not a constructor` during `FormData` ID document uploads. Moreover, iOS users could not scroll the screen to hit the submit button.
**Resolution:**
- **Frontend (Expo):** Implemented `ScrollView` to fix iOS scrolling. Replaced `axios` with the native React Native `fetch` API for all ID photo uploads to properly handle `FormData` boundary definitions, resolving iOS payload corruption.
- **Backend (Node):** Traced the server crash down to a package collision where an incompatible `busboy` v1.6.0 override broke the Express `multer` middleware. Downgraded `multer` to its stable `1.4.5-lts.1` version, completely eliminating the crash.

### 2. VPS Proxy Configuration & IP Whitelisting
**Issue:** Payluk enforces strict IP Whitelisting for Live environments, but local developer machines use dynamic IP addresses.
**Resolution:** 
- Successfully set up and authenticated a static proxy server (`lemonzproxy`) hosted on a VPS (`62.84.182.25`).
- Configured the backend service to route all Payluk API calls through this static proxy using `https-proxy-agent`.
- Confirmed that Payluk successfully whitelists `62.84.182.25` and the proxy does not leak local IP or IPv6 headers.

### 3. Payluk API Troubleshooting & Optimization
**Issue:** The Payluk API continuously rejected requests with `Unauthorized IP address` and `Unauthorized Access` errors, even though the configuration, IP, and headers were totally correct.
**Resolution:**
- Discovered systemic synchronization delays on Payluk's backend regarding API key-to-IP bindings. Through detailed error testing, guided the manual regeneration of Payluk API Keys which forced a database re-sync on their end.
- Discovered Payluk's Sandbox/Test mode uses a different base URL (`staging.api.payluk.ng`) than production.
- **Lazy Provisioning Refactor:** Removed eager Payluk customer creation from user Registration and Login. Implemented a Lazy Provisioning model where `payout.controller.js` only creates a Payluk account on-demand when the user makes their first payment. This improves UX by requesting the required Nigerian `BVN` securely at checkout time rather than at signup.

### 4. Simulation Environment Setup
**Issue:** The app required isolated, safe end-to-end testing without processing real funds.
**Resolution:**
- Populated both frontend and backend `.env.local` files with Test environment keys for Payluk (`sk_test...`) and Paystack (`pk_test...`).
- Configured the backend Payluk adapter to route specifically to Payluk's staging API when running in Dev environments.
- The environment is now perfectly prepped for simulated user payment flow tracking before production launch.
