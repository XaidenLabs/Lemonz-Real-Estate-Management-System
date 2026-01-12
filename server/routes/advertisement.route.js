const {
  startPayment,
  checkAdvertisementStatus,
} = require("../controllers/advertisement.controller");
const { authenticate } = require("../middlewares/authenticate");

const router = require("express").Router();

router.put("/start-payment/:id", authenticate, startPayment);
router.get("/check-status/:id", authenticate, checkAdvertisementStatus);

module.exports = router;
