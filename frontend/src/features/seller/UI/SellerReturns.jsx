import { useCallback, useEffect, useState } from "react";
import { decideSellerReturn, fetchSellerReturns } from "../services/seller.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusPill,
  primaryButtonClass,
  secondaryButtonClass,
} from "./seller.ui";

const STATUS_FILTERS = ["", "requested", "approved", "rejected", "refunded"];

export default function SellerReturns({ setNotice }) {
  const [returns, setReturns] = useState([]);
  const [topReturned, setTopReturned] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState({});

  const load = useCallback(
    (nextPage, nextStatus) =>
      fetchSellerReturns(nextPage, 20, nextStatus)
        .then((response) => {
          setReturns(Array.isArray(response?.data) ? response.data : []);
          setTopReturned(Array.isArray(response?.topReturned) ? response.topReturned : []);
          setPage(response?.page ?? nextPage);
          setPages(response?.pages ?? 1);
          setTotal(response?.total ?? 0);
          setLoading(false);
        })
        .catch((requestError) => {
          setError(requestError?.response?.data?.message || "Could not load returns.");
          setLoading(false);
        }),
    [],
  );

  useEffect(() => {
    load(page, status);
  }, [page, status, load]);

  const pickStatus = (option) => {
    if (option === status && page === 1) return;
    setLoading(true);
    setError("");
    setPage(1);
    setStatus(option);
  };

  const goToPage = (nextPage) => {
    setLoading(true);
    setError("");
    setPage(nextPage);
  };

  const retry = () => {
    setLoading(true);
    setError("");
    load(page, status);
  };

  const decide = async (returnId, nextStatus) => {
    setBusyIds((prev) => ({ ...prev, [returnId]: true }));
    try {
      await decideSellerReturn(returnId, nextStatus);
      if (setNotice) setNotice(`Return ${nextStatus}.`);
      await load(page, status);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Decision failed. Try again.");
    } finally {
      setBusyIds((prev) => {
        const copy = { ...prev };
        delete copy[returnId];
        return copy;
      });
    }
  };

  return (
    <section aria-label="Returns" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Returns"
        description={total > 0 ? `${total} request(s) on your products.` : "Return requests on your products appear here."}
      />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Return status filter">
        {STATUS_FILTERS.map((option) => (
          <button
            key={option || "all"}
            type="button"
            aria-pressed={status === option}
            onClick={() => pickStatus(option)}
            className={`inline-flex min-h-11 items-center border px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
              status === option
                ? "border-black bg-black text-white"
                : "border-neutral-300 text-neutral-700 hover:border-black hover:text-black"
            }`}
          >
            {option || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingBlock label="Loading returns…" />
        ) : error ? (
          <ErrorBlock error={error} onRetry={retry} />
        ) : returns.length === 0 ? (
          <EmptyState
            title="No return requests"
            description="When buyers request returns on your products, you approve or reject them here."
          />
        ) : (
          <>
            <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
              {returns.map((item) => (
                <li key={item._id} className="grid gap-4 py-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {item.productId?.title || "Product"} · Qty {item.quantity}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      Order {item.payment?.orderId || "—"} · {item.payment?.amount != null ? `${item.payment.currency || "INR"} ${Number(item.payment.amount).toFixed(2)}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      By {item.requestedBy?.fullname || item.requestedBy?.email || "buyer"} ·{" "}
                      {new Date(item.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="mt-2 border-l-2 border-neutral-300 pl-3 text-sm leading-6 text-neutral-700">
                      “{item.reason}”
                    </p>
                    <p className="mt-2">
                      <StatusPill status={item.status} />
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status === "requested" && (
                      <>
                        <button
                          type="button"
                          disabled={Boolean(busyIds[item._id])}
                          onClick={() => decide(item._id, "approved")}
                          className={primaryButtonClass}
                        >
                          {busyIds[item._id] ? "Saving…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyIds[item._id])}
                          onClick={() => decide(item._id, "rejected")}
                          className={secondaryButtonClass}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {item.status === "approved" && (
                      <button
                        type="button"
                        disabled={Boolean(busyIds[item._id])}
                        onClick={() => decide(item._id, "refunded")}
                        className={primaryButtonClass}
                      >
                        {busyIds[item._id] ? "Saving…" : "Mark refunded"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" role="status">
                Page {page} of {Math.max(pages, 1)}
              </p>
              <div className="flex gap-3">
                <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className={secondaryButtonClass}>
                  Previous
                </button>
                <button type="button" disabled={page >= pages} onClick={() => goToPage(page + 1)} className={secondaryButtonClass}>
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {topReturned.length > 0 && (
        <div className="mt-12">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Most returned variants
          </h2>
          <ul className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
            {topReturned.map((row, index) => (
              <li key={`${row._id?.product}-${row._id?.variant}-${index}`} className="flex items-center justify-between gap-4 py-3 text-sm">
                <span className="min-w-0 truncate font-medium">
                  {row.prod?.title || "Product"}
                </span>
                <span className="shrink-0 tabular-nums text-neutral-600">
                  {row.count} return(s)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
