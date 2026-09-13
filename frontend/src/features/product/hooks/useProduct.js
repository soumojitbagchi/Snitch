import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productError } from "../utils/product";

import {
  selectProducts,
  selectProductLoading,
  selectProductCreating,
  selectProductUpdating,
  selectProductDeleting,
  selectProductError,
  selectProductMutationErrors,
  selectProductSuccess,
  setProducts,
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setError,
  setMutationError,
  setSuccess,
  upsertProduct,
  removeProduct,
  clearProductStatus,
} from "../../redux/product.slice";

import {
  fetchMyProducts,
  createProduct as createProductApi,
  editTitle as editTitleApi,
  editDescription as editDescriptionApi,
  editPrice as editPriceApi,
  updateProductImage as updateProductImageApi,
  deleteProduct as deleteProductApi,
} from "../services/product.api";

const messageOf = productError;

const getProductFromResponse = (response) =>
  response?.data ?? response?.product ?? null;

export const useProduct = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const creating = useSelector(selectProductCreating);
  const updating = useSelector(selectProductUpdating);
  const deleting = useSelector(selectProductDeleting);
  const error = useSelector(selectProductError);
  const mutationErrors = useSelector(selectProductMutationErrors);
  const success = useSelector(selectProductSuccess);

  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchProducts = useCallback(async (signal) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetchMyProducts(signal);
      if (signal?.aborted) return { ok: false };

      const fetchedProducts = response?.data;

      if (!Array.isArray(fetchedProducts)) {
        throw new Error("Invalid products response.");
      }

      dispatch(setProducts(fetchedProducts));

      return {
        ok: true,
        products: fetchedProducts,
      };
    } catch (err) {
      if (signal?.aborted) return { ok: false };
      const message = messageOf(err, "Failed to load products.");

      dispatch(setError(message));

      return {
        ok: false,
        error: message,
      };
    } finally {
      if (!signal?.aborted) dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createProduct = useCallback(
    async (values) => {
      dispatch(setCreating(true));
      dispatch(setError(null));
      dispatch(setSuccess(null));

      try {
        const response = await createProductApi(values);

        const product = getProductFromResponse(response);

        if (!product) {
          throw new Error("Invalid product response.");
        }

        dispatch(upsertProduct(product));

        dispatch(
          setSuccess(
            response?.message ?? "Product created successfully."
          )
        );

        return {
          ok: true,
          product,
        };
      } catch (err) {
        const message = messageOf(err, "Failed to create product.");

        return {
          ok: false,
          error: message,
        };
      } finally {
        dispatch(setCreating(false));
      }
    },
    [dispatch]
  );

  const updateProduct = useCallback(
    async (productId, apiCall, fallbackMessage) => {
      dispatch(
        setUpdating({
          productId,
          value: true,
        })
      );

      dispatch(
        setMutationError({
          productId,
          error: null,
        })
      );

      try {
        const response = await apiCall();

        const product = getProductFromResponse(response);

        if (!product) {
          throw new Error("Invalid updated product response.");
        }

        dispatch(upsertProduct(product));

        return {
          ok: true,
          product,
        };
      } catch (err) {
        const message = messageOf(err, fallbackMessage);

        dispatch(
          setMutationError({
            productId,
            error: message,
          })
        );

        return {
          ok: false,
          error: message,
        };
      } finally {
        dispatch(
          setUpdating({
            productId,
            value: false,
          })
        );
      }
    },
    [dispatch]
  );

  const renameTitle = useCallback(
    (productId, title) =>
      updateProduct(
        productId,
        () => editTitleApi(productId, title),
        "Failed to update title."
      ),
    [updateProduct]
  );

  const changeDescription = useCallback(
    (productId, description) =>
      updateProduct(
        productId,
        () => editDescriptionApi(productId, description),
        "Failed to update description."
      ),
    [updateProduct]
  );

  const changePrice = useCallback(
    (productId, priceAmount, variantIndex = 0) =>
      updateProduct(
        productId,
        () => editPriceApi(productId, priceAmount, variantIndex),
        "Failed to update price."
      ),
    [updateProduct]
  );

  const replaceImages = useCallback(
    (productId, images) =>
      updateProduct(
        productId,
        () => updateProductImageApi(productId, images),
        "Failed to update images."
      ),
    [updateProduct]
  );

  const deleteProduct = useCallback(
    async (productId) => {
      dispatch(
        setDeleting({
          productId,
          value: true,
        })
      );

      dispatch(
        setMutationError({
          productId,
          error: null,
        })
      );

      try {
        await deleteProductApi(productId);

        dispatch(removeProduct(productId));

        setPendingDelete(null);

        return {
          ok: true,
        };
      } catch (err) {
        const message = messageOf(err, "Failed to delete product.");

        dispatch(
          setMutationError({
            productId,
            error: message,
          })
        );

        return {
          ok: false,
          error: message,
        };
      } finally {
        dispatch(
          setDeleting({
            productId,
            value: false,
          })
        );
      }
    },
    [dispatch]
  );

  const requestDelete = useCallback((product) => {
    setPendingDelete(product);
  }, []);

  const cancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const clearStatus = useCallback(() => {
    dispatch(clearProductStatus());
  }, [dispatch]);

  const isUpdating = useCallback(
    (productId) => Boolean(updating[productId]),
    [updating]
  );

  const isDeleting = useCallback(
    (productId) => Boolean(deleting[productId]),
    [deleting]
  );

  const getMutationError = useCallback(
    (productId) => mutationErrors[productId] ?? null,
    [mutationErrors]
  );

  return {
    products,
    loading,
    creating,
    updating,
    deleting,
    error,
    mutationErrors,
    success,
    pendingDelete,

    fetchProducts,
    createProduct,
    renameTitle,
    changeDescription,
    changePrice,
    replaceImages,
    deleteProduct,

    requestDelete,
    cancelDelete,
    clearStatus,

    isUpdating,
    isDeleting,
    getMutationError,
  };
};

export default useProduct;
