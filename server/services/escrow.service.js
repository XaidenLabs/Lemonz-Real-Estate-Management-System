const axios = require("axios");
const crypto = require("crypto");
const FormData = require("form-data");

const DEFAULT_BASE = "https://api.payluk.ng/v1";
const API_BASE = (process.env.PAYLUK_API_BASE || DEFAULT_BASE).replace(
  /\/+$/,
  ""
);
const API_KEY = process.env.PAYLUK_API_KEY || "";
const WEBHOOK_SECRET = process.env.PAYLUK_WEBHOOK_SECRET || "";
const WEBHOOK_ALGO = (
  process.env.PAYLUK_WEBHOOK_ALGO || "sha256"
).toLowerCase();
const WEBHOOK_HEADER = "x-payluk-signature";

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}),
    "Content-Type": "application/json",
  },
});

function wrapAxiosError(err, ctx) {
  const info = {
    message: err.message,
    ctx,
    status: err.response?.status,
    data: err.response?.data,
  };
  const e = new Error(JSON.stringify(info));
  e.original = err;
  return e;
}

function _tryRequestsSequentially(requestFns) {
  // requestFns: array of async functions that perform axios calls
  return (async () => {
    // MOCK MODE: If no API key is provided, define a mock response.
    if (!API_KEY || API_KEY === "undefined" || API_KEY === "") {
      console.warn("Payluk API Key missing - MOCKING RESPONSE");
      return {
        success: true,
        message: "Mock successful response",
        data: {
          id: "mock-provider-id-" + Date.now(),
          transactionId: "mock-tx-" + Date.now(),
          checkout_url: "https://example.com/checkout-mock",
          process_url: "https://example.com/process-mock",
          status: "success",
        },
      };
    }

    let lastErr;
    for (const fn of requestFns) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        // if 4xx/5xx try next, otherwise bubble up after last
      }
    }
    throw wrapAxiosError(
      lastErr || new Error("no-attempts-done"),
      "sequentialRequests"
    );
  })();
}

// Helper to fetch image stream
async function getFileStream(url) {
  try {
    const response = await axios.get(url, { responseType: "stream" });
    return response.data;
  } catch (err) {
    console.warn("Image fetch failed for escrow:", err.message);
    return null;
  }
}

async function createTransaction(payload) {
  // MOCK MODE: If no API key is provided, define a mock response.
  if (!API_KEY || API_KEY === "undefined" || API_KEY === "") {
    console.warn("Payluk API Key missing - MOCKING RESPONSE");
    return {
      success: true,
      message: "Mock successful response",
      data: {
        id: "mock-provider-id-" + Date.now(),
        transactionId: "mock-tx-" + Date.now(),
        checkout_url: "https://example.com/checkout-mock",
        process_url: "https://example.com/process-mock",
        status: "success",
      },
    };
  }

  const {
    amount,
    purpose,
    description,
    whoPays = "buyer",
    maxDelivery = 7,
    deliveryTimeline = "days",
    imageUrl,
    sellerId,
    customerId, // NEW: Accept explicit customerId
  } = payload;

  const form = new FormData();
  form.append("amount", String(amount));
  form.append("purpose", purpose || "Property Escrow");
  form.append("description", description || "Payment for property");
  form.append("whoPays", whoPays);
  form.append("maxDelivery", String(maxDelivery));
  form.append("deliveryTimeline", deliveryTimeline);

  if (imageUrl) {
    const stream = await getFileStream(imageUrl);
    if (stream) {
      form.append("imageUrl", stream);
    }
  }

  const pathCandidates = ["/escrow/create"];

  return _tryRequestsSequentially(
    pathCandidates.map((p) => async () => {
      // Merge headers: Manual auth + customer-id + form headers
      const apiHeaders = {
        Authorization: `Bearer ${API_KEY}`,
        "customer-id": customerId || sellerId, // Use explicit customerId if available, fallback to sellerId (old logic?) or let it fail
        ...form.getHeaders(),
      };

      // Use the raw axios import (not axiosInstance) to avoid default header conflicts
      const resp = await axios.post(`${API_BASE}${p}`, form, {
        headers: apiHeaders,
      });
      return resp.data;
    })
  ).catch((err) => {
    throw wrapAxiosError(err, "createTransaction");
  });
}

