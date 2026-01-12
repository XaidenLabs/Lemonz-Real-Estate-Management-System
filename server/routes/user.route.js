const {
  register,
  login,
  getUser,
  updateUser,
  forgotPassword,
  verifyOtp,
  resetPassword,
  idVerification,
  verifyUser,
} = require("../controllers/user.controller");
const { authenticate } = require("../middlewares/authenticate");
const { upload } = require("../middlewares/image-upload");
const {
  getBanks: getBanksCtrl,
  resolveAccount: resolveAccountCtrl,
} = require("../controllers/payout.controller");

const router = require("express").Router();

router.post("/register", register);
router.post("/login", login);
router.get("/", authenticate, getUser);
router.post("/verify/:id", authenticate, verifyUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post(
  "/verify-identity",
  authenticate,
  upload.single("file"),
  idVerification
);
router.post("/reset-password", resetPassword);
router.get("/banks", getBanksCtrl);
router.get("/resolve-account", resolveAccountCtrl);

module.exports = router;
