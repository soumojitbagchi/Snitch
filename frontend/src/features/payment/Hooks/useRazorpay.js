import { useState, useCallback } from "react";
import { createRazorpayOrder, verifyRazorpayPayment } from "../service/payment.api";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentResult, setPaymentResult] = useState(null);

  const resetPaymentState = useCallback(() => {
    setLoading(false);
    setError("");
    setPaymentResult(null);
  }, []);

  const initializePayment = useCallback(
    async ({ order, customer, onSuccess, onFailure }) => {
      setLoading(true);
      setError("");

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !window.Razorpay) {
        const errorMsg = "Unable to load Razorpay payment gateway. Please check your connection.";
        setError(errorMsg);
        setLoading(false);
        if (onFailure) onFailure(new Error(errorMsg));
        return;
      }

      try {
        const orderData = await createRazorpayOrder({
          amount: order.total,
          currency: order.currency || "INR",
          receipt: order.id,
          orderId: order.id,
          notes: {
            order_id: order.id,
            customer_name: customer?.name || "",
          },
        });

        const { order_id, amount, currency, key_id } = orderData;

        if (!order_id || !key_id) {
          throw new Error("Invalid order response from payment server.");
        }

        const options = {
          key: key_id,
          amount,
          currency: currency || "INR",
          name: "SNITCH",
          description: `Order #${order.id}`,
          order_id,
          prefill: {
            name: customer?.name || customer?.fullName || "",
            email: customer?.email || "",
            contact: customer?.phone || customer?.contact || "",
          },
          notes: {
            order_id: order.id,
          },
          theme: {
            color: "#000000",
          },
          handler: async (response) => {
            try {
              const verifyData = await verifyRazorpayPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: order.total,
                currency: currency || "INR",
              });

              setLoading(false);
              const result = {
                orderId: order.id,
                razorpayOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: order.total,
                currency: currency || "INR",
                method: "Razorpay",
                verified: true,
                message: verifyData.message || "Payment verified successfully",
              };
              setPaymentResult(result);
              if (onSuccess) onSuccess(result);
            } catch (verifyErr) {
              setLoading(false);
              const verifyErrMsg =
                verifyErr?.response?.data?.error ||
                verifyErr?.message ||
                "Payment verification failed on the server.";
              setError(verifyErrMsg);
              if (onFailure) onFailure(verifyErr);
            }
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };

        const razorpayInstance = new window.Razorpay(options);

        razorpayInstance.on("payment.failed", (failResponse) => {
          setLoading(false);
          const failMsg =
            failResponse?.error?.description ||
            failResponse?.error?.reason ||
            "Payment transaction failed.";
          setError(failMsg);
          if (onFailure) onFailure(new Error(failMsg));
        });

        razorpayInstance.open();
      } catch (createErr) {
        setLoading(false);
        const createErrMsg =
          createErr?.response?.data?.error ||
          createErr?.message ||
          "Could not initialize order with payment server.";
        setError(createErrMsg);
        if (onFailure) onFailure(createErr);
      }
    },
    []
  );

  return {
    initializePayment,
    loading,
    error,
    paymentResult,
    resetPaymentState,
  };
}
