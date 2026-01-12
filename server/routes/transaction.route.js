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

router.post('/webhook/payluk', (req, res) => {
  const sig = req.headers[WEBHOOK_HEADER] || req.headers[WEBHOOK_HEADER.toLowerCase()];

  if (!verifyWebhookSignature(req.rawBody, sig)) {
    return res.status(401).send('invalid signature');
  }

  console.log('valid payluk webhook', req.body);
  res.status(200).send('ok');
});

module.exports = router;
