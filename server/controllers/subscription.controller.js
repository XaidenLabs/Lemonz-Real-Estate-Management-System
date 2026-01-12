const User = require("../models/user.model");

const SIX_MONTHS = 6 * 30 * 24 * 60 * 60 * 1000;
const TRIAL_DURATION = SIX_MONTHS;
const PAYMENT_DURATION = SIX_MONTHS;

const startTrial = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.trialStartDate || user.isOnTrial) {
      return res.status(400).json({
        status: "error",
        message: "User has already used their trial period",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + TRIAL_DURATION);

    user.isOnTrial = true;
    user.trialStartDate = startDate;
    user.trialEndDate = endDate;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Trial period started successfully",
      data: {
        trialStartDate: startDate,
        trialEndDate: endDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const startPayment = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    if (user.hasPaid) {
      return res.status(404).json({
        status: "error",
        message: "You're currently on a paid subscription",
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + PAYMENT_DURATION);

    user.hasPaid = true;
    user.paymentStartDate = startDate;
    user.paymentEndDate = endDate;
    user.isOnTrial = false;

    await user.save();

    return res.status(200).json({
      status: "success",
      message: "Payment period started successfully",
      data: {
        paymentStartDate: startDate,
        paymentEndDate: endDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const now = new Date();
    let status = "inactive";
    let daysRemaining = 0;
    let endDate = null;

    if (user.hasPaid && user.paymentEndDate > now) {
      status = "paid";
      endDate = user.paymentEndDate;
      daysRemaining = Math.ceil(
        (user.paymentEndDate - now) / (1000 * 60 * 60 * 24),
      );
    } else if (user.isOnTrial && user.trialEndDate > now) {
      status = "trial";
      endDate = user.trialEndDate;
      daysRemaining = Math.ceil(
        (user.trialEndDate - now) / (1000 * 60 * 60 * 24),
      );
    }

    return res.status(200).json({
      status: "success",
      data: {
        subscriptionStatus: status,
        daysRemaining,
        endDate,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

const checkTrialEligibility = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    const isCompleted =
      user.trialEndDate === null
        ? false
        : new Date(user.trialEndDate).getTime() < Date.now();

    const isOngoing = new Date(user.trialEndDate).getTime() >= Date.now();

    return res.status(200).json({
      status: "success",
      ongoing: isOngoing,
      completed: isCompleted,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

module.exports = {
  startTrial,
  startPayment,
  checkSubscriptionStatus,
  checkTrialEligibility,
};
