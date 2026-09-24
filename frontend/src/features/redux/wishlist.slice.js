import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addWishlistProduct as addWishlistProductRequest,
  getWishlist,
  removeWishlistProduct as removeWishlistProductRequest,
} from "../wishlist/services/wishlist.api";

const requestError = (error) => ({
  message: error.response?.data?.message || error.response?.data?.error || "Something went wrong. Please try again.",
  status: error.response?.status,
});

export const fetchWishlist = createAsyncThunk(
  "wishlist/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await getWishlist();
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  },
);

export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (product, { rejectWithValue }) => {
    try {
      const response = await addWishlistProductRequest(product._id);
      return { product, response };
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  },
);

export const removeWishlistItem = createAsyncThunk(
  "wishlist/remove",
  async (productId, { rejectWithValue }) => {
    try {
      await removeWishlistProductRequest(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(requestError(error));
    }
  },
);

const initialState = {
  items: [],
  status: "idle",
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlist: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload?.message || action.error.message;
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        const product = action.payload.product;
        if (!state.items.some((item) => item._id === product._id)) {
          state.items.push(product);
        }
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectWishlistStatus = (state) => state.wishlist.status;
export const selectWishlistError = (state) => state.wishlist.error;
export const selectIsWishlisted = (state, productId) =>
  state.wishlist.items.some((item) => item._id === productId);

export default wishlistSlice.reducer;
