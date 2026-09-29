import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAttentionFeed, fetchSellerStats } from "../services/seller.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
} from "./seller.ui";

const inr = (value) => `INR ${(Number(value) || 0).toFixed(2)}`;

const severityTone = {
  info: "border-neutral-300",
  warn: "border-amber-400",
  urgent: "border-red-500",
};

function MiniChart({ series }) {
  const max = Math.max(1, ...series.map((point) => point.revenue));
  return (
    <div
      role="img"
      aria-label={`Revenue over the last ${series.length} days`}
      className="flex h-32 items-end gap-1 border border-neutral-200 bg-white p-4"
    >
      {series.map((point) => (
        <div
          key={point.date}
          title={`${point.date}: ${inr(point.revenue)}`}
          className="min-w-0 flex-1 bg-black"
          style={{ height: `${Math.max(3, Math.round((point.revenue / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

export default function SellerOverview() {
  const [stats, setStats] = useState(null);
  const [attention, setAttention] = useState({ feed: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchSellerStats(30), fetchAttentionFeed()])
      .then(([statsResponse, attentionResponse]) => {
        if (cancelled) return;
        setStats(statsResponse?.data ?? null);
        setAttention(attentionResponse?.data ?? { feed: [], counts: {} });
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError?.response?.data?.message || "Could not load overview.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <section aria-label="Overview" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
        <PageHeader eyebrow="Seller studio" title="Overview" />
        <div className="mt-8">
          <LoadingBlock label="Loading overview…" />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Overview" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Overview"
        description="Today at a glance, what needs attention, and how the last 30 days performed."
        action={
          <Link
            to="/seller/products"
            className="inline-flex min-h-11 items-center bg-black px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Manage products
          </Link>
        }
      />

      <div className="mt-8">
        {error ? (
          <ErrorBlock error={error} onRetry={() => window.location.reload()} />
        ) : !stats || stats.orders === 0 ? (
          <EmptyState
            title="No sales yet"
            description="Publish products and share your store. Orders, earnings and alerts will land here."
            actionLabel="Add product"
            actionTo="/seller/new"
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Revenue (30d)" value={inr(stats.gross)} sub={`${stats.orders} orders`} />
              <StatCard label="Units sold" value={stats.units} sub={`Conversion ${stats.conversion}%`} />
              <StatCard label="Net payable" value={inr(stats.payable)} sub="After fees + TCS" />
              <StatCard
                label="Low / out of stock"
                value={`${attention.counts.lowStock ?? 0} / ${attention.counts.outOfStock ?? 0}`}
                sub="Variants need restock"
              />
            </div>

            <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Needs attention
            </h2>
            {attention.feed.length === 0 ? (
              <p className="mt-3 border border-neutral-200 bg-white px-5 py-4 text-sm text-neutral-600">
                All clear. Nothing needs your attention right now.
              </p>
            ) : (
              <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
                {attention.feed.map((item, index) => (
                  <li key={`${item.type}-${index}`} className={`border-l-4 bg-white px-5 py-3 text-sm font-medium ${severityTone[item.severity] || severityTone.info}`}>
                    {item.label}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10 flex items-baseline justify-between gap-4">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                30-day revenue
              </h2>
              <Link
                to="/seller/earnings"
                className="text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4 hover:text-neutral-600"
              >
                Full earnings
              </Link>
            </div>
            <div className="mt-3">
              <MiniChart series={stats.dailySeries} />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
