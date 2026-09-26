import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

export const validateCouponApi = async ({ code, subtotal }) => {
  const response = await api.post("/coupon/validate", {
    code,
    subtotal,
  });
  return response.data;
};

export const couponErrorMessage = (error, fallback) =>
  error?.response?.data?.error || fallback || "Invalid or expired coupon code.";
