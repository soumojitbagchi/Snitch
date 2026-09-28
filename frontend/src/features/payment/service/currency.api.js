import { createApiClient } from "../../auth/services/api.client";

const api = createApiClient("/api/currency");

export const fetchSupportedCurrencies = async () => {
  const response = await api.get("/supported");
  return response.data;
};

// Display-only conversion for direct/BuyNow totals. Charging always goes
// through the server-priced Razorpay order (checkout.service.js).
export const convertCurrency = async ({ amount, from, to }) => {
  const response = await api.post("/convert", { amount, from, to });
  return response.data;
};
