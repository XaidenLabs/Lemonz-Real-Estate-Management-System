const {
  startTrial,
  startPayment,
  checkSubscriptionStatus,
  checkTrialEligibility,
} = require("../controllers/subscription.controller");
const { authenticate } = require("../middlewares/authenticate");

const router = require("express").Router();

router.put("/start-trial", authenticate, startTrial);
router.put("/start-payment", authenticate, startPayment);
router.get("/check-status", authenticate, checkSubscriptionStatus);
router.get("/check-eligibility", authenticate, checkTrialEligibility);

module.exports = router;
