import { useCallback, useEffect, useState } from "react";
import { fetchSellerSettlements, fetchSellerStats } from "../services/seller.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatCard,
  StatusPill,
} from "./seller.ui";

const inr = (value) => `INR ${(Number(value) || 0).toFixed(2)}`;

function RevenueChart({ series }) {
  const max = Math.max(1, ...series.map((point) => point.revenue));
  return (
    <div
      role="img"
      aria-label={`Revenue over the last ${series.length} days, peaking at ${inr(max)}`}
      className="flex h-40 items-end gap-1 border border-neutral-200 bg-white p-4"
    >
      {series.map((point) => (
        <div
          key={point.date}
          title={`${point.date}: ${inr(point.revenue)} · ${point.orders} order(s)`}
          className="min-w-0 flex-1 bg-black"
          style={{ height: `${Math.max(3, Math.round((point.revenue / max) * 100))}%` }}
        />
      ))}
    </div>
  );
}

export default function SellerEarnings() {
  const [stats, setStats] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    (nextDays) =>
      Promise.all([fetchSellerStats(nextDays), fetchSellerSettlements()])
        .then(([statsResponse, settlementsResponse]) => {
          setStats(statsResponse?.data ?? null);
          setSettlements(Array.isArray(settlementsResponse?.data) ? settlementsResponse.data : []);
          setLoading(false);
        })
        .catch((requestError) => {
          setError(requestError?.response?.data?.message || "Could not load earnings.");
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    load(days);
  }, [days, load]);

  const pickDays = (option) => {
    if (option === days) return;
    setLoading(true);
    setError("");
    setDays(option);
  };

  const retry = () => {
    setLoading(true);
    setError("");
    load(days);
  };

  return (
    <section aria-label="Earnings" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Earnings"
        description="Gross, discounts, platform fee (5%) and TCS (1%) derived from verified payments."
        action={
          <div className="flex gap-2" role="group" aria-label="Date range">
            {[7, 30, 90].map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={days === option}
                onClick={() => pickDays(option)}
                className={`inline-flex min-h-11 items-center border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                  days === option
                    ? "border-black bg-black text-white"
                    : "border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
                }`}
              >
                {option}d
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-8">
        {loading ? (
          <LoadingBlock label="Loading earnings…" />
        ) : error ? (
          <ErrorBlock error={error} onRetry={retry} />
        ) : !stats || stats.orders === 0 ? (
          <EmptyState
            title="No earnings yet"
            description="Completed payments with your products will show up here."
          />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Gross" value={inr(stats.gross)} sub={`${stats.units} units · ${stats.orders} orders`} />
              <StatCard label="Discounts" value={inr(stats.discounts)} sub="Coupon share on your lines" />
              <StatCard label="Net payable" value={inr(stats.payable)} sub={`Fees ${inr(stats.fees)} · TCS ${inr(stats.tcs)}`} />
              <StatCard label="Checkout conversion" value={`${stats.conversion}%`} sub="Completed vs all checkouts" />
            </div>

            <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Daily revenue
            </h2>
            <div className="mt-3">
              <RevenueChart series={stats.dailySeries} />
            </div>

            <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Top products
            </h2>
            <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
              {stats.topProducts.map((row) => (
                <li key={row.productId} className="flex items-center justify-between gap-4 py-3 text-sm">
                  <span className="min-w-0 truncate font-medium">{row.title}</span>
                  <span className="shrink-0 tabular-nums text-neutral-600">
                    {row.units} units · {inr(row.revenue)}
                  </span>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Settlements
            </h2>
            {settlements.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-600">No settlements yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto border border-neutral-200">
                <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-neutral-900 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600">
                      <th scope="col" className="px-4 py-3">Week</th>
                      <th scope="col" className="px-4 py-3">Orders</th>
                      <th scope="col" className="px-4 py-3">Gross</th>
                      <th scope="col" className="px-4 py-3">Fees + TCS</th>
                      <th scope="col" className="px-4 py-3">Payable</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {settlements.map((row) => (
                      <tr key={row.id}>
                        <td className="px-4 py-3 font-medium">{row.id}</td>
                        <td className="px-4 py-3 tabular-nums">{row.orders}</td>
                        <td className="px-4 py-3 tabular-nums">{inr(row.gross)}</td>
                        <td className="px-4 py-3 tabular-nums">{inr(row.fees + row.tcs)}</td>
                        <td className="px-4 py-3 font-semibold tabular-nums">{inr(row.payable)}</td>
                        <td className="px-4 py-3">
                          <StatusPill status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
