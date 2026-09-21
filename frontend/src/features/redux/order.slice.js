import { createSlice } from "@reduxjs/toolkit";

const STORAGE_KEY = "snitch_orders_v1";

const initialSampleOrders = [
  {
    id: "SN-982410",
    date: "Sep 14, 2026",
    status: "Out for Delivery",
    statusColor: "amber",
    totalAmount: 1499,
    itemCount: 1,
    items: [
      {
        title: "Oversized Heavyweight Tee",
        size: "L",
        color: "Black",
        quantity: 1,
        price: 1499,
        currency: "INR",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
      },
    ],
    deliveryEstimate: "Estimated delivery today by 8 PM",
  },
  {
    id: "SN-829104",
    date: "Sep 12, 2026",
    status: "Delivered",
    statusColor: "emerald",
    totalAmount: 1299,
    itemCount: 1,
    items: [
      {
        title: "Clean Oxford Shirt",
        size: "M",
        color: "Blue",
        quantity: 1,
        price: 1299,
        currency: "INR",
        image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?q=80&w=800&auto=format&fit=crop",
      },
    ],
    deliveryEstimate: "Delivered on Sep 12, 2026",
  },
  {
    id: "SN-640192",
    date: "Aug 28, 2026",
    status: "Delivered",
    statusColor: "emerald",
    totalAmount: 1999,
    itemCount: 1,
    items: [
      {
        title: "Slim-Fit Denim Jeans",
        size: "32",
        color: "Indigo",
        quantity: 1,
        price: 1999,
        currency: "INR",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
      },
    ],
    deliveryEstimate: "Delivered on Aug 28, 2026",
  },
];

const getInitialOrders = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return initialSampleOrders;
};

const saveOrdersToStorage = (orders) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // ignore
  }
};

const initialState = {
  orders: getInitialOrders(),
  latestOrder: null,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    createOrder: (state, action) => {
      const { items, totalAmount, itemCount } = action.payload;
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const newOrderId = `SN-${randomNum}`;
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      const newOrder = {
        id: newOrderId,
        date: dateStr,
        status: "Order Confirmed",
        statusColor: "emerald",
        totalAmount: totalAmount || 0,
        itemCount: itemCount || items?.length || 1,
        items: items || [],
        deliveryEstimate: "Estimated delivery in 2-4 business days",
      };

      state.orders.unshift(newOrder);
      state.latestOrder = newOrder;
      saveOrdersToStorage(state.orders);
    },
  },
});

export const { createOrder } = orderSlice.actions;

export const selectOrders = (state) => state.order.orders;
export const selectLatestOrder = (state) => state.order.latestOrder;

export default orderSlice.reducer;
