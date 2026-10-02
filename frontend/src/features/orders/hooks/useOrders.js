import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { fetchMyOrders, normalizeServerOrder } from "../services/order.api";

const initialResult = { key: null, orders: [], error: "" };

export default function useOrders() {
  const userId = useSelector((state) => state.auth.user?.id);
  const [result, setResult] = useState(initialResult);
  const [reloads, setReloads] = useState(0);
  const requestKey = `${userId ?? "guest"}:${reloads}`;
  const retry = useCallback(() => setReloads((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    if (!userId) return () => controller.abort();
    fetchMyOrders(1, 20, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        setResult({ key: requestKey, orders: list.map(normalizeServerOrder), error: "" });
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError?.code === "ERR_CANCELED") return;
        setResult({
          key: requestKey,
          orders: [],
          error: requestError?.response?.data?.message || "Could not load your orders.",
        });
      });
    return () => controller.abort();
  }, [userId, reloads, requestKey]);

  if (!userId) return { orders: [], loading: false, error: "", retry };
  const ready = result.key === requestKey;
  return {
    orders: ready ? result.orders : [],
    loading: !ready,
    error: ready ? result.error : "",
    retry,
  };
}
