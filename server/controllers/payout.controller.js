const payoutService = require("../services/payout.service");
const paylukService = require("../services/payluk.service");
const User = require("../models/user.model");

const getBanks = async (req, res) => {
  try {
    const data = await payoutService.listBanks();
    const banks = (data && data.data) || (data && data.message) || data;
    return res.status(200).json({ success: true, banks });
  } catch (err) {
    console.error("getBanks error:", err?.message || err);
    return res
      .status(500)
      .json({ success: false, message: "Could not fetch bank list" });
  }
};

const resolveAccount = async (req, res) => {
  try {
    const { account_number, bank_code } = req.query;
    if (!account_number || !bank_code) {
      return res.status(400).json({
        success: false,
        message: "Account number and bank code are required",
      });
    }
    const data = await payoutService.resolveAccount({ account_number, bank_code });
    return res.status(200).json(data);
  } catch (err) {
    console.error("resolveAccount error:", err?.message || err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * On-demand Payluk customer setup — called right before first payment.
 * Collects BVN, creates the Payluk customer, and saves the ID to the user.
 */
const setupPaylukCustomer = async (req, res) => {
  try {
    const user = req.user;

    // Already provisioned — return existing ID
    if (user.paylukCustomerId) {
      return res.status(200).json({
        success: true,
        message: "Payment profile already set up",
        customerId: user.paylukCustomerId,
      });
    }

    const { bvn } = req.body;
    if (!bvn) {
      return res.status(400).json({
        success: false,
        message: "BVN is required to set up your payment profile",
      });
    }

    const customerId = await paylukService.createCustomer({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.mobileNumber,
      bvn,
    });

    if (!customerId) {
      return res.status(500).json({
        success: false,
        message: "Could not set up payment profile. Please try again.",
      });
    }

    // Persist BVN and Payluk customer ID
    await User.findByIdAndUpdate(user._id, { paylukCustomerId: customerId, bvn });

    return res.status(200).json({
      success: true,
      message: "Payment profile set up successfully",
      customerId,
    });
  } catch (err) {
    console.error("setupPaylukCustomer error:", err?.message || err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to set up payment profile" });
  }
};

module.exports = { getBanks, resolveAccount, setupPaylukCustomer };