async function getTransaction(id) {
  if (!id) throw new Error("transaction id required");
  const pathCandidates = [
    `/escrow/details/${encodeURIComponent(id)}`,
    `/escrow/${encodeURIComponent(id)}`,
    `/escrows/${encodeURIComponent(id)}`,
  ];
  return _tryRequestsSequentially(
    pathCandidates.map((p) => async () => {
      const resp = await axiosInstance.get(p);
      return resp.data;
    })
  ).catch((err) => {
    throw wrapAxiosError(err, "getTransaction");
  });
}

async function requestRelease(transactionId, payload = {}) {
  if (!transactionId) throw new Error("transactionId required");
  const pathCandidates = [
    `/escrow/${encodeURIComponent(transactionId)}/release`,
    `/escrow/release`,
    `/escrows/${encodeURIComponent(transactionId)}/release`,
  ];
  return _tryRequestsSequentially(
    pathCandidates.map((p) => async () => {
      // if path expects id-in-body, include it
      const body =
        p.includes("/release") &&
        p.endsWith("/release") &&
        !p.includes("/escrow/release")
          ? payload
          : { paymentToken: transactionId, ...(payload || {}) };
      const resp = await axiosInstance.post(p, body);
      return resp.data;
    })
  ).catch((err) => {
    throw wrapAxiosError(err, "requestRelease");
  });
}

async function cancelTransaction(transactionId, payload = {}) {
  if (!transactionId) throw new Error("transactionId required");
  const pathCandidates = [
    `/escrow/${encodeURIComponent(transactionId)}/cancel`,
    `/escrow/cancel`,
    `/escrows/${encodeURIComponent(transactionId)}/cancel`,
  ];
  return _tryRequestsSequentially(
    pathCandidates.map((p) => async () => {
      const body =
        p.includes("/cancel") &&
        p.endsWith("/cancel") &&
        !p.includes("/escrow/cancel")
          ? payload
          : { paymentToken: transactionId, ...(payload || {}) };
      const resp = await axiosInstance.post(p, body);
      return resp.data;
    })
  ).catch((err) => {
    throw wrapAxiosError(err, "cancelTransaction");
  });
}

function verifyWebhookSignature(rawBody, signatureHeader) {
  if (!WEBHOOK_SECRET || !signatureHeader) return false;
  try {
    const algo = WEBHOOK_ALGO === "sha512" ? "sha512" : "sha256";
    const computed = crypto
      .createHmac(algo, WEBHOOK_SECRET)
      .update(Buffer.isBuffer(rawBody) ? rawBody : String(rawBody))
      .digest("hex");

    const normalizedHeader = String(signatureHeader).trim();
    const candidates = [
      computed,
      `${algo}=${computed}`,
      Buffer.from(computed, "hex").toString("base64"),
      `${algo}=${Buffer.from(computed, "hex").toString("base64")}`,
    ];

    for (const sig of candidates) {
      const a = Buffer.from(sig);
      const b = Buffer.from(normalizedHeader);
      if (a.length !== b.length) continue;
      if (crypto.timingSafeEqual(a, b)) return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

function _findSignature(headers) {
  if (!headers) return null;
  const h = {};
  // normalize keys to lowercase
  for (const k of Object.keys(headers)) h[k.toLowerCase()] = headers[k];
  return h[WEBHOOK_HEADER] || null;
}

function parseWebhook(rawBody, headers) {
  const signature = _findSignature(headers);
  const valid = verifyWebhookSignature(rawBody, signature);
  let event = null;
  try {
    if (typeof rawBody === "string") event = JSON.parse(rawBody);
    else if (Buffer.isBuffer(rawBody)) event = JSON.parse(rawBody.toString());
    else event = rawBody;
  } catch (e) {
    // fallback: if body already parsed by express, try headers.body
    event = rawBody;
  }

  const eventType = (event && (event.event || event.type)) || "";
  const data = (event && (event.data || event)) || {};

  const providerTxId =
    data.id ||
    data.transactionId ||
    data.reference ||
    (data.metadata && (data.metadata.transactionId || data.metadata.escrowId));
  const escrowId =
    (data.metadata &&
      (data.metadata.escrowId ||
        data.metadata.escrow_id ||
        data.metadata.escrowId)) ||
    null;
  const providerEventId =
    event.id || event.event_id || `${eventType}:${data.id || ""}`;

  return {
    valid,
    eventType,
    data,
    providerTxId,
    escrowId,
    providerEventId,
    raw: event,
  };
}

module.exports = {
  createTransaction,
  getTransaction,
  requestRelease,
  cancelTransaction,
  verifyWebhookSignature,
  parseWebhook,
  WEBHOOK_HEADER,
  API_BASE,
};
