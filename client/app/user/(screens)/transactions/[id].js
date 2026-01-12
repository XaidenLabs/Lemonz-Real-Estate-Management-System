import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { useAuth } from "../../../../contexts/AuthContext";
import { apiFetch } from "../../../../services/api";
import { getToken } from "../../../../services/getToken";
import { formatPrice } from "../../../../services/formatPrice";

/**
 * TransactionDetails page
 *
 * Expects route param: transactionId
 *
 * Backend endpoints used (adjust if your routes differ):
 * - GET  /api/transaction/:id              -> fetch single transaction
 * - POST /api/transaction/confirm          -> { transactionId, role: 'buyer'|'owner' }
 * - GET  /api/payouts/:id    (optional)   -> fetch payout details (if your API provides it)
 *
 * Adjust endpoint paths if your server uses different routes.
 */

const TransactionDetails = () => {
  const params = useLocalSearchParams();
  const transactionId = params.transactionId || params.id || null;

  const { user, getUser } = useAuth();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    // ensure user loaded, then fetch
    (async () => {
      try {
        await getUser();
      } catch (e) {
        // ignore
      }
      fetchTransaction();
    })();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, user?._id]);

  // Poll while awaiting_disbursement to update UI when admin disburses
  useEffect(() => {
    if (transaction?.status === "awaiting_disbursement" && !pollRef.current) {
      pollRef.current = setInterval(() => {
        fetchTransaction({ quiet: true });
      }, 5000);
    } else if (
      transaction &&
      transaction.status !== "awaiting_disbursement" &&
      pollRef.current
    ) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction?.status]);

  const fetchTransaction = async ({ quiet = false } = {}) => {
    if (!transactionId) return;
    if (!quiet) setLoading(true);
    try {
      const token = await getToken();
      // endpoint: GET /api/transaction/:id
      const data = await apiFetch(`/api/transaction/${transactionId}`, {
        method: "GET",
        token,
      });
      // expected shape: { transaction: { ... } } or transaction object directly
      const tx = data && data.transaction ? data.transaction : data;
      setTransaction(tx || null);
    } catch (err) {
      console.warn("fetchTransaction error:", err?.message || err);
      if (!quiet) Alert.alert("Error", "Could not fetch transaction details.");
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  const confirmTransactionAsBuyer = async () => {
    if (!transaction || !transaction._id)
      return Alert.alert("Error", "Transaction not available");
    if (!user || !user._id) return Alert.alert("Error", "User not available");

    Alert.alert(
      "Confirm payment",
      "Are you sure you want to confirm this transaction? This will notify the admin to disburse to the owner.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              setBusy(true);
              const token = await getToken();
              const res = await apiFetch("/api/transaction/confirm", {
                method: "POST",
                body: { transactionId: transaction._id, role: "buyer" },
                token,
              });
              setBusy(false);
              if (res && res.transaction) {
                setTransaction(res.transaction);
                Alert.alert(
                  "Confirmed",
                  "Transaction confirmed. Admin will disburse shortly.",
                );
              } else {
                Alert.alert("Done", "Confirmation sent.");
                fetchTransaction();
              }
            } catch (err) {
              setBusy(false);
              console.error("confirm error", err);
              Alert.alert(
                "Error",
                err.message || "Could not confirm transaction.",
              );
            }
          },
        },
      ],
    );
  };

  const openPhone = (phone) => {
    if (!phone) return;
    const tel =
      Platform.OS === "android" ? `tel:${phone}` : `telprompt:${phone}`;
    Linking.openURL(tel).catch(() =>
      Alert.alert("Error", "Could not open phone dialer"),
    );
  };

  if (!transactionId) {
    return (
      <SafeAreaView className="flex-1 bg-darkUmber-dark justify-center items-center">
        <Text className="text-white">No transaction selected</Text>
      </SafeAreaView>
    );
  }

  if (loading && !transaction) {
    return (
      <SafeAreaView className="flex-1 bg-darkUmber-dark justify-center items-center">
        <ActivityIndicator size="large" color="#BBCC13" />
      </SafeAreaView>
    );
  }

  const renderHeader = () => {
    const p = transaction?.draftSnapshot || {};
    return (
      <View className="p-4">
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {p.photo ? (
            <Image
              source={{ uri: p.photo }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                marginRight: 12,
              }}
            />
          ) : (
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 8,
                backgroundColor: "#2B2B2B",
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="home-outline" size={32} color="#FFFFFF" />
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>
              {p.title || transaction?.draftSnapshot?.title || "Property"}
            </Text>
            <Text style={{ color: "#9CA3AF", marginTop: 4 }}>
              {p.location || transaction?.draftSnapshot?.location || ""}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Status</Text>
            <Text style={{ color: "#fff", fontWeight: "700", marginTop: 4 }}>
              {transaction?.status || "Unknown"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: "#9CA3AF", fontSize: 12 }}>Amount</Text>
            <Text style={{ color: "#BBCC13", fontWeight: "700", marginTop: 4 }}>
              {transaction?.currency
                ? (transaction.currency.split?.(" - ")[1] ??
                  transaction.currency)
                : ""}{" "}
              {formatPrice(transaction?.amount ?? p.amount ?? 0)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderParticipants = () => {
    const owner =
      transaction?.owner || transaction?.ownerSnapshot || transaction?.ownerId;
    const buyer =
      transaction?.buyer || transaction?.buyerSnapshot || transaction?.buyerId;
    return (
      <View className="p-4 border-t border-b border-gray-700">
        <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Participants</Text>

        <View style={{ marginBottom: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Owner</Text>
          <Text style={{ color: "#fff" }}>
            {owner?.name || owner?.firstName
              ? `${owner.firstName || ""} ${owner.lastName || ""}`.trim()
              : owner || "Owner"}
          </Text>
          {owner?.phone ? (
            <TouchableOpacity
              onPress={() => openPhone(owner.phone)}
              style={{ marginTop: 6 }}
            >
              <Text style={{ color: "#BBCC13" }}>Call owner</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Buyer</Text>
          <Text style={{ color: "#fff" }}>
            {buyer?.name || buyer?.firstName
              ? `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim()
              : buyer || "Buyer"}
          </Text>
        </View>
      </View>
    );
  };

  const renderFinancials = () => {
    const amt = transaction?.amount ?? 0;
    const commission = Math.round(amt * 0.04 * 100) / 100;
    const net = Math.round((amt - commission) * 100) / 100;
    return (
      <View className="p-4 border-b border-gray-700">
        <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>
          Payment summary
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text style={{ color: "#fff" }}>Gross amount</Text>
          <Text style={{ color: "#fff" }}>
            {transaction?.currency ?? "NGN"} {formatPrice(amt)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text style={{ color: "#fff" }}>Platform commission (4%)</Text>
          <Text style={{ color: "#fff" }}>
            {transaction?.currency ?? "NGN"} {formatPrice(commission)}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: "#9CA3AF", fontWeight: "700" }}>
            Amount to owner
          </Text>
          <Text style={{ color: "#BBCC13", fontWeight: "700" }}>
            {transaction?.currency ?? "NGN"} {formatPrice(net)}
          </Text>
        </View>
      </View>
    );
  };

  const renderPayout = () => {
    const payout =
      transaction?.payout ||
      transaction?.payoutSnapshot ||
      transaction?.payoutId;
    if (!payout && !transaction?.payoutId) {
      return null;
    }

    // If payout details are embedded, show them, otherwise show link
    return (
      <View className="p-4 border-b border-gray-700">
        <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>Payout</Text>

        {transaction?.payoutSnapshot ? (
          <>
            <View style={{ marginBottom: 6 }}>
              <Text style={{ color: "#fff" }}>
                Status: {transaction.payoutSnapshot.status}
              </Text>
              <Text style={{ color: "#fff" }}>
                Amount:{" "}
                {transaction.payoutSnapshot.currency || transaction.currency}{" "}
                {formatPrice(transaction.payoutSnapshot.netAmount)}
              </Text>
              <Text style={{ color: "#fff" }}>
                Scheduled:{" "}
                {transaction.payoutSnapshot.scheduledAt
                  ? new Date(
                      transaction.payoutSnapshot.scheduledAt,
                    ).toLocaleString()
                  : "—"}
              </Text>
              {transaction.payoutSnapshot.providerReference ? (
                <Text style={{ color: "#fff" }}>
                  Provider ref: {transaction.payoutSnapshot.providerReference}
                </Text>
              ) : null}
            </View>
          </>
        ) : (
          <View>
            <Text style={{ color: "#fff", marginBottom: 8 }}>
              Payout queued (ID: {transaction?.payoutId || "—"})
            </Text>
            <TouchableOpacity
              style={{
                padding: 10,
                backgroundColor: "#BBCC13",
                borderRadius: 8,
                alignSelf: "flex-start",
              }}
              onPress={() => {
                // open admin payout details if you have routing
                if (transaction?.payoutId)
                  router.push(`/admin/payouts/${transaction.payoutId}`);
                else Alert.alert("Payout", "No detailed payout info available");
              }}
            >
              <Text style={{ color: "#1A1A1A" }}>View payout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderFooterActions = () => {
    const isBuyer =
      user &&
      (transaction?.buyerId === user._id ||
        (transaction?.buyer && transaction.buyer._id === user._id));
    return (
      <View className="p-4">
        <TouchableOpacity
          style={{
            padding: 12,
            backgroundColor: "#1E1E1E",
            borderRadius: 8,
            marginBottom: 10,
            alignItems: "center",
          }}
          onPress={() => fetchTransaction()}
          disabled={busy}
        >
          <Text style={{ color: "#fff" }}>
            {busy ? "Working..." : "Refresh"}
          </Text>
        </TouchableOpacity>

        {transaction?.status === "pending_confirmation" && isBuyer ? (
          <TouchableOpacity
            style={{
              padding: 12,
              backgroundColor: "#BBCC13",
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 10,
            }}
            onPress={confirmTransactionAsBuyer}
            disabled={busy}
          >
            <Text style={{ color: "#1A1A1A", fontWeight: "700" }}>
              {busy ? "Confirming..." : "Confirm Transaction (I paid)"}
            </Text>
          </TouchableOpacity>
        ) : null}

        {transaction?.status === "awaiting_disbursement" ? (
          <View>
            <Text style={{ color: "#9CA3AF", marginBottom: 8 }}>
              An admin will disburse the funds to the owner soon.
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (transaction?.ownerId)
                  openPhone(transaction.ownerId.mobileNumber);
                else Alert.alert("Contact", "Owner contact not available");
              }}
              style={{
                padding: 12,
                backgroundColor: "#3D454B",
                borderRadius: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>Contact Owner</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {transaction?.status === "completed" ? (
          <TouchableOpacity
            onPress={() => {
              // if you have a receipt URL, open it
              if (transaction?.receiptUrl) {
                Linking.openURL(transaction.receiptUrl).catch(() => {});
              } else {
                Alert.alert("Receipt", "Receipt not available");
              }
            }}
            style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: "#BBCC13",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#1A1A1A", fontWeight: "700" }}>
              View Receipt
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#131516" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          backgroundColor: "#212A2B",
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "700",
            marginLeft: 12,
          }}
        >
          Transaction
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {renderHeader()}

        {renderParticipants()}

        {renderFinancials()}

        {renderPayout()}

        {/* timestamps */}
        <View className="p-4 border-t border-gray-700">
          <Text style={{ color: "#9CA3AF", marginBottom: 6 }}>Timestamps</Text>
          <Text style={{ color: "#fff", marginBottom: 4 }}>
            Created:{" "}
            {transaction?.createdAt
              ? new Date(transaction.createdAt).toLocaleString()
              : "-"}
          </Text>
          <Text style={{ color: "#fff", marginBottom: 4 }}>
            Updated:{" "}
            {transaction?.updatedAt
              ? new Date(transaction.updatedAt).toLocaleString()
              : "-"}
          </Text>
        </View>

        {renderFooterActions()}
      </ScrollView>
    </SafeAreaView>
  );
};

export default TransactionDetails;
