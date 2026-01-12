const mongoose = require("mongoose");

const escrowSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: {
    type: String,
    enum: [
      "created",
      "pending_fund",
      "funded",
      "inspection",
      "release_requested",
      "released",
      "cancelled",
      "refunded",
      "disputed",
    ],
    default: "created",
  },
  provider: { type: String, default: "escrow.com" },
  providerTransactionId: { type: String },
  processUrl: { type: String },
  providerMetadata: { type: Object },
  holdExpiresAt: { type: Date },
  providerEventIds: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

escrowSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Escrow", escrowSchema);
