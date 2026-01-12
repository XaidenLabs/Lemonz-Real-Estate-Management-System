const payoutService = require("../services/payout.service");

const getBanks = async (req, res) => {
  try {
    const data = await payoutService.listBanks();
    // return list to client (map to useful shape)
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
    const data = await payoutService.resolveAccount({
      account_number,
      bank_code,
    });
    return res.status(200).json(data);
  } catch (err) {
    console.error("resolveAccount error:", err?.message || err);
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { getBanks, resolveAccount };
