import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const createRazorpayOrder = async ({
  source,
  items = [],
  orderId,
}) => {
  const response = await api.post("/create-order", {
    source,
    items,
    orderId,
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
