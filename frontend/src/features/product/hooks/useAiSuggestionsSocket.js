import { useCallback, useEffect, useState } from "react";
import { getAiSocket } from "../services/ai.socket";
import { fetchAllProducts, productData } from "../services/product.api";
import FALLBACK_PRODUCTS from "../data/fallbackProducts";
import { rankSimilar } from "../utils/similarity";

const MIN_SKELETON_MS = 800;
const AI_TIMEOUT_MS = 6000;

export default function useAiSuggestionsSocket(productId, currentProduct = null) {
  const [items, setItems] = useState([]);
  const [isAi, setIsAi] = useState(false);
  const [loading, setLoading] = useState(Boolean(productId));
  const [error, setError] = useState("");
  const [n, setN] = useState(0);
  const retry = useCallback(() => setN((x) => x + 1), []);

  useEffect(() => {
    if (!productId) return;
    const requestId = `${productId}:${n}:${Date.now()}`;
    const startedAt = Date.now();
    let alive = true;
    let aiCount = 0;
    const seen = new Set();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([]);
    setIsAi(false);
    setError("");
    setLoading(true);

    const stopSpinner = () => {
      const wait = Math.max(0, MIN_SKELETON_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (alive) setLoading(false);
      }, wait);
    };

    const loadFallback = async () => {
      try {
        const res = await fetchAllProducts();
        const list = Array.isArray(res?.data) ? res.data : [];
        let current = currentProduct;
        if (!current) {
          try {
            const detail = await productData(productId);
            if (detail?.success && detail?.data) current = detail.data;
          } catch {
            current = null;
          }
        }
        const ranked = rankSimilar(current, list, 4);
        if (alive && aiCount === 0) setItems(ranked.length > 0 ? ranked : FALLBACK_PRODUCTS);
      } catch {
        if (alive && aiCount === 0) setItems(FALLBACK_PRODUCTS);
      }
    };

    loadFallback();

    let socket;
    try {
      socket = getAiSocket();
    } catch {
      stopSpinner();
      return () => {
        alive = false;
      };
    }

    const onItem = (p) => {
      if (!alive || p?.requestId !== requestId || !p?.item?._id) return;
      if (p.item._id === productId || seen.has(p.item._id)) return;
      seen.add(p.item._id);
      aiCount += 1;
      if (aiCount === 1) setItems([]);
      setIsAi(true);
      setItems((prev) => [...prev, p.item]);
    };
    const onDone = (p) => {
      if (!alive || p?.requestId !== requestId) return;
      stopSpinner();
    };
    const onError = (p) => {
      if (!alive || p?.requestId !== requestId) return;
      stopSpinner();
    };

    socket.on("ai:suggest:item", onItem);
    socket.on("ai:suggest:done", onDone);
    socket.on("ai:suggest:error", onError);

    const subscribe = () => {
      if (!alive) return;
      socket.emit("ai:suggest:subscribe", { productId, requestId });
    };
    if (socket.connected) subscribe();
    else socket.once("connect", subscribe);

    const timer = setTimeout(() => {
      if (alive) stopSpinner();
    }, AI_TIMEOUT_MS);

    return () => {
      alive = false;
      clearTimeout(timer);
      try {
        socket.emit("ai:suggest:unsubscribe", { requestId });
      } catch {
        /* noop */
      }
      socket.off("ai:suggest:item", onItem);
      socket.off("ai:suggest:done", onDone);
      socket.off("ai:suggest:error", onError);
      socket.off("connect", subscribe);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, n]);

  if (!productId) return { items: [], loading: false, error: "", retry, isAi: false };
  return { items, loading, error, retry, isAi };
}
