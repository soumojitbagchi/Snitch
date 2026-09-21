import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  items: [],
  totalAmount: 0,
  currency: "INR",
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const payload = action.payload;
      if (!payload) return;

      const product = payload.product || payload;
      const variant = payload.variant || (product.variant && product.variant[0]) || null;
      const quantity = Math.max(1, payload.quantity || 1);

      const size = variant?.attributes?.size || payload.size || "M";
      const color = variant?.attributes?.color || payload.color || "Standard";
      const price =
        variant?.price?.basePrice ??
        payload.price ??
        (typeof product.price === "number" ? product.price : 999);
      const currency = variant?.price?.currency || payload.currency || "INR";
      const image =
        variant?.images?.[0]?.url ||
        product.images?.[0]?.url ||
        payload.image ||
        "";
      const productId = product._id || product.id || String(Date.now());
      const itemId = `${productId}-${size}-${color}`;

      const existingIndex = state.items.findIndex((item) => item.id === itemId);

      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += quantity;
      } else {
        state.items.push({
          id: itemId,
          productId,
          title: product.title || "Snitch Product",
          price,
          currency,
          size,
          color,
          image,
          quantity,
        });
      }

    },
    setCart:(state,action)=>{
      state.items = action.payload.items || [];
      state.totalAmount = action.payload.totalAmount ?? 0;
      state.currency = action.payload.currency || "INR";
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(
        (item) => item.id !== id && item.productId !== id
      );
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find((it) => it.id === id);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((it) => it.id !== id);
        } else {
          item.quantity = quantity;
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.currency = "INR";
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCart,
} = cartSlice.actions;

export const selectCartItems = (state) => state.cart.items;

export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + (item.quantity || 1), 0);

export const selectCartTotal = (state) => state.cart.totalAmount ?? 0;
export const selectCartCurrency = (state) => state.cart.currency || "INR";

export default cartSlice.reducer;
