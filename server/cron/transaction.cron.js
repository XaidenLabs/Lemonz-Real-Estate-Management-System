const cron = require("node-cron");
const Transaction = require("../models/transaction.model");
const Property = require("../models/property.model");
const User = require("../models/user.model");
const Notification = require("../models/notification.model");
const emailService = require("../services/email.service");
const escrowService = require("../services/escrow.service");

// run every day at 02:00
cron.schedule("0 2 * * *", async () => {
  console.log("Running transactions cron job:", new Date().toISOString());
  try {
    const now = new Date();
    // find pending_confirmation transactions
    const pending = await Transaction.find({
      status: "pending_confirmation",
    }).lean();

    for (const tx of pending) {
      const created = new Date(tx.createdAt);
      // find property to know Sale vs Rent
      const property = await Property.findById(tx.propertyId).lean();
      const isSale =
        property &&
        (property.status === "Sale" ||
          property.type === "Sale" ||
          property.category === "Sale");
      // Business rule: Sale -> 5 days, Rent/Lease -> 21 days
      const deadlineDays = isSale ? 5 : 21;
      const deadline = new Date(
        created.getTime() + deadlineDays * 24 * 60 * 60 * 1000,
      );

      if (now > deadline) {
        // perform reversal
        console.log(`Reversing tx ${tx._id} due to timeout`);

        // Business rule: if reversalCountForBuyer >= 2 then this is 3rd reversal -> 2% penalty
        const reversalCount = tx.reversalCountForBuyer || 0;
        const isThird = reversalCount >= 2;
        const penaltyRate = isThird ? 0.02 : 0;
        const amountToReturn =
          Math.round((1 - penaltyRate) * tx.amount * 100) / 100;

        // Attempt refund/cancellation via escrow provider (if provider tx id exists).
        // We intentionally removed direct Payscrow refund calls — if no providerTransactionId
        // is available we notify admins for manual refund handling.
        let refundSucceeded = false;
        let refundResult = null;
        try {
          if (tx.providerTransactionId) {
            try {
              refundResult = await escrowService.cancelTransaction(tx.providerTransactionId, { reason: "timeout_auto_refund", transactionId: tx._id });
              refundSucceeded = true;
            } catch (e) {
              console.warn("Escrow cancel attempt failed:", e?.message || e);
              refundSucceeded = false;
            }
          } else {
            // No provider transaction id: cannot programmatically refund. Admin intervention required.
            refundSucceeded = false;
            refundResult = { message: "No providerTransactionId available for automatic refund" };
          }
        } catch (err) {
          console.error("Refund attempt failed for tx", tx._id, err?.response?.data || err?.message || err);
          refundSucceeded = false;
        }

        if (!refundSucceeded) {
          // If refund did not succeed, create an admin notification and skip marking as reversed
          console.warn(`Auto-refund failed or unavailable for transaction ${tx._id}. Manual action required.`);
          let adminId = null;
          try {
            const adminUser = await User.findOne({ roles: { $in: ["admin"] } }).select("_id").lean();
            adminId = adminUser ? adminUser._id : null;
          } catch (e) {
            adminId = null;
          }
          if (adminId) {
            await Notification.create({
              userId: adminId,
              type: "refund_failed_admin",
              title: "Auto-refund required (manual)",
              body: `Auto-refund failed or is unavailable for transaction ${tx._id}. Please review and refund manually.`,
              data: { transactionId: tx._id, paymentReference: tx.paymentReference, providerResult: refundResult },
            });
          }
          // send admin email
          try {
            await emailService.sendMail({
              from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
              to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
              subject: `Auto-refund required for transaction ${tx._id}`,
              html: `<p>Auto-refund failed or is not available for transaction ${tx._id}. Please review the transaction in the admin dashboard.</p><pre>${JSON.stringify({ tx, refundResult }, null, 2)}</pre>`,
            });
          } catch (e) {
            console.warn("Failed to send admin refund-notice email", e?.message || e);
          }
          continue;
        }

        // On successful refund, mark tx reversed and proceed with notifications
        await Transaction.findByIdAndUpdate(tx._id, {
          status: "reversed",
          reversalCountForBuyer: reversalCount + 1,
          // store refund metadata (best-effort)
        });

        // mark property free
        await Property.findByIdAndUpdate(tx.propertyId, {
          status: "Free",
          tagColor: "green",
        });

        // notify buyer & owner
        await Notification.create({
          userId: tx.buyerId,
          type: "transaction_reversed",
          title: "Payment Reversed",
          body: `Your payment for ${tx.draftSnapshot.title} has been reversed. Amount returned: ${amountToReturn} ${tx.currency}.`,
          data: { transactionId: tx._id },
        });
        await Notification.create({
          userId: tx.ownerId,
          type: "transaction_reversed_owner",
          title: "Payment Reversed",
          body: `Payment for ${tx.draftSnapshot.title} was reversed after timeout.`,
          data: { transactionId: tx._id },
        });

        // send emails (non-blocking)
        (async () => {
          try {
            const buyer = await User.findById(tx.buyerId).select(
              "email firstName",
            );
            if (buyer && buyer.email) {
              await emailService.sendMail({
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to: buyer.email,
                subject: "Payment Reversed",
                html: `<p>Your payment for ${tx.draftSnapshot.title} was reversed. Amount returned: ${amountToReturn} ${tx.currency}.</p>`,
              });
            }
          } catch (err) {
            console.error("Error sending reversal email:", err);
          }
        })();
      }
    }
  } catch (err) {
    console.error("cron error", err);
  }
});
