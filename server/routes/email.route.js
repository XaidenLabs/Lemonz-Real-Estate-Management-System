const { sendMessage } = require("../controllers/email.controller");

const router = require("express").Router();

router.post("/", sendMessage);

module.exports = router;
