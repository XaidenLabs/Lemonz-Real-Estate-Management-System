const express = require("express");
const router = express.Router();
const escrowController = require("../controllers/escrow.controller");
const { authenticate } = require("../middlewares/authenticate");

router.post("/", authenticate, escrowController.createEscrow);
router.get("/:id", authenticate, escrowController.getEscrow);
router.post("/:id/release", authenticate, escrowController.releaseEscrow);
router.post("/:id/cancel", authenticate, escrowController.cancelEscrow);
router.post("/:id/dispute", authenticate, escrowController.disputeEscrow);

module.exports = router;
