const express = require("express");
const router = express.Router();
const transactionsController = require("../controllers/transaction.controller");
const { verifyWebhookSignature } = require("../services/escrow.service");

router.post("/generate-code", transactionsController.generateCode);
router.post("/verify-code", transactionsController.verifyCode);
router.post("/initiate", transactionsController.initiatePayment);
router.post("/confirm", transactionsController.confirmTransaction);
router.post("/link-payment", transactionsController.linkPaymentToTransaction);
router.get("/latest-for-user", transactionsController.getLatestForUser);
router.get("/:id", transactionsController.getTransaction);

const crypto = require("crypto");

// Webhook Endpoint for Payluk (Matches: /transactions/webhook/escrow)
router.post("/webhook/escrow", (req, res) => {
  try {
    const secret = process.env.PAYLUK_WEBHOOK_SECRET;

    // Validate that the request has a signature
    const signature = req.headers["x-payluk-signature"];
    if (!signature) {
      console.warn("Payluk Webhook Ignored: No signature found");
      return res.status(401).send("No signature header");
    }

    // Verify Signature: HMAC-SHA512
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== signature) {
      console.error("Payluk Webhook Error: Invalid Signature");
      console.error("Received:", signature);
      console.error("Calculated:", hash);
      return res.status(401).send("Invalid signature");
    }

    // Logic to handle the event (update database, etc)
    const event = req.body;
    console.log(
      `Payluk Webhook Verified: ${event.event || "Unknown Event"}`,
      event
    );

    // Pass to controller if needed (async) or handle here
    // transactionsController.handleWebhook(event);

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("Payluk Webhook Processing Error:", error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
