const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    otp: { type: Number },
    otpExpires: { type: Date },
  },
  { timestamps: true },
);

const Otp = mongoose.model("otps", otpSchema);
module.exports = Otp;
