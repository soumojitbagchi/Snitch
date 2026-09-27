import { createApiClient } from "../../auth/services/api.client";

const api = createApiClient("/api/product");

export const getWishlist = async () => {
  try {
    const response = await api.get("/get-wishlist");
    return response.data.products ?? [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
};

export const addWishlistProduct = async (productId) => {
  const response = await api.post("/add-wishlist", { productId });
  return response.data;
};

export const removeWishlistProduct = async (productId) => {
  const response = await api.delete("/remove-wishlist", { data: { productId } });
  return response.data;
};
