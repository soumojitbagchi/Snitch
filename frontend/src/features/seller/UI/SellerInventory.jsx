import { useEffect, useMemo, useState } from "react";
import {
  fetchLowStock,
  fetchVariantVelocity,
  restockVariant,
  sendStockAlert,
} from "../services/seller.api";
import {
  EmptyState,
  LoadingBlock,
  PageHeader,
  StatusPill,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./seller.ui";

const variantAttr = (attrs, key) => attrs?.[key] ?? "";

function RestockCell({ row, onRestock, busy }) {
  const [qty, setQty] = useState("");

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={`restock-${row.variantId}`} className="sr-only">
        Add stock for {row.title}
      </label>
      <input
        id={`restock-${row.variantId}`}
        type="number"
        min="1"
        max="10000"
        value={qty}
        disabled={busy}
        onChange={(event) => setQty(event.target.value)}
        placeholder="+qty"
        className={`${inputClass} max-w-24 tabular-nums disabled:opacity-60`}
      />
      <button
        type="button"
        disabled={busy || !qty}
        onClick={() => {
          onRestock(row, Number(qty));
          setQty("");
        }}
        className={`${secondaryButtonClass} px-3 disabled:cursor-wait`}
      >
        {busy ? "…" : "Add"}
      </button>
    </div>
  );
}

export default function SellerInventory({ products = [], loading, onRefresh, setNotice }) {
  const [filter, setFilter] = useState("all");
  const [serverRows, setServerRows] = useState(null);
  const [velocity, setVelocity] = useState({});
  const [busyIds, setBusyIds] = useState({});
  const [alertBusy, setAlertBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchLowStock(1000), fetchVariantVelocity()])
      .then(([low, vel]) => {
        if (cancelled) return;
        setServerRows(Array.isArray(low?.data) ? low.data : []);
        setVelocity(vel?.data ?? {});
      })
      .catch(() => {
        if (!cancelled) setServerRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    if (serverRows) return serverRows;
    const out = [];
    for (const product of products) {
      for (const variant of product.variant ?? []) {
        out.push({
          productId: String(product._id),
          title: product.title,
          image: product.images?.[0]?.url || "",
          variantId: String(variant._id),
          size: variantAttr(variant.attributes, "size"),
          color: variantAttr(variant.attributes, "color"),
          price: variant.price,
          stock: Number(variant.stock) || 0,
          status: (Number(variant.stock) || 0) === 0 ? "out" : (Number(variant.stock) || 0) < 5 ? "low" : "in",
        });
      }
    }
    return out;
  }, [serverRows, products]);

  const filtered = rows.filter((row) => {
    if (filter === "low") return row.status === "low";
    if (filter === "out") return row.status === "out";
    return true;
  });

  const daysOfStock = (row) => {
    const perDay = velocity[`${row.productId}:${row.variantId}`]?.perDay ?? 0;
    if (perDay <= 0) return "—";
    return `${Math.floor(row.stock / perDay)}d`;
  };

  const handleRestock = async (row, quantity) => {
    if (!Number.isInteger(quantity) || quantity < 1) {
      setError("Enter a whole quantity of at least 1.");
      return;
    }
    setBusyIds((prev) => ({ ...prev, [row.variantId]: true }));
    setError("");
    try {
      await restockVariant({ productId: row.productId, variantId: row.variantId, quantity });
      setServerRows((prev) => (prev ? prev.map((item) => (item.variantId === row.variantId ? { ...item, stock: item.stock + quantity, status: item.stock + quantity < 5 ? "low" : "in" } : item)) : prev));
      if (onRefresh) await onRefresh();
      if (setNotice) setNotice(`Restocked ${quantity} unit(s) of ${row.title}.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Restock failed. Try again.");
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[row.variantId];
        return copy;
      });
    }
  };

  const handleAlert = async () => {
    setAlertBusy(true);
    try {
      const response = await sendStockAlert();
      if (setNotice) setNotice(response?.message || "Low-stock alert sent.");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not send the alert.");
    } finally {
      setAlertBusy(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      const [low, vel] = await Promise.all([fetchLowStock(1000), fetchVariantVelocity()]);
      setServerRows(Array.isArray(low?.data) ? low.data : []);
      setVelocity(vel?.data ?? {});
    } catch {
      setError("Could not refresh inventory.");
    } finally {
      setRefreshing(false);
    }
  };

  const counts = {
    all: rows.length,
    low: rows.filter((row) => row.status === "low").length,
    out: rows.filter((row) => row.status === "out").length,
  };

  return (
    <section aria-label="Inventory" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Inventory"
        description="Variant-level stock across your catalog. Restock inline; low stock is under 5 units."
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" disabled={refreshing} onClick={handleRefresh} className={secondaryButtonClass}>
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" disabled={alertBusy} onClick={handleAlert} className={primaryButtonClass}>
              {alertBusy ? "Sending…" : "Email low-stock alert"}
            </button>
          </div>
        }
      />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Stock filters">
        {[
          { key: "all", label: `All (${counts.all})` },
          { key: "low", label: `Low stock (${counts.low})` },
          { key: "out", label: `Out of stock (${counts.out})` },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={filter === option.key}
            onClick={() => setFilter(option.key)}
            className={`inline-flex min-h-11 items-center border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              filter === option.key
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6">
        {loading && rows.length === 0 ? (
          <LoadingBlock label="Loading inventory…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter === "all" ? "No variants yet" : `Nothing ${filter === "low" ? "low on" : "out of"} stock`}
            description={filter === "all" ? "Add products to start tracking inventory." : "All variants are healthy right now."}
          />
        ) : (
          <div className="overflow-x-auto border border-neutral-200">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-900 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                  <th scope="col" className="px-4 py-3">Variant</th>
                  <th scope="col" className="px-4 py-3">Stock</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Days left</th>
                  <th scope="col" className="px-4 py-3">Restock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filtered.map((row) => (
                  <tr key={`${row.productId}:${row.variantId}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-12 w-10 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                          {row.image ? (
                            <img src={row.image} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                          ) : null}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{row.title}</span>
                          <span className="block text-xs text-neutral-500">
                            {[row.size, row.color].filter(Boolean).join(" / ") || "Standard"}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{row.stock}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status === "in" ? "completed" : row.status} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-neutral-700">{daysOfStock(row)}</td>
                    <td className="px-4 py-3">
                      <RestockCell row={row} onRestock={handleRestock} busy={Boolean(busyIds[row.variantId])} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
