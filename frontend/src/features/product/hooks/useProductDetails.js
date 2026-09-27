import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productData } from "../services/product.api";
import { productError } from "../utils/product";
import { selectLastDetailsAt, setSelectedProduct } from "../../redux/product.slice";
import {
  DETAILS_TTL_MS,
  isFresh,
  readProductDetails,
  writeProductDetails,
} from "../services/product.cache";

const initialResult = {
  key: null,
  product: null,
  error: "",
};

export default function useProductDetails(productId) {
  const dispatch = useDispatch();
  const lastDetailsAt = useSelector(selectLastDetailsAt);
  const stampsRef = useRef(lastDetailsAt);
  useEffect(() => {
    stampsRef.current = lastDetailsAt;
  });
  const [result, setResult] = useState(initialResult);
  const [requestNumber, setRequestNumber] = useState(0);
  const requestKey = `${productId ?? "missing"}:${requestNumber}`;

  const retry = useCallback(() => {
    setRequestNumber((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    if (!productId) return () => controller.abort();

    const serveCached = () => {
      const entry = readProductDetails(productId);
      if (!entry || !entry.data || typeof entry.data !== "object") return null;
      if (isFresh(stampsRef.current?.[productId], DETAILS_TTL_MS)) return entry.data;
      if (isFresh(entry.ts, DETAILS_TTL_MS)) {
        dispatch(setSelectedProduct(entry.data));
        return entry.data;
      }
      return null;
    };

    Promise.resolve()
      .then(() => {
        if (controller.signal.aborted) return;
        const hit = serveCached();
        if (hit) {
          setResult({ key: requestKey, product: hit, error: "" });
          return;
        }
        return productData(productId, controller.signal).then((response) => {
          if (!response?.success || !response?.data || typeof response.data !== "object") {
            throw new Error("Invalid product response.");
          }
          if (controller.signal.aborted) return;
          dispatch(setSelectedProduct(response.data));
          writeProductDetails(productId, response.data);
          setResult({ key: requestKey, product: response.data, error: "" });
        });
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
  }, [productId, requestKey, dispatch]);

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
