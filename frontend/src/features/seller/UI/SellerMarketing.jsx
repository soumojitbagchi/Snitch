import { useEffect, useState } from "react";
import {
  createSellerCoupon,
  deleteSellerCoupon,
  fetchSellerCoupons,
} from "../services/seller.api";
import { toggleProductSale } from "../../product/services/product.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusPill,
  inputClass,
  primaryButtonClass,
} from "./seller.ui";
const EMPTY_FORM = {
  coupon: "",
  discountType: "FLAT",
  discountValue: "",
  minAmount: "",
  stock: "100",
  expiresAt: "",
  maxDiscount: "",
  currency: "INR",
};

const withLiveFlag = (list) => {
  const now = Date.now();
  return list.map((coupon) => ({
    ...coupon,
    isLive: new Date(coupon.expiresAt).getTime() >= now && coupon.stock >= 1,
  }));
};

export default function SellerMarketing({ products = [], onRefresh, setNotice }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [busyIds, setBusyIds] = useState({});
  const [saleBusy, setSaleBusy] = useState({});

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchSellerCoupons();
      setCoupons(withLiveFlag(Array.isArray(response?.data) ? response.data : []));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not load coupons.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchSellerCoupons()
      .then((response) => {
        if (cancelled) return;
        setCoupons(withLiveFlag(Array.isArray(response?.data) ? response.data : []));
        setLoading(false);
      })
      .catch((requestError) => {
        if (cancelled) return;
        setError(requestError?.response?.data?.message || "Could not load coupons.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!form.coupon.trim() || !form.expiresAt || form.discountValue === "") {
      setFormError("Code, expiry and discount value are required.");
      return;
    }
    setFormBusy(true);
    try {
      await createSellerCoupon({
        coupon: form.coupon.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minAmount: Number(form.minAmount) || 0,
        stock: Number(form.stock) || 0,
        expiresAt: new Date(form.expiresAt).toISOString(),
        maxDiscount: form.maxDiscount === "" ? null : Number(form.maxDiscount),
        currency: form.currency,
      });
      setForm(EMPTY_FORM);
      await load();
      if (setNotice) setNotice("Coupon created.");
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || "Could not create the coupon.");
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async (code) => {
    setBusyIds((prev) => ({ ...prev, [code]: true }));
    try {
      await deleteSellerCoupon(code);
      setCoupons((prev) => prev.filter((item) => item.coupon !== code));
      if (setNotice) setNotice(`Coupon ${code} deleted.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not delete the coupon.");
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[code];
        return copy;
      });
    }
  };

  const handleSale = async (product) => {
    const next = !product.onSale;
    setSaleBusy((prev) => ({ ...prev, [product._id]: true }));
    try {
      await toggleProductSale(product._id, next);
      if (onRefresh) await onRefresh();
      if (setNotice) setNotice(next ? `${product.title} opted into sale.` : `${product.title} removed from sale.`);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Could not update sale status.");
    } finally {
      setSaleBusy((prev) => {
        const copy = { ...prev };
        delete copy[product._id];
        return copy;
      });
    }
  };

  return (
    <section aria-label="Marketing" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Marketing"
        description="Coupons scoped to your store, plus sale opt-in per product."
      />

      <h2 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Your coupons
      </h2>
      <div className="mt-3">
        {loading ? (
          <LoadingBlock label="Loading coupons…" />
        ) : error && coupons.length === 0 ? (
          <ErrorBlock error={error} onRetry={load} />
        ) : coupons.length === 0 ? (
          <EmptyState
            title="No coupons yet"
            description="Create a store coupon below. Buyers apply it at checkout."
          />
        ) : (
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {coupons.map((coupon) => (
              <li key={coupon.coupon} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="font-bold tracking-wider">{coupon.coupon}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {coupon.discountType === "FLAT"
                      ? `${coupon.currency} ${coupon.discountValue} off`
                      : `${coupon.discountValue}% off`}
                    {` · min ${coupon.currency} ${coupon.minAmount} · ${coupon.stock} left · expires ${new Date(coupon.expiresAt).toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={coupon.isLive ? "completed" : "failed"} />
                  <button
                    type="button"
                    disabled={Boolean(busyIds[coupon.coupon])}
                    onClick={() => handleDelete(coupon.coupon)}
                    className="inline-flex min-h-11 items-center border border-red-200 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
                  >
                    {busyIds[coupon.coupon] ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        New coupon
      </h2>
      <form onSubmit={handleCreate} className="mt-3 grid gap-4 border border-neutral-200 p-5 sm:grid-cols-2">
        <div>
          <label htmlFor="coupon-code" className="text-xs font-medium text-neutral-700">Code</label>
          <input id="coupon-code" value={form.coupon} onChange={set("coupon")} placeholder="DIWALI20" className={`${inputClass} mt-1 uppercase`} />
        </div>
        <div>
          <label htmlFor="coupon-type" className="text-xs font-medium text-neutral-700">Type</label>
          <select id="coupon-type" value={form.discountType} onChange={set("discountType")} className={`${inputClass} mt-1`}>
            <option value="FLAT">Flat off</option>
            <option value="PERCENT">Percent off</option>
          </select>
        </div>
        <div>
          <label htmlFor="coupon-value" className="text-xs font-medium text-neutral-700">Discount value</label>
          <input id="coupon-value" type="number" min="0" value={form.discountValue} onChange={set("discountValue")} className={`${inputClass} mt-1 tabular-nums`} />
        </div>
        <div>
          <label htmlFor="coupon-min" className="text-xs font-medium text-neutral-700">Min order amount</label>
          <input id="coupon-min" type="number" min="0" value={form.minAmount} onChange={set("minAmount")} className={`${inputClass} mt-1 tabular-nums`} />
        </div>
        <div>
          <label htmlFor="coupon-stock" className="text-xs font-medium text-neutral-700">Redemptions</label>
          <input id="coupon-stock" type="number" min="0" value={form.stock} onChange={set("stock")} className={`${inputClass} mt-1 tabular-nums`} />
        </div>
        <div>
          <label htmlFor="coupon-expiry" className="text-xs font-medium text-neutral-700">Expires at</label>
          <input id="coupon-expiry" type="date" value={form.expiresAt} onChange={set("expiresAt")} className={`${inputClass} mt-1`} />
        </div>
        {form.discountType === "PERCENT" && (
          <div>
            <label htmlFor="coupon-max" className="text-xs font-medium text-neutral-700">Max discount cap (optional)</label>
            <input id="coupon-max" type="number" min="0" value={form.maxDiscount} onChange={set("maxDiscount")} className={`${inputClass} mt-1 tabular-nums`} />
          </div>
        )}
        {formError && (
          <p role="alert" className="border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700 sm:col-span-2">
            {formError}
          </p>
        )}
        <div className="sm:col-span-2">
          <button type="submit" disabled={formBusy} className={primaryButtonClass}>
            {formBusy ? "Creating…" : "Create coupon"}
          </button>
        </div>
      </form>

      <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Sale opt-in
      </h2>
      {products.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-600">Add products to opt them into sale events.</p>
      ) : (
        <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
          {products.map((product) => (
            <li key={product._id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="min-w-0 truncate font-medium">{product.title}</span>
              <button
                type="button"
                disabled={Boolean(saleBusy[product._id])}
                aria-pressed={Boolean(product.onSale)}
                onClick={() => handleSale(product)}
                className={`inline-flex min-h-11 shrink-0 items-center border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60 ${
                  product.onSale
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
                }`}
              >
                {saleBusy[product._id] ? "Saving…" : product.onSale ? "In sale" : "Opt in"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
