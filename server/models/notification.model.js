const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    data: { type: Object, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Notification = mongoose.model("notifications", notificationSchema);
module.exports = Notification;
