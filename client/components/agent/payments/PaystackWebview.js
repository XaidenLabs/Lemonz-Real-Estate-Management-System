import React, { useMemo } from "react";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { router } from "expo-router";
import { config } from "../../../config";
import { getToken } from "../../../services/getToken";

const PaystackWebview = ({
  reference,
  amount,
  email,
  publicKey,
  onVerified,
}) => {
  const verifyUrl = `${config.API_BASE_URL}/api/payment/verify`;

  const injectedHtml = useMemo(() => {
    return `
      <!doctype html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width,initial-scale=1" />
        </head>
        <body>
          <div id="root"></div>

          <script>
            (function(){
              var s = document.createElement('script');
              s.src = 'https://js.paystack.co/v1/inline.js';
              s.async = true;
              s.onload = function(){
                try {
                  var handler = PaystackPop.setup({
                    key: '${publicKey}',
                    email: '${email}',
                    amount: ${amount},
                    channels: ['card', 'bank'],
                    currency: 'NGN',
                    ref: '${reference}',
                    callback: function(response) {
                      try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'success', reference: response.reference }));
                      } catch(e){}
                    },
                    onClose: function(){
                      try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'closed' }));
                      } catch(e){}
                    }
                  });

                  setTimeout(function(){
                    try {
                      handler.openIframe();
                    } catch (e) {
                      try {
                        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'openIframe error: ' + (e && e.message ? e.message : e) }));
                      } catch(err){}
                    }
                  }, 400);
                } catch (err) {
                  try {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'setup error: ' + (err && err.message ? err.message : err) }));
                  } catch(e){}
                }
              };
              s.onerror = function(e){
                try {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'error', message: 'Failed to load Paystack script' }));
                } catch(err){}
              };

              document.head.appendChild(s);
            })();
          </script>
        </body>
      </html>
    `;
  }, [publicKey, email, amount, reference]);

  const onMessage = async (event) => {
    let data;
    try {
      data = JSON.parse(event.nativeEvent.data);
    } catch (e) {
      return;
    }

    if (data.type === "success") {
      try {
        const token = await getToken();
        const res = await fetch(`${verifyUrl}?reference=${reference}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        if (json.data?.status === "success") {
          Alert.alert("Success", "Payment completed");
          onVerified();
        } else {
          Alert.alert("Payment not confirmed", "Please contact support", [
            {
              text: "OK",
              onPress: () => {
                router.back();
              },
            },
          ]);
        }
      } catch (err) {
        Alert.alert("Payment Error", "Could not verify payment.", [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]);
      }
    } else if (data.type === "closed") {
      Alert.alert("Payment cancelled", "You closed the payment", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    } else if (data.type === "error") {
      Alert.alert("Payment Error", data.message || "Unknown web error", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: injectedHtml, baseUrl: "about:blank" }}
        key={reference}
        onMessage={onMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="always"
        cacheEnabled={false}
      />
    </SafeAreaView>
  );
};

export default PaystackWebview;
