import { createApiClient } from "../../auth/services/api.client";

const api = createApiClient("/api/cart");

export const getCart = async () => {
    const response = await api.get("/");
    return response.data;
};

export const addProductToCart = async (productId, variantId, quantity = 1) => {
    const response = await api.post("/add", { productId, variantId, quantity });
    return response.data;
};

export const removeProductFromCart = async (productId, variantId) => {
    const response = await api.delete("/remove", { data: { productId, variantId } });
    return response.data;
};
export const updateCartQuantity = async (productId, variantId, quantity) => {
    const response = await api.patch("/quantity", { productId, variantId, quantity });
    return response.data;
};
export const clearRemoteCart = async () => {
    const response = await api.delete("/");
    return response.data;
};
export const totalValueFromCart = async ()=>{
    const response = await api.get("/totalValue");
    return response.data;
};
export const changeCurrency = async (currency) => {
    const response = await api.patch("/currency", { currency });
    return response.data;
};
