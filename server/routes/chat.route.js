// routes/chat.routes.js
const express = require("express");
const router = express.Router();
const {
  sendMessage,
  getChatMessages,
  fetchChats,
  sendBotMessageEndpoint,
} = require("../controllers/chat.controller");

// list of conversation threads for a user
router.get("/list/:userId", fetchChats);

// get messages between two users
router.get("/:senderId/:receiverId", getChatMessages);

// send a message (used by clients)
router.post("/send", sendMessage);

// OPTIONAL: send a bot/admin message (server-to-user); protect this route in production
router.post("/send-bot", sendBotMessageEndpoint);

module.exports = router;
