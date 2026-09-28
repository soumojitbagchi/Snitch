import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/redux/auth.slice";
import productReducer from "../features/redux/product.slice";
import cartReducer from "../features/redux/cart.slice";
import currencyReducer from "../features/redux/currency.slice";
import orderReducer from "../features/redux/order.slice";
import wishlistReducer from "../features/redux/wishlist.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
    cart: cartReducer,
    currency: currencyReducer,
    order: orderReducer,
    wishlist: wishlistReducer,
  },
});
