import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const createRazorpayOrder = async ({
  amount,
  currency = "INR",
  receipt,
  notes = {},
  orderId,
  isSubunits = false,
}) => {
  const response = await api.post("/create-order", {
    amount,
    currency,
    receipt,
    notes,
    orderId,
    isSubunits,
  });
  return response.data;
};

export const verifyRazorpayPayment = async ({
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature,
  amount,
  currency,
}) => {
  const response = await api.post("/verify-payment", {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    amount,
    currency,
  });
  return response.data;
};

export const fetchOrderStatus = async (orderId) => {
  const response = await api.get(`/order-status/${encodeURIComponent(orderId)}`);
  return response.data;
};
