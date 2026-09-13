import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/redux/auth.slice";
import productReducer from "../features/redux/product.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    product: productReducer,
  },
});
