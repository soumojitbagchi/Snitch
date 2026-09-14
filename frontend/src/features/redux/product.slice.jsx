import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  success: null,
};

const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload ?? [];
    },

    upsertProduct: (state, action) => {
      const product = action.payload;
      if (!product?._id) return;

      const index = state.products.findIndex((item) => item._id === product._id);
      if (index === -1) {
        state.products.unshift(product);
      } else {
        state.products[index] = product;
      }
    },

    removeProduct: (state, action) => {
      state.products = state.products.filter((item) => item._id !== action.payload);
    },

    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload ?? null;
    },

    setLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },

    setError: (state, action) => {
      state.error = action.payload ?? null;
    },

    setSuccess: (state, action) => {
      state.success = action.payload ?? null;
    },

    clearProductStatus: (state) => {
      state.error = null;
      state.success = null;
    },

    setCreating: (state, action) => {
      state.loading = Boolean(action.payload);
    },

    setUpdating: () => {},
    setDeleting: () => {},
    setMutationError: () => {},
  },
});

export const {
  setProducts,
  upsertProduct,
  removeProduct,
  setSelectedProduct,
  setLoading,
  setError,
  setSuccess,
  clearProductStatus,
  setCreating,
  setUpdating,
  setDeleting,
  setMutationError,
} = productSlice.actions;

export const selectProducts = (state) => state.product.products;
export const selectProduct = (state) => state.product.selectedProduct;
export const selectProductLoading = (state) => state.product.loading;
export const selectProductError = (state) => state.product.error;
export const selectProductSuccess = (state) => state.product.success;

export const selectProductCreating = (state) => state.product.loading;
export const selectProductUpdating = () => ({});
export const selectProductDeleting = () => ({});
export const selectProductMutationErrors = () => ({});

export default productSlice.reducer;