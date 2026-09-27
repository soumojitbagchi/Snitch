import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchAllProducts } from "../services/product.api";
import { getProductTotalStock } from "../utils/catalogFilters";

function isInStock(product) {
  return getProductTotalStock(product) > 0;
}

function readSavedEmail(storageKey) {
  try {
    return localStorage.getItem(storageKey) || "";
  } catch {
    // storage unavailable (private mode) — form still works for this session
    return "";
  }
}

export function NotifyMeForm({ productId, variantId }) {
  const storageKey = `snitch:notify:${productId}:${variantId || "any"}`;
  const [email, setEmail] = useState(() => readSavedEmail(storageKey));
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState(() => readSavedEmail(storageKey) !== "");
  const [error, setError] = useState("");

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = (event) => {
    event.preventDefault();
    setTouched(true);
    if (!emailValid) {
      setError("Enter a valid email address so we can alert you.");
      return;
    }
    setError("");
    try {
      localStorage.setItem(storageKey, email.trim());
    } catch {
      // ignore storage failures
    }
    setDone(true);
  };

  if (done) {
    return (
      <div role="status" className="border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">
          You are on the list
        </p>
        <p className="mt-1.5 text-sm leading-6 text-emerald-900">
          We will email <strong>{email}</strong> as soon as this is back in stock.
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              localStorage.removeItem(storageKey);
            } catch {
              // ignore
            }
            setDone(false);
            setEmail("");
            setTouched(false);
          }}
          className="mt-2 inline-flex min-h-11 items-center px-1 text-xs font-medium underline underline-offset-4 text-emerald-800 hover:text-emerald-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900">
        Notify me when available
      </p>
      <p className="mt-1.5 text-sm leading-6 text-neutral-600">
        Leave your email and we will alert you the moment it is restocked.
      </p>
      <label htmlFor={`notify-email-${productId}`} className="mt-3 block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
        Email address
      </label>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <input
          id={`notify-email-${productId}`}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touched) setError("");
          }}
          onBlur={() => {
            setTouched(true);
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
              setError("Enter a valid email address so we can alert you.");
            }
          }}
          placeholder="you@example.com"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `notify-error-${productId}` : undefined}
          className="h-11 min-h-11 flex-1 border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-black"
        />
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Notify me
        </button>
      </div>
      {error && (
        <p id={`notify-error-${productId}`} role="alert" className="mt-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

export default function OutOfStockRecovery({
  product,
  activeVariant,
  onSelectVariant,
  variants = [],
}) {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);

  const otherInStockVariants = useMemo(() => {
    return variants
      .map((v, idx) => {
        const stock =
          typeof v?.stock === "number" ? v.stock : (v?.stock?.basePrice ?? 0);
        let size = "";
        if (v?.attributes) {
          size = v.attributes instanceof Map ? v.attributes.get("size") || "" : v.attributes.size || "";
        }
        return { idx, size, stock };
      })
      .filter((v) => v.stock > 0);
  }, [variants]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetchAllProducts();
        const items = Array.isArray(response?.data) ? response.data : [];
        const inStock = items.filter(
          (item) => item._id !== product?._id && isInStock(item)
        );
        const sameCategory = inStock.filter(
          (item) =>
            product?.category &&
            item.category &&
            item.category.toLowerCase() === String(product.category).toLowerCase()
        );
        const picked = (sameCategory.length > 0 ? sameCategory : inStock).slice(0, 4);
        if (!cancelled) setAlternatives(picked);
      } catch {
        if (!cancelled) setAlternatives([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    if (product?._id) load();
    return () => {
      cancelled = true;
    };
  }, [product?._id, product?.category]);

  return (
    <section aria-label="Out of stock options" className="space-y-4 py-5">
      {otherInStockVariants.length > 0 && onSelectVariant && (
        <div className="border border-amber-200 bg-amber-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-900">
            This size is out — others are available
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {otherInStockVariants.map(({ idx, size }) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectVariant(idx)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center border border-amber-900 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-amber-950 transition-colors hover:bg-amber-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                {size || `Option ${idx + 1}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <NotifyMeForm
        productId={product?._id || "unknown"}
        variantId={activeVariant?._id}
      />

      <div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
            In-stock alternatives
          </h2>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center px-1 text-xs font-medium underline underline-offset-4 text-neutral-600 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Browse all
          </Link>
        </div>
        {loading ? (
          <div role="status" aria-label="Loading alternatives" className="mt-3 grid grid-cols-2 gap-3">
            {[0, 1, 3, 4].map((i) => (
              <div key={i} aria-hidden="true">
                <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
                <div className="mt-2 h-3 w-3/4 animate-pulse bg-neutral-100" />
              </div>
            ))}
          </div>
        ) : alternatives.length > 0 ? (
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-6">
            {alternatives.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        ) : (
          <p className="mt-3 border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-600">
            No close alternatives right now — the notify list is the fastest way back.
          </p>
        )}
      </div>
    </section>
  );
}
