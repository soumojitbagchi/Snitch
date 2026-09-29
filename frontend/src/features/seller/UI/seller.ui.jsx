import { Link } from "react-router-dom";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub }) {
  return (
    <div className="border border-neutral-200 bg-white px-5 py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
      {sub && <p className="mt-1 text-xs text-neutral-500">{sub}</p>}
    </div>
  );
}

export function EmptyState({ title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="border border-dashed border-neutral-300 px-6 py-14 text-center">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      {description && (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-600">{description}</p>
      )}
      {(actionLabel && actionTo) || onAction ? (
        <div className="mt-6">
          {actionTo ? (
            <Link
              to={actionTo}
              className="inline-flex min-h-11 items-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="inline-flex min-h-11 items-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {actionLabel}
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function LoadingBlock({ label = "Loading…" }) {
  return (
    <p role="status" className="py-10 text-sm text-neutral-600">
      {label}
    </p>
  );
}

export function ErrorBlock({ error, onRetry }) {
  return (
    <div className="py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        Something went wrong
      </p>
      <p role="alert" className="mt-3 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
        {error}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Try again
        </button>
      )}
    </div>
  );
}

const pillTones = {
  completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  refunded: "border-emerald-200 bg-emerald-50 text-emerald-800",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-800",
  processing: "border-amber-200 bg-amber-50 text-amber-800",
  shipped: "border-amber-200 bg-amber-50 text-amber-800",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  requested: "border-amber-200 bg-amber-50 text-amber-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  cancelled: "border-red-200 bg-red-50 text-red-800",
  failed: "border-red-200 bg-red-50 text-red-800",
  out: "border-red-200 bg-red-50 text-red-800",
  low: "border-amber-200 bg-amber-50 text-amber-800",
};

export function StatusPill({ status }) {
  const tone = pillTones[String(status || "").toLowerCase()] || "border-neutral-300 bg-white text-neutral-800";
  return (
    <span className={`inline-block border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${tone}`}>
      {status || "—"}
    </span>
  );
}

export const primaryButtonClass =
  "inline-flex min-h-11 items-center justify-center bg-black px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex min-h-11 items-center justify-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60";

export const inputClass =
  "h-11 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-black";
