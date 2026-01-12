const User = require("../models/user.model");

const checkSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();

    // Check VIP/Paid Status
    if (
      user.hasPaid &&
      user.paymentEndDate &&
      new Date(user.paymentEndDate) > now
    ) {
      return next(); // Paid and valid
    }

    // Check Trial Status
    if (
      user.isOnTrial &&
      user.trialEndDate &&
      new Date(user.trialEndDate) > now
    ) {
      return next(); // Trial and valid
    }

    // If neither, deny access
    return res.status(403).json({
      message:
        "Subscription Required. Please subscribe or start your free trial to perform this action.",
      error: "SUBSCRIPTION_REQUIRED",
    });
  } catch (error) {
    console.error("Subscription Check Middleware Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error checking subscription" });
  }
};

module.exports = { checkSubscription };
