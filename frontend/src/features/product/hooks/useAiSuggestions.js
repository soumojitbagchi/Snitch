import { useCallback, useEffect, useState } from "react";
import { fetchAiSuggestions, productData } from "../services/product.api";
import { productError } from "../utils/product";

const asArray = (value) => (Array.isArray(value) ? value : []);

// Backend returns { suggestions, success } where suggestions is either the
// structured object { recommendations: [...] } or a JSON string of it.
function extractRecommendations(payload) {
  const suggestions = payload?.suggestions ?? payload;
  if (typeof suggestions === "string") {
    try {
      const parsed = JSON.parse(suggestions);
      return asArray(parsed?.recommendations);
    } catch {
      return [];
    }
  }
  return asArray(suggestions?.recommendations);
}

const initialResult = { key: null, items: [], error: "" };

export default function useAiSuggestions(productId) {
  const [result, setResult] = useState(initialResult);
  const [requestNumber, setRequestNumber] = useState(0);
  const requestKey = `${productId ?? "missing"}:${requestNumber}`;

  const retry = useCallback(() => setRequestNumber((n) => n + 1), []);

  useEffect(() => {
    const controller = new AbortController();

    if (!productId) return () => controller.abort();

    fetchAiSuggestions(productId, controller.signal)
      .then(async (response) => {
        const recs = extractRecommendations(response);
        const seen = new Set();
        const unique = recs.filter((rec) => {
          const id = rec?.productId;
          if (!id || seen.has(id)) return false;
          if (id === productId) return false;
          seen.add(id);
          return true;
        });

        const resolved = await Promise.all(
          unique.slice(0, 8).map(async (rec) => {
            // Prefer backend-provided snapshot fields when present.
            if (rec?.productName || rec?.productImage) {
              return {
                _id: rec.productId,
                title: rec.productName || "Recommended product",
                images: rec.productImage ? [{ url: rec.productImage }] : [],
                description: rec.reason || "",
                recommendationMeta: rec,
              };
            }
            try {
              const detail = await productData(rec.productId, controller.signal);
              if (!detail?.success || !detail?.data) return null;
              return { ...detail.data, recommendationMeta: rec };
            } catch {
              return null;
            }
          }),
        );

        if (!controller.signal.aborted) {
          setResult({ key: requestKey, items: resolved.filter(Boolean), error: "" });
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        // Guest (401/403) and Mistral quota (503) hide the section quietly.
        if (err?.response?.status === 401 || err?.response?.status === 403 || err?.response?.status === 503) {
          setResult({ key: requestKey, items: [], error: "" });
          return;
        }
        setResult({
          key: requestKey,
          items: [],
          error: productError(err, "Recommendations could not be loaded."),
        });
      });

    return () => controller.abort();
  }, [productId, requestKey]);

  if (!productId) return { items: [], loading: false, error: "", retry };

  const ready = result.key === requestKey;
  return {
    items: ready ? result.items : [],
    loading: !ready,
    error: ready ? result.error : "",
    retry,
  };
}
