import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  products: [],
  loading: false,
  creating: false,
  updating: {},
  deleting: {},
  error: null,
  mutationErrors: {},
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

      const index = state.products.findIndex(
        (item) => item._id === product._id
      );

      if (index === -1) {
        state.products.unshift(product);
      } else {
        state.products[index] = product;
      }
    },

    removeProduct: (state, action) => {
      const productId = action.payload;

      state.products = state.products.filter(
        (product) => product._id !== productId
      );
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setCreating: (state, action) => {
      state.creating = action.payload;
    },

    setUpdating: (state, action) => {
      const { productId, value } = action.payload;

      if (value) {
        state.updating[productId] = true;
      } else {
        delete state.updating[productId];
      }
    },

    setDeleting: (state, action) => {
      const { productId, value } = action.payload;

      if (value) {
        state.deleting[productId] = true;
      } else {
        delete state.deleting[productId];
      }
    },

    setError: (state, action) => {
      state.error = action.payload ?? null;
    },

    setMutationError: (state, action) => {
      const { productId, error } = action.payload;

      if (error) {
        state.mutationErrors[productId] = error;
      } else {
        delete state.mutationErrors[productId];
      }
    },

    setSuccess: (state, action) => {
      state.success = action.payload ?? null;
    },

    clearProductStatus: (state) => {
      state.error = null;
      state.success = null;
      state.mutationErrors = {};
    },
  },
});

export const {
  setProducts,
  upsertProduct,
  removeProduct,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setError,
  setMutationError,
  setSuccess,
  clearProductStatus,
} = productSlice.actions;

export const selectProducts = (state) => state.product.products;
export const selectProductLoading = (state) => state.product.loading;
export const selectProductCreating = (state) => state.product.creating;
export const selectProductUpdating = (state) => state.product.updating;
export const selectProductDeleting = (state) => state.product.deleting;
export const selectProductError = (state) => state.product.error;
export const selectProductMutationErrors = (state) =>
  state.product.mutationErrors;
export const selectProductSuccess = (state) => state.product.success;

export default productSlice.reducer;