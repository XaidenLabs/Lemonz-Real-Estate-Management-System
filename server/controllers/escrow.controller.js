const Escrow = require("../models/escrow.model");
const escrowService = require("../services/escrow.service");
const { authenticate } = require("../middlewares/authenticate");
const Notification = require("../models/notification.model");
const User = require("../models/user.model");

const createEscrow = async (req, res) => {
  try {
    const { sellerId, propertyId, amount, currency = "USD", metadata = {} } = req.body;
    if (!sellerId || !amount) {
      return res.status(400).json({ success: false, message: "sellerId and amount required" });
    }

    const buyer = req.user;

    const escrow = await Escrow.create({
      buyerId: buyer ? buyer._id : null,
      sellerId,
      propertyId,
      amount,
      currency,
      status: "created",
    });

    // build payload for Escrow.com (fields may vary; placeholders used)
    const payload = {
      amount: amount,
      currency,
      description: metadata.description || `Escrow for property ${propertyId}`,
      buyer: {
        id: buyer ? String(buyer._id) : undefined,
        email: buyer ? buyer.email : metadata.buyerEmail,
        name: buyer ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() : metadata.buyerName,
      },
      seller: {
        id: String(sellerId),
        // additional seller data may be added here
      },
      return_url: process.env.ESCROW_COM_RETURN_URL,
      cancel_url: process.env.ESCROW_COM_CANCEL_URL,
      metadata: { escrowId: escrow._id, ...metadata },
    };

    const providerResp = await escrowService.createTransaction(payload);

    // Expect providerResp.data or similar structure; store raw response
    const providerData = providerResp && providerResp.data ? providerResp.data : providerResp;

    escrow.providerTransactionId = providerData && (providerData.id || providerData.transactionId || providerData.reference);
    escrow.processUrl = providerData && (providerData.process_url || providerData.checkout_url || providerData.url);
    escrow.providerMetadata = providerResp;
    escrow.status = "pending_fund";
    await escrow.save();

    return res.json({ success: true, escrow: escrow });
  } catch (err) {
    console.error("createEscrow error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await Escrow.findById(id).populate("buyerId sellerId propertyId");
    if (!escrow) return res.status(404).json({ success: false, message: "Escrow not found" });
    return res.json({ success: true, escrow });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const releaseEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await Escrow.findById(id);
    if (!escrow) return res.status(404).json({ success: false, message: "Escrow not found" });

    // authorization: only buyer or admin can request release
    const user = req.user;
    const isBuyer = user && escrow.buyerId && String(escrow.buyerId) === String(user._id);
    const isAdmin = user && user.roles && user.roles.includes && user.roles.includes("admin");
    if (!isBuyer && !isAdmin) return res.status(403).json({ success: false, message: "Not authorized" });

    if (!escrow.providerTransactionId) return res.status(400).json({ success: false, message: "Missing provider transaction id" });

    const providerResp = await escrowService.requestRelease(escrow.providerTransactionId, { requestedBy: user ? user._id : null });
    escrow.providerMetadata = { ...(escrow.providerMetadata || {}), releaseResponse: providerResp };
    escrow.status = "release_requested";
    await escrow.save();

    // notify seller
    try {
      const seller = await User.findById(escrow.sellerId).select("email firstName");
      if (seller) {
        await Notification.create({
          userId: seller._id,
          title: "Release requested",
          body: `A release has been requested for escrow ${escrow._id}`,
          data: { escrowId: escrow._id },
        });
      }
    } catch (err) {
      console.warn("notify seller failed", err?.message || err);
    }

    return res.json({ success: true, providerResp });
  } catch (err) {
    console.error("releaseEscrow error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const cancelEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const escrow = await Escrow.findById(id);
    if (!escrow) return res.status(404).json({ success: false, message: "Escrow not found" });

    const user = req.user;
    const isBuyer = user && escrow.buyerId && String(escrow.buyerId) === String(user._id);
    const isAdmin = user && user.roles && user.roles.includes && user.roles.includes("admin");
    if (!isBuyer && !isAdmin) return res.status(403).json({ success: false, message: "Not authorized" });

    if (escrow.providerTransactionId) {
      const providerResp = await escrowService.cancelTransaction(escrow.providerTransactionId, { requestedBy: user ? user._id : null });
      escrow.providerMetadata = { ...(escrow.providerMetadata || {}), cancelResponse: providerResp };
    }

    escrow.status = "cancelled";
    await escrow.save();
    return res.json({ success: true, escrow });
  } catch (err) {
    console.error("cancelEscrow error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const disputeEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const escrow = await Escrow.findById(id);
    if (!escrow) return res.status(404).json({ success: false, message: "Escrow not found" });

    escrow.status = "disputed";
    escrow.providerMetadata = { ...(escrow.providerMetadata || {}), disputeReason: reason };
    await escrow.save();
    return res.json({ success: true, escrow });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Webhook handler for Escrow.com events
const handleEscrowWebhook = async (req, res) => {
  try {
    const raw = req.rawBody || JSON.stringify(req.body);
    const parsed = escrowService.parseWebhook(raw, req.headers || req.header || {});
    if (!parsed || !parsed.valid) {
      console.warn("Invalid escrow webhook signature");
      return res.status(400).send("Invalid signature");
    }

    const { eventType, data, providerTxId, escrowId, providerEventId, raw: event } = parsed;

    let escrow = null;
    if (escrowId) escrow = await Escrow.findById(escrowId);
    if (!escrow && providerTxId) escrow = await Escrow.findOne({ providerTransactionId: providerTxId });

    if (!escrow) {
      console.warn("Webhook: escrow not found", escrowId, providerTxId);
      return res.status(200).send("ok");
    }

    // prevent duplicate event processing
    const evId = providerEventId || (event && (event.id || event.event_id)) || `${eventType}:${data.id || ''}`;
    if (escrow.providerEventIds && escrow.providerEventIds.includes(evId)) {
      return res.status(200).send("ok");
    }

    // map common events to statuses (adjust based on real provider events)
    if ((eventType || '').includes("paid") || (eventType || '').includes("buyer_funded") || (data && data.status && data.status === "funded")) {
      escrow.status = "funded";
    } else if ((eventType || '').includes("released") || (data && data.status && data.status === "released")) {
      escrow.status = "released";
    } else if ((eventType || '').includes("refunded") || (data && data.status && data.status === "refunded")) {
      escrow.status = "refunded";
    } else if ((eventType || '').includes("dispute") || (data && data.status && data.status === "disputed")) {
      escrow.status = "disputed";
    }

    escrow.providerEventIds = escrow.providerEventIds || [];
    escrow.providerEventIds.push(evId);
    escrow.providerMetadata = { ...(escrow.providerMetadata || {}), lastEvent: event };
    await escrow.save();

    // notify both parties
    try {
      await Notification.create({
        userId: escrow.buyerId,
        title: `Escrow update: ${escrow.status}`,
        body: `Escrow ${escrow._id} status changed to ${escrow.status}`,
        data: { escrowId: escrow._id },
      });
      await Notification.create({
        userId: escrow.sellerId,
        title: `Escrow update: ${escrow.status}`,
        body: `Escrow ${escrow._id} status changed to ${escrow.status}`,
        data: { escrowId: escrow._id },
      });
    } catch (err) {
      console.warn("notify parties failed", err?.message || err);
    }

    return res.status(200).send("ok");
  } catch (err) {
    console.error("handleEscrowWebhook error:", err);
    return res.status(500).send("error");
  }
};

module.exports = {
  createEscrow,
  getEscrow,
  releaseEscrow,
  cancelEscrow,
  disputeEscrow,
  handleEscrowWebhook,
};
