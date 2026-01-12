const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  propertyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  currency: { type: String, default: "NGN" },
  providerTransactionId: { type: String },
  providerMetadata: { type: mongoose.Schema.Types.Mixed },
  paymentReference: { type: String },
  checkoutAuthorizationUrl: { type: String },
  status: {
    type: String,
    enum: [
      "initiated",
      "code_sent",
      "verified",
      "initiated_payment",
      "paid",
      "pending_confirmation",
      "completed",
      "reversed",
      "failed",
      "awaiting_disbursement",
    ],
    default: "initiated",
  },
  draftSnapshot: { type: Object },
  codeHash: { type: String },
  codeExpiry: { type: Date },
  confirmations: {
    buyer: { type: Boolean, default: false },
    buyer: { type: Boolean, default: false },
    owner: { type: Boolean, default: false },
  },
  // New Escrow Fields
  isSealedByUser: { type: Boolean, default: false },
  isSealedByProprietor: { type: Boolean, default: false },
  escrowStatus: {
    type: String,
    enum: ["held", "released", "refunded", "disputed"],
    default: "held",
  },
  disputeStatus: {
    type: String,
    enum: ["none", "raised", "resolved"],
    default: "none",
  },
  lemonZeeCommission: { type: Number, default: 0 }, // 4% Amount
  reversalCountForBuyer: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

transactionSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
