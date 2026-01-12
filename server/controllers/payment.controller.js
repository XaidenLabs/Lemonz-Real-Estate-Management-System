const Payment = require("../models/payment.model");

const generateCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return `REF_${code}`;
};

const generateUniqueReferenceId = async (maxAttempts = 10) => {
  let attempts = 0;

  while (attempts < maxAttempts) {
    const customReference = generateCode();

    const existingReferenceId = await Payment.findOne({
      customReference,
    });

    if (!existingReferenceId) {
      return customReference;
    }

    attempts++;
  }

  throw new BadRequestException(
    "Failed to generate unique reference code after maximum attempts",
  );
};

const initializePayment = async (req, res) => {
  try {
    const { amount, email, currency, metadata = {} } = req.body;

    const payload = {
      amount, // client sends kobo (as in your Payment screen)
      email,
      channels: ["card", "bank", "ussd", "bank_transfer"],
      currency: currency || "NGN",
      metadata,
    };

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    const data = await response.json();

    console.log(data);

    if (!data || !data.status) {
      return res
        .status(500)
        .json({
          status: "error",
          message: "Paystack initialize failed",
          raw: data,
        });
    }

    // create a Payment document (existing behavior)
    const customReference = await generateUniqueReferenceId();
    await Payment.create({
      userId: req.user ? req.user._id : null,
      paystackReference: data.data.reference,
      customReference,
      amount,
      metadata,
    });

    return res.json({ status: "success", data: data.data });
  } catch (err) {
    console.error("initializePayment error:", err);
    return res.status(500).json({ status: "error", message: err.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      },
    );

    const data = await response.json();

    if (data.status) {
      await Payment.findOneAndUpdate(
        { paystackReference: reference },
        { status: "Verified" },
      );
    }

    return res.json({ status: data.status, data: data.data });
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    return res.json(payments);
  } catch (err) {
    return res.status(500).json({ status: "error", message: err.message });
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
  getPayments,
};
