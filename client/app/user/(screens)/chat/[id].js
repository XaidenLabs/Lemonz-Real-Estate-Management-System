import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  SectionList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { useAuth } from "../../../../contexts/AuthContext";
import EmptyChatMessages from "../../../../components/common/EmptyChatMessages";
import { apiFetch } from "../../../../services/api";
import { getToken } from "../../../../services/getToken";
import PaystackWebview from "../../../../components/agent/payments/PaystackWebview";
import EscrowWebview from "../../../../components/common/EscrowWebview";
import { PAYSTACK_PUBLIC_KEY, SUPPORT_EMAIL, SUPPORT_PHONE } from "@env";

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const receiverId = params.id;
  const name = params.name || "Owner";
  const profilePicture = params.profilePicture || null;
  const propertyId = params.propertyId || null;
  const propertyTitle = params.propertyTitle || "";

  const { user, getUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Bot / transaction UI state
  const [botStage, setBotStage] = useState("idle"); // idle | greeting | awaiting_code | verified | initiated_payment | paid_pending_confirmation | awaiting_disbursement | completed
  const [transactionId, setTransactionId] = useState(null);
  const [codeInput, setCodeInput] = useState("");
  const [checkoutUrl, setCheckoutUrl] = useState(null); // kept as fallback
  const [showWebView, setShowWebView] = useState(false); // used if checkoutUrl fallback is used
  const [escrowId, setEscrowId] = useState(null);
  const [escrowProcessUrl, setEscrowProcessUrl] = useState(null);
  const [paymentInitData, setPaymentInitData] = useState(null); // { reference, amount, ... } from /api/payment/initialize
  const [showPaymentWebview, setShowPaymentWebview] = useState(false); // inline Paystack webview
  const [transaction, setTransaction] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [busy, setBusy] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);

  const webviewRef = useRef(null);

  // load user once on mount (don't re-run every render)
  useEffect(() => {
    getUser().catch((e) => {
      console.warn("getUser failed:", e?.message || e);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When user becomes available (or receiver/property changes) -> load messages & start bot
  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (!user || !user._id || !receiverId) return;

      // set greeting only once when user first becomes available for this conversation
      setTimeout(() => {
        if (isMounted) setBotStage((s) => (s === "idle" ? "greeting" : s));
      }, 500);

      await loadMessages({ mountedFlag: () => isMounted });
      if (propertyId) {
        await fetchLatestTransaction();
      }
    };
    run();

    return () => {
      isMounted = false;
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    };
    // only re-run when user identity or receiver or property changes
  }, [user?._id, receiverId, propertyId]);

  // ------------------------
  // MESSAGE LISTING / HELPERS
  // ------------------------

  // Normalize a message's timestamp
  const getMessageTime = (msg) => {
    // Accept createdAt, updatedAt or timestamp fields; fall back to now
    const t =
      msg.createdAt ||
      msg.updatedAt ||
      msg.timestamp ||
      new Date().toISOString();
    return new Date(t);
  };

  // Format the date header label:
  // Today / Yesterday / MMM dd, yyyy
  const formatDateLabel = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(d, today)) return "Today";
    if (sameDay(d, yesterday)) return "Yesterday";

    // e.g. Mar 01, 2025
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Turn flat messages into SectionList sections grouped by date
  const sections = useMemo(() => {
    if (!Array.isArray(messages) || messages.length === 0) return [];

    // sort messages by createdAt ascending (older first)
    const sorted = [...messages].sort((a, b) => {
      const ta = getMessageTime(a).getTime();
      const tb = getMessageTime(b).getTime();
      return ta - tb;
    });

    // group into map: label -> [messages]
    const groups = {};
    for (const msg of sorted) {
      const label = formatDateLabel(getMessageTime(msg));
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    }

    // produce sections array in chronological order
    const sectionArray = Object.keys(groups).map((label) => ({
      title: label,
      data: groups[label],
    }));

    // ensure sections are sorted by date (oldest first)
    sectionArray.sort((a, b) => {
      // parse first message date in each section
      const da = getMessageTime(a.data[0]).getTime();
      const db = getMessageTime(b.data[0]).getTime();
      return da - db;
    });

    return sectionArray;
  }, [messages]);

  // ------------------------
  // API / Chat functions
  // ------------------------

  // Load chat messages via your chat API endpoint
  const loadMessages = async ({ mountedFlag } = {}) => {
    if (!user || !user._id || !receiverId) return;
    const token = await getToken();
    try {
      setLoadingMessages(true);
      // NOTE: backend chat route is mounted at /api/chat/:sender/:receiver
      const data = await apiFetch(`/api/chat/${user._id}/${receiverId}`, {
        method: "GET",
        token,
      });
      if (mountedFlag && !mountedFlag()) return;
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("loadMessages error:", err?.message || err);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a chat message (client)
  const sendChatMessage = async ({
    senderId,
    receiverId: rId,
    message,
    metadata = {},
  }) => {
    if (!senderId || !rId || !message) return;
    const token = await getToken();
    try {
      const res = await apiFetch("/api/chat/send", {
        method: "POST",
        body: { senderId, receiverId: rId, message, metadata },
        token,
      });
      // server returns { success: true, data: newMessage }
      if (res && res.data) {
        setMessages((m) => [...m, res.data]);
      } else {
        setTimeout(() => loadMessages(), 300);
      }
    } catch (err) {
      console.error("sendChatMessage error", err);
      Alert.alert("Error", err.message || "Could not send message");
    }
  };

  // ------------------------
  // Bot / transaction flows (kept as you had them)
  // ------------------------

  const requestTransactionCode = async () => {
    console.log({ user, propertyId: params.propertyId });
    if (!user || !propertyId)
      return Alert.alert("Error", "Property or user not found");
    try {
      setBusy(true);
      const token = await getToken();
      const body = await apiFetch("/api/transaction/generate-code", {
        method: "POST",
        body: { propertyId, userId: user._id },
        token,
      });
      setBusy(false);
      const txId =
        body.transactionId || body.transaction?._id || body._id || null;
      setTransactionId(txId);
      setBotStage("awaiting_code");

      setMessages((m) => [
        ...m,
        {
          _id: `local-bot-${Date.now()}`,
          senderId: receiverId,
          receiverId: user._id,
          message:
            "A verification code has been emailed to your registered email. Enter it here to proceed with payment.",
          metadata: { propertyId },
          createdAt: new Date().toISOString(),
          local: true,
        },
      ]);

      try {
        await apiFetch("/api/chat/send-to-bot", {
          method: "POST",
          body: {
            message:
              "A verification code has been emailed to your registered email. Enter it here to proceed with payment.",
            metadata: { propertyId, transactionId: txId },
          },
          token,
        });
      } catch (e) {
        console.warn("persisting user->bot message failed:", e?.message || e);
      }
    } catch (err) {
      setBusy(false);
      Alert.alert("Error", err.message || "Could not request code");
    }
  };

  const verifyTransactionCode = async () => {
    if (!transactionId || !codeInput) return Alert.alert("Error", "Enter code");
    try {
      setBusy(true);
      const token = await getToken();
      const data = await apiFetch("/api/transaction/verify-code", {
        method: "POST",
        body: { transactionId, code: codeInput },
        token,
      });
      console.log({ transactionData: data });
      setBusy(false);
      setTransaction(data.transaction);
      if (
        data.transaction?.status === "verified" ||
        data.transaction?.status === "ready_for_payment"
      ) {
        setBotStage("verified");
      } else if (data.transaction?.status === "awaiting_disbursement") {
        setBotStage("awaiting_disbursement");
      } else {
        setBotStage("verified");
      }
      setMessages((m) => [
        ...m,
        {
          _id: `local-bot-${Date.now()}`,
          senderId: receiverId,
          receiverId: user._id,
          message:
            "Code verified. Ready to show property summary and proceed to payment.",
          metadata: { transactionId },
          createdAt: new Date().toISOString(),
          local: true,
        },
      ]);
    } catch (err) {
      setBusy(false);
      Alert.alert("Verification failed", err.message || "Invalid code");
    }
  };

  const initiatePayment = async () => {
    const amountBase =
      transaction?.amount ?? transaction?.draftSnapshot?.amount ?? 0;
    if (!user?.email)
      return Alert.alert("Error", "Missing user email for payment");

    try {
      setBusy(true);
      const token = await getToken();
      const amountKobo = Math.round(Number(amountBase) * 100);

      const init = await apiFetch("/api/payment/initialize", {
        method: "POST",
        body: {
          amount: amountKobo,
          email: user.email,
          currency: transaction?.currency || "NGN",
          metadata: {
            transactionId: transactionId || transaction?._id || null,
            propertyId,
          },
        },
        token,
      });

      setBusy(false);

      if (!init || init.status !== "success" || !init.data) {
        throw new Error(
          (init && (init.message || JSON.stringify(init))) ||
            "Failed to initialize payment"
        );
      }

      setPaymentInitData(init.data);
      setShowPaymentWebview(true);

      if (init.data.authorization_url) {
        setCheckoutUrl(init.data.authorization_url);
      }
    } catch (err) {
      setBusy(false);
      console.error("initiatePayment error", err);
      Alert.alert("Payment error", err.message || "Could not start payment");
    }
  };

  // New: initiate Escrow.com hosted flow
  const initiateEscrow = async () => {
    const amountBase =
      transaction?.amount ?? transaction?.draftSnapshot?.amount ?? 0;
    if (!user || !propertyId)
      return Alert.alert("Error", "Missing user or property");

    try {
      setBusy(true);
      const token = await getToken();

      // Use the transaction initiation endpoint which uses the escrow provider for property payments
      const body = {
        transactionId: transactionId || transaction?._id || null,
        buyerEmail: user.email,
        currency: selectedCurrency || transaction?.currency || "NGN",
      };

      const resp = await apiFetch("/api/transaction/initiate", {
        method: "POST",
        body,
        token,
      });

      setBusy(false);
      if (!resp || !resp.success)
        throw new Error(
          (resp && (resp.message || JSON.stringify(resp))) ||
            "Failed to initiate payment"
        );

      // prefer checkoutUrl returned directly, then provider payload
      const proc =
        resp.checkoutUrl ||
        resp.providerResp?.data?.authorization_url ||
        resp.providerResp?.authorization_url ||
        resp.providerResp?.data?.checkout_url ||
        resp.providerResp?.checkout_url ||
        resp.providerResp?.data?.process_url ||
        resp.providerResp?.process_url;
      if (!proc) throw new Error("No checkout url returned from server");

      setCheckoutUrl(proc);
      setShowWebView(true);

      // fetch latest transaction state after a short delay (webhook will also update)
      setTimeout(fetchLatestTransaction, 1500);
    } catch (err) {
      setBusy(false);
      console.error("initiateEscrow error", err);
      Alert.alert("Payment error", err.message || "Could not initiate payment");
    }
  };

  const fetchLatestTransaction = async () => {
    if (!user || !propertyId) return;
    try {
      const token = await getToken();
      const data = await apiFetch("/api/transaction/latest-for-user", {
        method: "GET",
        qs: { propertyId, userId: user._id },
        token,
      });

      if (data.transaction) {
        setTransaction(data.transaction);
        const st = data.transaction.status;
        if (st === "pending_confirmation") {
          setBotStage("paid_pending_confirmation");
        } else if (st === "awaiting_disbursement") {
          setBotStage("awaiting_disbursement");
        } else if (st === "completed") {
          setBotStage("completed");
        } else {
          setBotStage((s) => (s === "idle" ? "idle" : s));
        }
      }
    } catch (err) {
      console.warn("fetchLatestTransaction err", err.message || err);
    }
  };

  const startEscrowPolling = (id) => {
    if (!id) return;
    try {
      if (pollingIntervalId) clearInterval(pollingIntervalId);
    } catch (e) {}

    const idRef = setInterval(async () => {
      try {
        const token = await getToken();
        const data = await apiFetch(`/api/escrows/${id}`, {
          method: "GET",
          token,
        });
        if (data && data.escrow) {
          const st = data.escrow.status;
          if (st === "funded") {
            setShowWebView(false);
            setBotStage("paid_pending_confirmation");
            clearInterval(idRef);
            setPollingIntervalId(null);
            // refresh transaction state from server
            setTimeout(fetchLatestTransaction, 1500);
          } else if (st === "released") {
            setShowWebView(false);
            setBotStage("completed");
            clearInterval(idRef);
            setPollingIntervalId(null);
            setTimeout(fetchLatestTransaction, 1500);
          } else if (st === "refunded" || st === "cancelled") {
            setShowWebView(false);
            setBotStage("idle");
            clearInterval(idRef);
            setPollingIntervalId(null);
          }
        }
      } catch (err) {
        console.warn("escrow poll error", err?.message || err);
      }
    }, 3000);

    setPollingIntervalId(idRef);
  };

  const onWebViewNavStateChange = (navState) => {
    const url = navState.url || "";
    if (
      url.includes("/payment/success") ||
      url.includes("payment/success") ||
      url.includes("/escrow/success") ||
      url.includes("escrow/success")
    ) {
      setShowWebView(false);
      setBotStage("paid_pending_confirmation");
      setTimeout(fetchLatestTransaction, 2000);
    }
  };

  const onPaymentVerified = async (reference) => {
    try {
      const token = await getToken();
      const verifyRes = await apiFetch(
        `/api/payment/verify?reference=${encodeURIComponent(reference)}`,
        {
          method: "POST",
          token,
        }
      );

      const verified =
        verifyRes &&
        (verifyRes.data?.status === "success" || verifyRes.status === true);

      if (verified) {
        setShowPaymentWebview(false);
        setTimeout(fetchLatestTransaction, 1500);

        if (transactionId || transaction?._id) {
          try {
            await apiFetch("/api/transaction/link-payment", {
              method: "POST",
              body: {
                transactionId: transactionId || transaction._id,
                paymentReference: reference,
              },
              token,
            });
            setTimeout(fetchLatestTransaction, 800);
          } catch (linkErr) {
            console.warn("link-payment fallback failed", linkErr);
          }
        }

        Alert.alert("Success", "Payment completed and recorded.");
      } else {
        setShowPaymentWebview(false);
        Alert.alert("Payment not confirmed", "Please contact support");
      }
    } catch (err) {
      console.error("onPaymentVerified error", err);
      setShowPaymentWebview(false);
      Alert.alert(
        "Payment Error",
        "Could not verify payment. Please try again."
      );
    }
  };

  const confirmAsBuyer = async () => {
    if (!transaction || !transaction._id) return Alert.alert("No transaction");
    try {
      setBusy(true);
      const token = await getToken();
      const data = await apiFetch("/api/transaction/confirm", {
        method: "POST",
        body: { transactionId: transaction._id, role: "buyer" },
        token,
      });
      console.log(data);
      setBusy(false);
      setTransaction(data.transaction);
      if (data.transaction?.status === "awaiting_disbursement") {
        setBotStage("awaiting_disbursement");
      } else if (data.transaction?.status === "completed") {
        setBotStage("completed");
      } else {
        setBotStage("paid_pending_confirmation");
      }
      Alert.alert("Confirmed", "You confirmed the transaction");
    } catch (err) {
      setBusy(false);
      Alert.alert("Error", err.message || "Confirm failed");
    }
  };

  // ------------------------
  // Render helpers
  // ------------------------

  const renderMessageItem = ({ item }) => {
    const isCurrentUser = item.senderId === user?._id || item.senderId === user;
    const isLocalBot = item.local === true || item.senderId === receiverId;
    const containerStyle = {
      padding: 10,
      backgroundColor: isLocalBot
        ? "#2C2F33"
        : isCurrentUser
          ? "#BBCC13"
          : "#3D454B",
      alignSelf: isCurrentUser ? "flex-end" : "flex-start",
      borderRadius: 10,
      marginVertical: 5,
      maxWidth: "80%",
    };
    return (
      <View style={containerStyle}>
        <Text style={{ color: "#FFFFFF" }}>{item.message}</Text>
        {isLocalBot ? (
          <Text style={{ color: "#9CA3AF", fontSize: 11, marginTop: 6 }}>
            • Bot
          </Text>
        ) : null}
      </View>
    );
  };

  const renderSectionHeader = ({ section }) => (
    <View style={{ paddingVertical: 8, alignItems: "center" }}>
      <View
        style={{
          backgroundColor: "#1E1E1E",
          paddingHorizontal: 12,
          paddingVertical: 4,
          borderRadius: 16,
        }}
      >
        <Text style={{ color: "#9CA3AF", fontSize: 12 }}>{section.title}</Text>
      </View>
    </View>
  );

  const renderBotBox = () => {
    if (botStage === "greeting") {
      return (
        <View style={{ padding: 12 }}>
          <View
            style={{
              backgroundColor: "#2B3B3C",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#fff", marginBottom: 8 }}>
              Hi! Would you like to commence payment for this property?
            </Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={requestTransactionCode}
                style={{
                  padding: 10,
                  backgroundColor: "#BBCC13",
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#1A1A1A" }}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setBotStage("idle")}
                style={{
                  padding: 10,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#444",
                }}
              >
                <Text style={{ color: "#fff" }}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    if (botStage === "awaiting_code") {
      return (
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#fff", marginBottom: 8 }}>
            A code has been sent to your registered email. Enter it below:
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              value={codeInput}
              onChangeText={setCodeInput}
              placeholder="Enter code"
              placeholderTextColor="#9CA3AF"
              style={{
                flex: 1,
                padding: 10,
                backgroundColor: "#1E1E1E",
                borderRadius: 8,
                color: "#fff",
              }}
            />
            <TouchableOpacity
              onPress={verifyTransactionCode}
              style={{ padding: 10, marginLeft: 8 }}
            >
              {busy ? (
                <ActivityIndicator />
              ) : (
                <Ionicons
                  name="checkmark-circle-outline"
                  size={28}
                  color="#BBCC13"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (botStage === "verified" && transaction) {
      const p = transaction.draftSnapshot || {};
      return (
        <View style={{ padding: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {p.photo ? (
              <Image
                source={{ uri: p.photo }}
                style={{ width: 60, height: 60, borderRadius: 30 }}
              />
            ) : (
              <Ionicons name="home-outline" size={48} color="#fff" />
            )}
            <View style={{ flex: 1 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                {p.title || transaction.draftSnapshot?.title || propertyTitle}
              </Text>
              <Text style={{ color: "#fff" }}>
                {p.ownerName || ""} • {p.category || ""}
              </Text>
              <Text style={{ color: "#BBCC13", marginTop: 6 }}>
                {p.currency || transaction.currency}{" "}
                {p.amount || transaction.amount}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 10, marginBottom: 8 }}>
            <Text style={{ color: "#E0E0E0", fontSize: 12 }}>
              DISCLAIMER: Payments arranged or completed outside this app (bank
              transfer, cash, external links) are at your own risk.
            </Text>
          </View>

          <View style={{ marginTop: 10 }}>
            <Text style={{ color: "#9CA3AF", marginBottom: 8, fontSize: 12 }}>
              Select currency
            </Text>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              {["NGN", "USD", "CFA"].map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedCurrency(c)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    marginRight: 8,
                    backgroundColor:
                      selectedCurrency === c ? "#BBCC13" : "#3D454B",
                  }}
                >
                  <Text
                    style={{
                      color: selectedCurrency === c ? "#1A1A1A" : "#fff",
                    }}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={initiateEscrow}
                style={{
                  padding: 10,
                  backgroundColor: "#BBCC13",
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#1A1A1A" }}>Proceed to Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    if (
      botStage === "paid_pending_confirmation" ||
      (transaction && transaction.status === "pending_confirmation")
    ) {
      return (
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#fff", marginBottom: 6 }}>
            Please, confirm this payment
          </Text>
          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity
              onPress={confirmAsBuyer}
              style={{
                padding: 10,
                backgroundColor: "#BBCC13",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#1A1A1A" }}>Confirm Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (
      botStage === "awaiting_disbursement" ||
      (transaction && transaction.status === "awaiting_disbursement")
    ) {
      const amt =
        transaction?.amount ?? transaction?.draftSnapshot?.amount ?? 0;
      const currency =
        transaction?.currency ?? transaction?.draftSnapshot?.currency ?? "NGN";
      const commission = Math.round((amt * 0.04 + Number.EPSILON) * 100) / 100;
      const net = Math.round((amt - commission + Number.EPSILON) * 100) / 100;

      return (
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#fff", marginBottom: 8, fontWeight: "700" }}>
            Payment received — awaiting disbursement
          </Text>
          <Text style={{ color: "#fff", marginBottom: 8 }}>
            Your payment of {currency} {amt} has been received and is being held
            securely. An admin will disburse the seller shortly.
          </Text>

          <View
            style={{
              backgroundColor: "#1E1E1E",
              padding: 12,
              borderRadius: 8,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#9CA3AF" }}>Summary</Text>
            <Text style={{ color: "#fff", marginTop: 6 }}>
              Amount: {currency} {amt}
            </Text>
            <Text style={{ color: "#fff" }}>
              Platform commission (4%): {currency} {commission}
            </Text>
            <Text style={{ color: "#fff" }}>
              Amount to seller: {currency} {net}
            </Text>
          </View>

          <Text style={{ color: "#fff", marginBottom: 6 }}>
            We will notify you when the seller has been paid. If you need
            assistance, contact support.
          </Text>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => {
                if (SUPPORT_PHONE) {
                  const tel =
                    Platform.OS === "android"
                      ? `tel:${SUPPORT_PHONE}`
                      : `telprompt:${SUPPORT_PHONE}`;
                  Linking.openURL(tel).catch(() => {});
                } else if (SUPPORT_EMAIL) {
                  Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
                } else {
                  Alert.alert(
                    "Support",
                    "Contact support via the Help section in the app."
                  );
                }
              }}
              style={{
                padding: 10,
                backgroundColor: "#3D454B",
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>Contact Support</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (transaction && transaction._id) {
                  router.push(
                    `/user/(screens)/transactions/${transaction._id}`
                  );
                } else {
                  Alert.alert(
                    "Transaction",
                    "Transaction details not available yet."
                  );
                }
              }}
              style={{
                padding: 10,
                backgroundColor: "#BBCC13",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#1A1A1A" }}>View Transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (
      botStage === "completed" ||
      (transaction && transaction.status === "completed")
    ) {
      return (
        <View style={{ padding: 12 }}>
          <Text style={{ color: "#fff", marginBottom: 8, fontWeight: "700" }}>
            Transaction complete
          </Text>
          <Text style={{ color: "#fff", marginBottom: 8 }}>
            The transaction is complete and funds have been disbursed.
          </Text>

          <View style={{ flexDirection: "row", marginTop: 8 }}>
            <TouchableOpacity
              onPress={() => {
                if (SUPPORT_PHONE) {
                  const tel =
                    Platform.OS === "android"
                      ? `tel:${SUPPORT_PHONE}`
                      : `telprompt:${SUPPORT_PHONE}`;
                  Linking.openURL(tel).catch(() => {});
                } else if (SUPPORT_EMAIL) {
                  Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
                } else {
                  Alert.alert(
                    "Support",
                    "Contact support via the Help section in the app."
                  );
                }
              }}
              style={{
                padding: 10,
                backgroundColor: "#3D454B",
                borderRadius: 8,
                marginRight: 8,
              }}
            >
              <Text style={{ color: "#fff" }}>Contact Support</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (transaction && transaction._id) {
                  router.push(
                    `/user/(screens)/transactions/${transaction._id}`
                  );
                }
              }}
              style={{
                padding: 10,
                backgroundColor: "#BBCC13",
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "#1A1A1A" }}>View Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView className="flex-1 bg-darkUmber-dark">
      <View className="flex-row items-center bg-frenchGray-dark p-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={20} color={"#FFFFFF"} />
        </TouchableOpacity>
        <View className="flex-row items-center ml-2">
          {profilePicture ? (
            <Image
              source={{ uri: profilePicture }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={40} color="#FFFFFF" />
          )}
          <Text style={{ color: "#fff", fontWeight: "700", marginLeft: 12 }}>
            {name}
          </Text>
        </View>
      </View>

      {renderBotBox()}

      {loadingMessages ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : sections.length > 0 ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) =>
            item._id ? item._id.toString() : `${item.senderId}-${Math.random()}`
          }
          renderItem={renderMessageItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={{ padding: 10, paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
          // preserve visual order: sections are oldest-first; you can invert if you want newest-first
          inverted={false}
        />
      ) : (
        <EmptyChatMessages />
      )}

      {showPaymentWebview && paymentInitData ? (
        <PaystackWebview
          reference={paymentInitData.reference}
          amount={
            paymentInitData.amount ||
            Math.round(
              (transaction?.amount ?? transaction?.draftSnapshot?.amount ?? 0) *
                100
            )
          }
          email={user.email}
          publicKey={PAYSTACK_PUBLIC_KEY}
          onVerified={(ref) =>
            onPaymentVerified(ref || paymentInitData.reference)
          }
        />
      ) : null}

      {/* Fallback checkoutUrl / Escrow WebView */}
      {/* Fallback checkoutUrl / Escrow WebView - WRAPPED IN MODAL */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showWebView}
        onRequestClose={() => setShowWebView(false)}
      >
        <EscrowWebview
          url={escrowProcessUrl || checkoutUrl}
          onClose={() => setShowWebView(false)}
          onSuccess={() => {
            setShowWebView(false);
            setBotStage("paid_pending_confirmation");
            setTimeout(fetchLatestTransaction, 2000);
          }}
          onCancel={() => setShowWebView(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

export default ChatScreen;
