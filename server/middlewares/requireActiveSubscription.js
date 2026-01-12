const User = require("../models/user.model");

const requireActiveSubscription = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const now = new Date();
    const hasActivePayment = user.hasPaid && user.paymentEndDate > now;
    const hasActiveTrial = user.isOnTrial && user.trialEndDate > now;

    if (!hasActivePayment && !hasActiveTrial) {
      return res.status(403).json({
        status: "error",
        message: "Active subscription required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  requireActiveSubscription,
};
