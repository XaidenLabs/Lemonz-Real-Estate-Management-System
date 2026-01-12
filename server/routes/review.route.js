const {
  createReview,
  getReviews,
} = require("../controllers/review.controller");
const { authenticate } = require("../middlewares/authenticate");

const router = require("express").Router();

router.post("/", authenticate, createReview);
router.get("/:propertyId", authenticate, getReviews);

module.exports = router;
