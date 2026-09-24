import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  addWishlistItem,
  removeWishlistItem,
  selectIsWishlisted,
} from "../../redux/wishlist.slice";

export default function WishlistToggleButton({ product, className = "" }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const isWishlisted = useSelector((state) => selectIsWishlisted(state, product?._id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState("");

  const handleToggle = async () => {
    if (busy || !product?._id) return;
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      if (isWishlisted) {
        await dispatch(removeWishlistItem(product._id)).unwrap();
        setNotice(`${product.title} removed from wishlist.`);
      } else {
        await dispatch(addWishlistItem(product)).unwrap();
        setNotice(`${product.title} saved to wishlist.`);
      }
    } catch (requestError) {
      if (requestError?.status === 401) {
        setError("Sign in to save wishlist items.");
      } else {
        setError(requestError?.message || "Wishlist could not be updated.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`flex flex-col items-end gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={busy}
        aria-label={isWishlisted ? `Remove ${product?.title} from wishlist` : `Add ${product?.title} to wishlist`}
        aria-pressed={isWishlisted}
        aria-busy={busy}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-800 shadow-sm transition-colors hover:border-black hover:text-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill={isWishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={isWishlisted ? "text-red-600" : ""}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      <span className="sr-only" role="status" aria-live="polite">{notice}</span>
      {error && (
        <span role="alert" className="max-w-48 border border-neutral-200 bg-white px-2 py-1 text-right text-[11px] leading-4 text-neutral-700 shadow-sm">
          {error} {error.startsWith("Sign in") && <Link to="/signin" state={{ from: location.pathname }} className="font-semibold underline underline-offset-2">Sign in</Link>}
        </span>
      )}
    </div>
  );
}
