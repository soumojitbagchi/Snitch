import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productError } from "../utils/product";
import {
  selectProducts,
  selectProductLoading,
  selectProductError,
  selectProductSuccess,
  selectLastFetchedAt,
  selectLastDetailsAt,
  setProducts,
  setLoading,
  setError,
  setSuccess,
  setSelectedProduct,
  upsertProduct,
  removeProduct,
  clearProductStatus,
  invalidateProductCache,
} from "../../redux/product.slice";
import {
  LIST_TTL_MS,
  DETAILS_TTL_MS,
  isFresh,
  readProductsAll,
  writeProductsAll,
  readProductDetails,
  writeProductDetails,
  clearProductCache,
} from "../services/product.cache";
import {
  fetchMyProducts,
  createProduct as createProductApi,
  editTitle as editTitleApi,
  editDescription as editDescriptionApi,
  editPrice as editPriceApi,
  updateProductImage as updateProductImageApi,
  deleteProduct as deleteProductApi,
  productData as productDataApi,
  fetchAllProducts as fetchAllProductsApi
} from "../services/product.api";

export const useProduct = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const success = useSelector(selectProductSuccess);
  const lastFetchedAt = useSelector(selectLastFetchedAt);
  const lastDetailsAt = useSelector(selectLastDetailsAt);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyIds, setBusyIds] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  const fetchProducts = useCallback(async (options) => {
    const force = options === true || options?.force === true;
    if (!force && products.length > 0 && isFresh(lastFetchedAt, LIST_TTL_MS)) {
      return { ok: true, products, cached: true };
    }
    if (!force) {
      const entry = readProductsAll();
      if (entry && isFresh(entry.ts, LIST_TTL_MS) && Array.isArray(entry.data)) {
        dispatch(setProducts(entry.data));
        return { ok: true, products: entry.data, cached: true };
      }
    }
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetchAllProductsApi();
      console.log(response);


      const fetchedProducts = response?.data;
      if (!Array.isArray(fetchedProducts)) {
        throw new Error("Invalid products response.");
      }

      dispatch(setProducts(fetchedProducts));
      writeProductsAll(fetchedProducts);
      return { ok: true, products: fetchedProducts };
    } catch (err) {
      const message = productError(err, "Failed to load products.");
      dispatch(setError(message));
      return { ok: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, products, lastFetchedAt]);

  const fetchSellerProducts = useCallback(async (signal) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    try {
      const response = await fetchMyProducts(signal);
      const fetchedProducts = response?.data;
      if (!Array.isArray(fetchedProducts)) {
        throw new Error("Invalid products response.");
      }

      dispatch(setProducts(fetchedProducts));
      dispatch(invalidateProductCache());
      return { ok: true, products: fetchedProducts };
    } catch (err) {
      if (signal?.aborted || err?.code === "ERR_CANCELED") {
        return { ok: false, canceled: true };
      }
      const message = productError(err, "Failed to load your products.");
      dispatch(setError(message));
      return { ok: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createProduct = useCallback(async (values) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));

    try {
      const response = await createProductApi(values);
      const product = response?.data ?? response?.product;

      if (!product) {
        throw new Error("Invalid product response.");
      }

      dispatch(upsertProduct(product));
      dispatch(setSuccess(response?.message ?? "Product created successfully."));
      clearProductCache();
      dispatch(invalidateProductCache());
      return { ok: true, product };
    } catch (err) {
      const message = productError(err, "Failed to create product.");
      dispatch(setError(message));
      return { ok: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateProduct = useCallback(async (productId, apiCall, fallbackMessage) => {
    setBusyIds((prev) => ({ ...prev, [productId]: true }));
    setItemErrors((prev) => ({ ...prev, [productId]: null }));

    try {
      const response = await apiCall();
      const product = response?.data ?? response?.product;

      if (!product) {
        throw new Error("Invalid updated product response.");
      }

      dispatch(upsertProduct(product));
      clearProductCache(productId);
      dispatch(invalidateProductCache(productId));
      return { ok: true, product };
    } catch (err) {
      const message = productError(err, fallbackMessage);
      setItemErrors((prev) => ({ ...prev, [productId]: message }));
      return { ok: false, error: message };
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  }, [dispatch]);

  const renameTitle = useCallback(
    (productId, title) =>
      updateProduct(productId, () => editTitleApi(productId, title), "Failed to update title."),
    [updateProduct]
  );

  const changeDescription = useCallback(
    (productId, description) =>
      updateProduct(productId, () => editDescriptionApi(productId, description), "Failed to update description."),
    [updateProduct]
  );

  const changePrice = useCallback(
    (productId, priceAmount, variantIndex = 0) =>
      updateProduct(productId, () => editPriceApi(productId, priceAmount, variantIndex), "Failed to update price."),
    [updateProduct]
  );

  const replaceImages = useCallback(
    (productId, images) =>
      updateProduct(productId, () => updateProductImageApi(productId, images), "Failed to update images."),
    [updateProduct]
  );

  const deleteProduct = useCallback(async (productId) => {
    setBusyIds((prev) => ({ ...prev, [productId]: true }));
    setItemErrors((prev) => ({ ...prev, [productId]: null }));

    try {
      await deleteProductApi(productId);
      dispatch(removeProduct(productId));
      clearProductCache(productId);
      dispatch(invalidateProductCache(productId));
      setPendingDelete(null);
      return { ok: true };
    } catch (err) {
      const message = productError(err, "Failed to delete product.");
      setItemErrors((prev) => ({ ...prev, [productId]: message }));
      return { ok: false, error: message };
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      });
    }
  }, [dispatch]);

  const getProductData = useCallback(async (productId, signal, options) => {
    const force = options === true || options?.force === true;
    if (!force && productId) {
      if (isFresh(lastDetailsAt?.[productId], DETAILS_TTL_MS)) {
        const entry = readProductDetails(productId);
        if (entry && entry.data && typeof entry.data === "object") {
          return { success: true, data: entry.data };
        }
      } else {
        const entry = readProductDetails(productId);
        if (entry && isFresh(entry.ts, DETAILS_TTL_MS) && entry.data && typeof entry.data === "object") {
          dispatch(setSelectedProduct(entry.data));
          return { success: true, data: entry.data };
        }
      }
    }
    try {
      const response = await productDataApi(productId, signal);
      if (response?.success && response?.data && typeof response.data === "object") {
        dispatch(setSelectedProduct(response.data));
        writeProductDetails(productId, response.data);
      }
      return response;
    } catch (err) {
      const message = productError(err, "Failed to get product data.");
      return { ok: false, error: message };
    }
  }, [dispatch, lastDetailsAt]);

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
    (productId) => Boolean(busyIds[productId]),
    [busyIds]
  );

  const isDeleting = useCallback(
    (productId) => Boolean(busyIds[productId]),
    [busyIds]
  );

  const getMutationError = useCallback(
    (productId) => itemErrors[productId] ?? null,
    [itemErrors]
  );

  return {
    products,
    loading,
    error,
    success,
    pendingDelete,

    fetchProducts,
    fetchSellerProducts,
    createProduct,
    renameTitle,
    changeDescription,
    changePrice,
    replaceImages,
    deleteProduct,
    getProductData,

    requestDelete,
    cancelDelete,
    clearStatus,

    isUpdating,
    isDeleting,
    getMutationError,
  };
};

export default useProduct;
