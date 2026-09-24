import axios from "axios";

const api = axios.create({
  baseURL: "/api/product",
  withCredentials: true,
});

export const getWishlist = async () => {
  try {
    const response = await api.get("/get-wishlist");
    return response.data.products ?? [];
  } catch (error) {
    // The backend currently returns 404 when a user has not saved anything yet.
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
