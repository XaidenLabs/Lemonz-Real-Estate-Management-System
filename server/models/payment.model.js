const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // Generic provider reference (e.g. escrow or payment provider)
    providerReference: {
      type: String,
      required: false,
      default: null,
    },
    // legacy Paystack reference (kept for backward compatibility)
    paystackReference: {
      type: String,
      required: false,
      default: null,
    },
    customReference: {
      type: String,
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Verified", "Unverified", "Failed"],
      required: true,
      default: "Unverified",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
