import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/redux/auth.slice";
import productReducer from "../features/redux/product.slice";
import cartReducer from "../features/redux/cart.slice";
import orderReducer from "../features/redux/order.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    order: orderReducer,
  },
});
