const axios = require("axios");

const PAYLUK_BASE_URL = "https://api.payluk.ng/v1"; // Using the base URL found in previous files
const PAYLUK_SECRET_KEY = process.env.PAYLUK_SECRET_KEY;

const axiosInstance = axios.create({
  baseURL: PAYLUK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYLUK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

class PaylukService {
  /**
   * Create a Customer on Payluk
   * @param {Object} userData - { firstName, lastName, email, phone }
   */
  async createCustomer(userData) {
    try {
      console.log("Creating Payluk Customer for:", userData.email);
      const response = await axiosInstance.post("/customer/create", {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        // Add bank details if provided (for Proprietors/Agents)
        account_number: userData.bankAccountNumber,
        bank_code: userData.bankCode,
        bank_name: userData.bankName,
      });

      // Payluk returns { status: true, data: { id: "..." } } or similar
      // We need to parse correctly based on observed responses
      const customerId =
        response.data?.data?.id ||
        response.data?.id ||
        response.data?.data?.customerId;

      if (!customerId) {
        console.warn("Payluk Create Customer: No ID returned", response.data);
        return null;
      }

      console.log("Payluk Customer Created:", customerId);
      return customerId;
    } catch (error) {
      // Handle "Customer already exists" or similar if possible
      // But 403 Forbidden is what we currently expect
      console.error(
        "Payluk Create Customer Error:",
        error.response?.data || error.message
      );
      // We don't throw, we just return null so signup/payment flows don't crash hard
      return null;
    }
  }

  /**
   * Initialize a new Escrow Transaction
   * @param {Object} data - { amount, email, reference, description }
   */
  async createTransaction(data) {
    try {
      // Assuming Payluk uses a standard initialization endpoint common in Nigerian gateways
      // Adjust endpoint based on specific docs if different
      const response = await axiosInstance.post("/transaction/initialize", {
        amount: data.amount * 100, // Convert to kobo
        email: data.email,
        reference: data.reference,
        callback_url: data.callbackUrl,
        metadata: {
          description: data.description,
          type: "escrow", // Tagging as escrow
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        "Payluk Create Transaction Error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message ||
          "Failed to initialize Payluk transaction"
      );
    }
  }

  /**
   * Verify a Transaction
   * @param {String} reference
   */
  async verifyTransaction(reference) {
    try {
      const response = await axiosInstance.get(
        `/transaction/verify/${reference}`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Payluk Verify Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to verify transaction");
    }
  }

  /**
   * Release Funds (Seals Deal)
   * Splits payment: 96% to Seller, 4% to Lemon Zee
   * @param {String} transactionReference
   * @param {Object} recipientDetails - { account_number, bank_code, amount }
   */
  async releaseFunds(transactionReference, recipientDetails) {
    try {
      // Calculate split
      const totalAmount = recipientDetails.amount; // In main currency units
      const platformFee = totalAmount * 0.04;
      const sellerAmount = totalAmount - platformFee;

      // This assumes Payluk has a 'transfer' or 'disburse' endpoint for escrow settlement
      // We might need to create a Transfer Recipient first depending on the API

      // Step 1: Create Transfer Recipient for Seller (if not exists)
      // For now, illustrating the direct transfer concept

      const payload = {
        source: "balance", // or referencing the held transaction
        reason: `Settlement for ${transactionReference}`,
        amount: sellerAmount * 100, // Kobo
        recipient: recipientDetails.recipient_code, // Assuming we have a recipient code
        reference: `SETTLEMENT-${transactionReference}`,
      };

      const response = await axiosInstance.post("/transfer", payload);

      return {
        success: true,
        sellerAmount,
        platformFee,
        transferData: response.data,
      };
    } catch (error) {
      console.error(
        "Payluk Release Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to release funds");
    }
  }

  /**
   * Refund Transaction
   * @param {String} transactionReference
   */
  async refundTransaction(transactionReference) {
    try {
      const response = await axiosInstance.post("/refund", {
        transaction: transactionReference,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Payluk Refund Error:",
        error.response?.data || error.message
      );
      throw new Error("Failed to refund transaction");
    }
  }
}

module.exports = new PaylukService();
