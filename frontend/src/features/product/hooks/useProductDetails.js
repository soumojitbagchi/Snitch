import { useCallback, useEffect, useState } from "react";
import { productData } from "../services/product.api";
import { productError } from "../utils/product";

const initialResult = {
  key: null,
  product: null,
  error: "",
};

export default function useProductDetails(productId) {
  const [result, setResult] = useState(initialResult);
  const [requestNumber, setRequestNumber] = useState(0);
  const requestKey = `${productId ?? "missing"}:${requestNumber}`;

  const retry = useCallback(() => {
    setRequestNumber((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!productId) return () => controller.abort();

    productData(productId, controller.signal)
      .then((response) => {
        if (!response?.success || !response?.data || typeof response.data !== "object") {
          throw new Error("Invalid product response.");
        }

        if (!controller.signal.aborted) {
          setResult({ key: requestKey, product: response.data, error: "" });
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setResult({
            key: requestKey,
            product: null,
            error: productError(error, "Product could not be loaded. Please try again."),
          });
        }
      });

    return () => controller.abort();
  }, [productId, requestKey]);

  if (!productId) {
    return { product: null, loading: false, error: "Product not found.", retry };
  }

  const ready = result.key === requestKey;

  return {
    product: ready ? result.product : null,
    loading: !ready,
    error: ready ? result.error : "",
    retry,
  };
}
