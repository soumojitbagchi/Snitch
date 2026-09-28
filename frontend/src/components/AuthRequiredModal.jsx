import { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";

export default function AuthRequiredModal({ open, onClose, title = "Sign in to continue" }) {
  const location = useLocation();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-required-title"
        onClick={(event) => event.stopPropagation()}
        className="relative w-full max-w-sm border border-neutral-200 bg-white px-6 py-7 text-neutral-900 shadow-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close sign in prompt"
          className="absolute right-3 top-3 inline-flex min-h-11 min-w-11 items-center justify-center text-xl leading-none text-neutral-500 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          <span aria-hidden="true">×</span>
        </button>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Account needed
        </p>
        <h2 id="auth-required-title" className="mt-2 text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-neutral-600">
          Browse freely, but saving items and checking out need an account. It takes a minute.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/signin"
            state={{ from: location.pathname }}
            className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            state={{ from: location.pathname }}
            className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
