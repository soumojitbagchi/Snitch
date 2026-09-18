import { createSlice } from "@reduxjs/toolkit";
import { mockProducts } from "../product/UI/mockProducts";

const STORAGE_KEY = "snitch_cart_items_v1";

const getInitialItems = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback if localStorage throws
  }

  // Pre-seed with two initial products for testing
  const p1 = mockProducts[0];
  const p2 = mockProducts[1];
  const defaultItems = [];

  if (p1) {
    defaultItems.push({
      id: `${p1._id}-M`,
      productId: p1._id,
      title: p1.title,
      price: p1.variant?.[0]?.price?.basePrice || 999,
      currency: p1.variant?.[0]?.price?.currency || "INR",
      size: p1.variant?.[0]?.attributes?.size || "M",
      color: p1.variant?.[0]?.attributes?.color || "Black",
      image: p1.images?.[0]?.url || "",
      quantity: 1,
    });
  }

  if (p2) {
    defaultItems.push({
      id: `${p2._id}-32`,
      productId: p2._id,
      title: p2.title,
      price: p2.variant?.[0]?.price?.basePrice || 1999,
      currency: p2.variant?.[0]?.price?.currency || "INR",
      size: p2.variant?.[0]?.attributes?.size || "32",
      color: p2.variant?.[0]?.attributes?.color || "Indigo",
      image: p2.images?.[0]?.url || "",
      quantity: 1,
    });
  }

  return defaultItems;
};

const saveToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

const initialState = {
  items: getInitialItems(),
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

      saveToStorage(state.items);
    },
    setCart:(state,action)=>{
      state.items = action.payload.items || [];
      state.totalAmount = action.payload.totalAmount ?? 0;
      state.currency = action.payload.currency || "INR";
      saveToStorage(state.items);
    },

    removeFromCart: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(
        (item) => item.id !== id && item.productId !== id
      );
      saveToStorage(state.items);
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
        saveToStorage(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      saveToStorage(state.items);
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
