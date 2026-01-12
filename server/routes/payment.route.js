const {
  verifyPayment,
  initializePayment,
  getPayments,
} = require("../controllers/payment.controller");
const { authenticate } = require("../middlewares/authenticate");

const router = require("express").Router();

router.post("/initialize", authenticate, initializePayment);
router.post("/verify", authenticate, verifyPayment);
router.get("/", getPayments);

module.exports = router;
