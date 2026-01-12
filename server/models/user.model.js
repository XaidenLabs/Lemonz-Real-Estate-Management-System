const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relationship: { type: String, required: false },
  phone: { type: String, required: true },
  email: { type: String, required: true },
});

const userSchema = new mongoose.Schema({
  propertiesOfInterest: {
    type: [String],
    required: () => this.role === "buyer",
    default: null,
  },
  preferences: {
    type: [String],
    default: [],
  },
  profilePicture: {
    type: String,
    default: null,
  },
  lastName: {
    type: String,
    required: () => this.role === "buyer" || this.role === "individual-agent",
  },
  firstName: {
    type: String,
    required: () => this.role === "buyer" || this.role === "individual-agent",
  },
  middleName: { type: String },
  companyName: {
    type: String,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  currentAddress: { type: String, required: true },
  country: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  bankAccountNumber: { type: String, default: null },
  bankAccountName: { type: String, default: null },
  bankName: { type: String, default: null },
  bankCode: { type: String, default: null },
  // Payout recipient id stored for automated disbursements (provider-agnostic)
  payoutRecipientId: { type: String, default: null },
  paylukCustomerId: { type: String, default: null },
  paystackRecipientCode: { type: String, default: null },
  emergencyContact: {
    type: emergencyContactSchema,
    default: null,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  role: {
    type: String,
    enum: ["buyer", "individual-agent", "company-agent"],
    required: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationBadge: {
    type: String,
    default: null,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  ratingsCount: {
    type: Number,
    default: 0,
  },
  isIdVerified: {
    type: Boolean,
    default: false,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  hasPaid: {
    type: Boolean,
    default: false,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  paymentStartDate: {
    type: Date,
    default: null,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  paymentEndDate: {
    type: Date,
    default: null,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  isOnTrial: {
    type: Boolean,
    default: false,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  trialStartDate: {
    type: Date,
    default: null,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
  trialEndDate: {
    type: Date,
    default: null,
    required: () =>
      this.role === "individual-agent" || this.role === "company-agent",
  },
});

module.exports = mongoose.model("User", userSchema);
