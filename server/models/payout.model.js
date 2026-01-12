const mongoose = require("mongoose");
const { Schema } = mongoose;

const payoutSchema = new Schema(
  {
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    buyerId: { type: Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    amountMinor: { type: Number },
    currency: { type: String, default: "NGN" },
    commission: { type: Number, default: 0 },
    netAmount: { type: Number, required: true },
    netAmountMinor: { type: Number },
    status: {
      type: String,
      enum: [
        "pending",
        "awaiting_disbursement",
        "queued",
        "processing",
        "disbursed",
        "failed",
        "reversed",
      ],
      default: "awaiting_disbursement",
    },
    method: {
      type: String,
      enum: ["bank_transfer", "wallet", "manual", "other"],
      default: "bank_transfer",
    },
    processedBy: { type: Schema.Types.ObjectId, ref: "User" },
    scheduledAt: { type: Date },
    disbursedAt: { type: Date },
    failureReason: { type: String },
    providerReference: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

payoutSchema.pre("save", function (next) {
  if (
    this.amount != null &&
    (this.amountMinor == null || isNaN(this.amountMinor))
  ) {
    this.amountMinor = Math.round(Number(this.amount) * 100);
  }
  if (
    this.netAmount != null &&
    (this.netAmountMinor == null || isNaN(this.netAmountMinor))
  ) {
    this.netAmountMinor = Math.round(Number(this.netAmount) * 100);
  }
  if (this.commission == null) this.commission = 0;
  next();
});

payoutSchema.index({ status: 1, scheduledAt: 1 });
payoutSchema.index({ ownerId: 1 });
payoutSchema.index({ transactionId: 1 });

payoutSchema.methods.markDisbursed = async function ({
  providerReference = null,
  processedBy = null,
} = {}) {
  this.status = "disbursed";
  this.disbursedAt = new Date();
  if (providerReference) this.providerReference = providerReference;
  if (processedBy) this.processedBy = processedBy;
  await this.save();
  return this;
};

module.exports = mongoose.model("Payout", payoutSchema);
