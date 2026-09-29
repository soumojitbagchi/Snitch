import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  fetchSellerOrder,
  fetchSellerOrders,
  updateSellerOrderStatus,
} from "../services/seller.api";
import {
  EmptyState,
  ErrorBlock,
  LoadingBlock,
  PageHeader,
  StatusPill,
  primaryButtonClass,
  secondaryButtonClass,
} from "./seller.ui";

const money = (value, currency = "INR") =>
  `${currency} ${(Number(value) || 0).toFixed(2)}`;

const STATUS_FILTERS = ["", "pending", "processing", "shipped", "delivered", "cancelled"];

const NEXT_ACTIONS = {
  pending: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

const slaLabel = (fulfillment) => {
  if (!fulfillment?.slaDueAt) return "No SLA set";
  const ms = new Date(fulfillment.slaDueAt).getTime() - Date.now();
  if (ms < 0) return "SLA breached";
  const hours = Math.floor(ms / 3600000);
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
};

export default function SellerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    (nextPage, nextStatus) =>
      fetchSellerOrders(nextPage, 20, nextStatus)
        .then((response) => {
          setOrders(Array.isArray(response?.data) ? response.data : []);
          setPage(response?.page ?? nextPage);
          setPages(response?.pages ?? 1);
          setTotal(response?.total ?? 0);
          setLoading(false);
        })
        .catch((requestError) => {
          setError(requestError?.response?.data?.message || "Could not load orders.");
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

  return (
    <section aria-label="Orders" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Seller studio"
        title="Orders"
        description={total > 0 ? `${total} order(s) with your products.` : "Orders with your products appear here."}
      />

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Order status filter">
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
          <LoadingBlock label="Loading orders…" />
        ) : error ? (
          <ErrorBlock error={error} onRetry={retry} />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="When buyers check out with your products, orders land here."
          />
        ) : (
          <>
            <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
              {orders.map((order) => (
                <li key={order._id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/seller/orders/${order._id}`)}
                    className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 text-left transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black md:grid-cols-[minmax(0,1fr)_160px_140px_130px] md:gap-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        #{order.orderId} · {order.buyer?.fullname || "Buyer"}
                      </span>
                      <span className="mt-1 block text-xs text-neutral-500">
                        {order.total} unit(s) · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </span>
                    <span className="hidden text-sm tabular-nums md:block">
                      {money(order.total, order.currency)}
                    </span>
                    <span className="hidden md:block">
                      <StatusPill status={order.fulfillment?.status || "pending"} />
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.14em] underline underline-offset-4">
                      View
                    </span>
                  </button>
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
    </section>
  );
}

export function SellerOrderDetail({ setNotice }) {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const dialog = useRef(null);

  const load = useCallback(() => {
    fetchSellerOrder(paymentId)
      .then((response) => {
        setOrder(response?.data ?? null);
        setLoading(false);
      })
      .catch((requestError) => {
        setError(requestError?.response?.data?.message || "Could not load this order.");
        setLoading(false);
      });
  }, [paymentId]);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setLoading(true);
    setError("");
    load();
  };

  const changeStatus = async (nextStatus) => {
    if (busy) return;
    setBusy(true);
    try {
      await updateSellerOrderStatus(paymentId, nextStatus, reason);
      if (setNotice) setNotice(`Order marked ${nextStatus}.`);
      setReason("");
      await load();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Status update failed.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <section aria-label="Order detail" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
        <LoadingBlock label="Loading order…" />
      </section>
    );
  }

  if (error || !order) {
    return (
      <section aria-label="Order detail" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
        <ErrorBlock error={error || "Order not found."} onRetry={retry} />
      </section>
    );
  }

  const fulfillmentStatus = order.fulfillment?.status || "pending";
  const actions = NEXT_ACTIONS[fulfillmentStatus] ?? [];

  return (
    <section aria-label="Order detail" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12">
      <button
        type="button"
        onClick={() => navigate("/seller/orders")}
        className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        Back to orders
      </button>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Order #{order.orderId}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {money(order.total, order.currency)} · {order.total} unit(s)
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Placed {new Date(order.createdAt).toLocaleString("en-IN")} · SLA: {slaLabel(order.fulfillment)}
          </p>
        </div>
        <StatusPill status={fulfillmentStatus} />
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
            Your lines in this order
          </h2>
          <ul className="mt-4 divide-y divide-neutral-100 border-y border-neutral-200">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.variantId}`} className="flex items-center gap-4 py-4">
                <span className="h-20 w-16 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                  {item.image ? (
                    <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover object-top" />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{item.title}</span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {[item.size && `Size: ${item.size}`, item.color && `Color: ${item.color}`, `Qty: ${item.quantity}`].filter(Boolean).join(" · ")}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500">
                    {money(item.unitPrice, item.currency)} each
                  </span>
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {money(item.lineTotal, item.currency)}
                </span>
              </li>
            ))}
          </ul>

          {actions.length > 0 && (
            <div className="mt-8 border border-neutral-200 p-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Update fulfillment
              </h2>
              <div className="mt-4 flex flex-wrap gap-3">
                {actions.map((next) => (
                  <button
                    key={next}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (next === "cancelled") dialog.current?.showModal();
                      else changeStatus(next);
                    }}
                    className={next === "cancelled" ? secondaryButtonClass : primaryButtonClass}
                  >
                    {busy ? "Saving…" : `Mark ${next}`}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-xs font-medium text-neutral-600" htmlFor="cancel-reason">
                Cancel reason (only used when cancelling)
              </label>
              <input
                id="cancel-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="e.g. buyer requested cancellation"
                className="mt-1 h-11 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-black"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="border border-neutral-200 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Buyer
            </h2>
            <p className="mt-3 text-sm font-semibold">{order.buyer?.fullname || "Buyer"}</p>
            <p className="mt-1 text-sm text-neutral-600">{order.buyer?.email || "—"}</p>
            <p className="mt-1 text-sm tabular-nums text-neutral-600">{order.buyer?.contact || "No phone on file"}</p>
            {order.buyer?.addresses?.[0] && (
              <address className="mt-3 border-t border-neutral-200 pt-3 text-sm not-italic leading-6 text-neutral-700">
                {order.buyer.addresses[0].recipientName && <span className="block font-medium">{order.buyer.addresses[0].recipientName}</span>}
                <span className="block">{order.buyer.addresses[0].line1}</span>
                {order.buyer.addresses[0].line2 && <span className="block">{order.buyer.addresses[0].line2}</span>}
                <span className="block">
                  {order.buyer.addresses[0].city}, {order.buyer.addresses[0].state} {order.buyer.addresses[0].postalCode}
                </span>
              </address>
            )}
          </div>

          <div className="border border-neutral-200 p-5">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Payment
            </h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600">Method</dt>
                <dd className="font-medium">{order.paymentId ? "Prepaid" : "COD"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-600">Status</dt>
                <dd className="font-medium">{order.paymentStatus}</dd>
              </div>
              {order.couponCode && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-600">Coupon</dt>
                  <dd className="font-medium">{order.couponCode}</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              onClick={() => window.print()}
              className={`${secondaryButtonClass} mt-4 w-full`}
            >
              Print packing slip
            </button>
          </div>
        </div>
      </div>

      <dialog
        ref={dialog}
        aria-labelledby="cancel-order-title"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-sm border border-neutral-300 bg-white p-6 backdrop:bg-black/45"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-700">
          Restores stock
        </p>
        <h2 id="cancel-order-title" className="mt-2 text-xl font-semibold">
          Cancel this order?
        </h2>
        <p className="mt-3 text-sm leading-6 text-neutral-700">
          Your lines return to inventory. This cannot be undone.
        </p>
        <div className="mt-7 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="min-h-11 border border-neutral-300 px-4 text-sm font-medium transition-colors hover:border-black hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Keep order
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              dialog.current?.close();
              changeStatus("cancelled");
            }}
            className="min-h-11 bg-red-700 px-4 text-sm font-medium text-white transition-colors hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "Cancelling…" : "Yes, cancel"}
          </button>
        </div>
      </dialog>
    </section>
  );
}
