// controllers/chat.controller.js
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");

/**
 * sendMessage
 * Body: { senderId, receiverId, message, metadata? }
 */
const sendMessage = async (req, res) => {
  const { senderId, receiverId, message, metadata = {} } = req.body;

  if (!senderId || !receiverId || !message) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: senderId, receiverId, message",
    });
  }

  try {
    const newMessage = new Chat({ senderId, receiverId, message, metadata });
    await newMessage.save();

    // create an in-app notification for the receiver (best-effort)
    try {
      const sender = await User.findById(senderId).select("firstName lastName");
      const title = `New message from ${sender ? `${sender.firstName} ${sender.lastName}` : "Someone"}`;
      const body = message.slice(0, 200);

      await Notification.create({
        userId: receiverId,
        type: "chat_message",
        title,
        body,
        data: { chatId: newMessage._id, senderId },
      });
    } catch (err) {
      console.error(
        "Error creating notification for chat:",
        err?.message || err,
      );
      // don't fail the request — notification/email are best-effort
    }

    return res.status(201).json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    });
  }
};

/**
 * getChatMessages
 * Params: senderId, receiverId
 * Returns the messages between two users sorted ascending by createdAt
 */
const getChatMessages = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;
    if (!senderId || !receiverId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "senderId and receiverId params required",
        });
    }

    const messages = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ createdAt: 1 }); // ascending for chat order

    return res.status(200).json(messages);
  } catch (error) {
    console.error("getChatMessages error:", error);
    return res.status(500).json({
      success: false,
      message: "Error retrieving messages",
      error: error.message,
    });
  }
};

/**
 * fetchChats
 * Params: userId
 * Returns a list of chat threads (most recent message per conversation), with partner info
 */
const fetchChats = async (req, res) => {
  const { userId } = req.params;

  if (!userId)
    return res
      .status(400)
      .json({ success: false, message: "userId param required" });

  try {
    const allChats = await Chat.aggregate([
      {
        $match: {
          $or: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$senderId", userId] },
              then: "$receiverId",
              else: "$senderId",
            },
          },
          chatId: { $first: "$_id" },
          lastMessage: { $first: "$message" },
          lastMessageDate: { $first: "$updatedAt" },
          isRead: { $first: "$isRead" },
          senderId: { $first: "$senderId" },
          receiverId: { $first: "$receiverId" },
        },
      },
      { $sort: { lastMessageDate: -1 } },
    ]);

    const userIds = allChats.map((chat) => chat._id);

    const userDetails = await User.find({
      _id: { $in: userIds },
    }).select("firstName lastName profilePicture");

    const userMap = userDetails.reduce((map, user) => {
      map[user._id.toString()] = {
        name: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture || "",
      };
      return map;
    }, {});

    const chatList = allChats.map((chat) => {
      const otherUserId = chat._id.toString();
      const otherUser = userMap[otherUserId] || {
        name: "Unknown User",
        profilePicture: "",
      };

      return {
        _id: chat.chatId,
        userId: otherUserId,
        name: otherUser.name,
        profilePicture: otherUser.profilePicture,
        lastMessage: chat.lastMessage,
        lastMessageDate: chat.lastMessageDate,
        isRead: chat.isRead,
        senderId: chat.senderId ? chat.senderId.toString() : null,
        receiverId: chat.receiverId ? chat.receiverId.toString() : null,
      };
    });

    return res.status(200).json(chatList);
  } catch (error) {
    console.error("fetchChats error:", error);
    return res.status(500).json({
      message: "An error occurred while fetching chats",
      error: error.message,
    });
  }
};

/**
 * sendBotMessage
 * Convenience helper to programmatically create bot messages and a notification.
 * Use from other controllers (e.g., transaction webhook) by requiring this controller and calling sendBotMessage(...)
 *
 * Example:
 *   await sendBotMessage({ receiverId: ownerId, message: 'Payment pending confirmation', metadata: { transactionId } });
 */
const sendBotMessage = async ({ receiverId, message, metadata = {} }) => {
  if (!receiverId || !message)
    throw new Error("receiverId and message are required for bot message");

  // create chat message with BOT_USER_ID as sender
  const botMsg = new Chat({
    senderId: BOT_USER_ID,
    receiverId,
    message,
    metadata,
  });
  await botMsg.save();

  // create notification (best-effort)
  try {
    await Notification.create({
      userId: receiverId,
      type: "bot_message",
      title: "LemonZee",
      body: message.slice(0, 200),
      data: { chatId: botMsg._id, ...metadata },
    });
  } catch (err) {
    console.error("sendBotMessage: notification error:", err?.message || err);
  }

  // attempt email (best-effort)
  try {
    const recipient = await User.findById(receiverId).select("email firstName");
    if (recipient && recipient.email) {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.email,
        subject: "LemonZee Notification",
        html: `<p>Hi ${recipient.firstName || ""},</p><p>${message}</p><p>Open the app to respond.</p>`,
      });
    }
  } catch (err) {
    console.error("sendBotMessage: email send error:", err?.message || err);
  }

  return botMsg;
};

// Optional endpoint to let server-side code or admin send bot messages via HTTP
const sendBotMessageEndpoint = async (req, res) => {
  const { receiverId, message, metadata = {} } = req.body;
  if (!receiverId || !message)
    return res
      .status(400)
      .json({ success: false, message: "receiverId and message required" });

  try {
    const botMsg = await sendBotMessage({ receiverId, message, metadata });
    return res.status(201).json({ success: true, data: botMsg });
  } catch (err) {
    console.error("sendBotMessageEndpoint error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error sending bot message",
        error: err.message,
      });
  }
};

module.exports = {
  sendMessage,
  getChatMessages,
  fetchChats,
  sendBotMessage,
  sendBotMessageEndpoint,
};
