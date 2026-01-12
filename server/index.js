require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

const usersRoute = require("./routes/user.route");
const propertiesRoute = require("./routes/property.route");
const reviewsRoute = require("./routes/review.route");
const chatRoute = require("./routes/chat.route");
const paymentRoute = require("./routes/payment.route");
const emailRoute = require("./routes/email.route");
const subscriptionRoute = require("./routes/subscription.route");
const advertisementRoute = require("./routes/advertisement.route");
const transactionRoute = require("./routes/transaction.route");
const escrowsRoute = require("./routes/escrow.route");
const escrowsController = require("./controllers/escrow.controller");

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  // For webhook endpoints that require raw body for signature verification,
  // parse the raw body and expose it as `req.rawBody`.
  if (req.path === "/transactions/webhook/escrow" || req.path === "/transaction/webhook/escrow" || req.path === "/api/transaction/webhook/escrow") {
    bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf.toString();
      },
    })(req, res, next);
  } else {
    bodyParser.json()(req, res, next);
  }
});
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port: http://localhost:${port}!`);
    });
  })
  .catch((err) => {
    throw new Error(err, "Connection unsuccessful");
  });

app.get("/", (req, res) => res.json("Hello world"));
// Expose a public webhook path (match provider configured URL)
app.post("/transactions/webhook/escrow", escrowsController.handleEscrowWebhook);
app.use("/api/user", usersRoute);
app.use("/api/property", propertiesRoute);
app.use("/api/reviews", reviewsRoute);
app.use("/api/chat", chatRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/email", emailRoute);
app.use("/api/subscription", subscriptionRoute);
app.use("/api/advertise", advertisementRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/escrows", escrowsRoute);

module.exports = app;
