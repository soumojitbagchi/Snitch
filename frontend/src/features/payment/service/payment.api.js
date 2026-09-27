import { createApiClient } from "../../auth/services/api.client";

const api = createApiClient("/api");

export const createRazorpayOrder = async ({
  source,
  items = [],
  orderId,
  couponCode,
}) => {
  const response = await api.post("/create-order", {
    source,
    items,
    orderId,
    couponCode,
  });
  return response.data;
};

export const validateCoupon = async ({ code, subtotal }) => {
  const response = await api.post("/coupon/validate", {
    code,
    subtotal,
  });
  return response.data;
};

export const verifyRazorpayPayment = async ({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
}) => {
  const response = await api.post("/verify-payment", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  });
  return response.data;
};

export const fetchOrderStatus = async (orderId) => {
  const response = await api.get(`/order-status/${encodeURIComponent(orderId)}`);
  return response.data;
};
