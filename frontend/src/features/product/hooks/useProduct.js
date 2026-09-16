import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productError } from "../utils/product";
import {
  selectProducts,
  selectProductLoading,
  selectProductError,
  selectProductSuccess,
  setProducts,
  setLoading,
  setError,
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
  productData as productDataApi,
  fetchAllProducts as fetchAllProductsApi
} from "../services/product.api";

export const useProduct = () => {
  const dispatch = useDispatch();

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductLoading);
  const error = useSelector(selectProductError);
  const success = useSelector(selectProductSuccess);

  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyIds, setBusyIds] = useState({});
  const [itemErrors, setItemErrors] = useState({});

  const fetchProducts = useCallback(async () => {
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
      return { ok: true, products: fetchedProducts };
    } catch (err) {
      const message = productError(err, "Failed to load products.");
      dispatch(setError(message));
      return { ok: false, error: message };
    } finally {
      dispatch(setLoading(false));
    }
  }, []);

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

  const getProductData = useCallback(async (productId, signal) => {
    try {
      const response = await productDataApi(productId, signal);
      return response;
    } catch (err) {
      const message = productError(err, "Failed to get product data.");
      return { ok: false, error: message };
    }
  }, []);

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
