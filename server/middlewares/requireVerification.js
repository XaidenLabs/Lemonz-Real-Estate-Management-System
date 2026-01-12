const User = require("../models/user.model");

const requireVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (!user.isIdVerified) {
      return res.status(403).json({
        status: "error",
        message: "ID Verification required",
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
  requireVerification,
};
