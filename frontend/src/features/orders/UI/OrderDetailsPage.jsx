import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import { cancelOrder, selectOrders } from "../../redux/order.slice";
import { formatPrice } from "../../product/utils/product";
import { fetchAllProducts } from "../../product/services/product.api";
import { fetchMyOrder, normalizeServerOrder } from "../services/order.api";
import { rankSimilar } from "../../product/utils/similarity";
import ProductCard from "../../product/UI/ProductCard";
import OrderStatusPill from "./OrderStatusPill";

const isObjectId = (value) => /^[a-f0-9]{24}$/i.test(String(value || ""));

const STEPS = ["Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

const stepIndexFor = (status) => {
  switch (status) {
    case "Delivered":
    case "Completed":
      return STEPS.length;
    case "Out for Delivery":
      return 3;
    case "Shipped":
    case "Processing":
      return 2;
    case "Packed":
      return 1;
    case "Failed":
    case "Cancelled":
      return -1;
    default:
      return 0;
  }
};

function OrderError() {
  return (
    <section className="mx-auto w-full max-w-[760px] px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        Order not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        This order is no longer available.
      </h1>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          to="/orders"
          className="inline-flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Back to orders
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center border border-neutral-300 px-4 text-sm font-medium transition-colors hover:border-black hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Back to products
        </Link>
      </div>
    </section>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const userId = useSelector((state) => state.auth.user?.id);
  const orders = useSelector(selectOrders);
  const [serverState, setServerState] = useState({ key: null, order: null });
  const serverKey = `${userId ?? "guest"}:${id}`;
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    if (!userId || !isObjectId(id)) return () => controller.abort();
    fetchMyOrder(id, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return;
        if (response?.success === false || !response?.data) {
          setServerState({ key: serverKey, order: null });
          return;
        }
        setServerState({ key: serverKey, order: normalizeServerOrder(response.data) });
      })
      .catch(() => {
        if (!controller.signal.aborted) setServerState({ key: serverKey, order: null });
      });
    return () => controller.abort();
  }, [userId, id, serverKey]);

  const localOrder = orders.find((item) => String(item.id) === String(id));
  const serverReady = serverState.key === serverKey;
  const serverLoading = Boolean(userId && isObjectId(id) && !serverReady);
  const order = serverReady ? serverState.order : localOrder;

  useEffect(() => {
    if (!confirming) return undefined;
    const timer = setTimeout(() => setConfirming(false), 5000);
    return () => clearTimeout(timer);
  }, [confirming]);

  const firstItemId = order?.items?.[0]
    ? `${order.items[0].title || ""}|${order.items[0].size || ""}|${order.items[0].color || ""}`
    : null;

  useEffect(() => {
    if (!order) return undefined;
    const controller = new AbortController();
    fetchAllProducts()
      .then((response) => {
        if (controller.signal.aborted) return;
        const list = Array.isArray(response?.data) ? response.data : [];
        setSimilar(rankSimilar(order.items?.[0] || null, list, 4));
      })
      .catch(() => {
        if (!controller.signal.aborted) setSimilar([]);
      });
    return () => controller.abort();
  }, [order, firstItemId]);

  if (serverLoading) {
    return (
      <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
        <Navbar />
        <main className="flex-1">
          <p role="status" className="mx-auto w-full max-w-[760px] px-5 py-16 text-sm text-neutral-600 sm:px-8">
            Loading order…
          </p>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
        <Navbar />
        <main className="flex-1">
          <OrderError />
        </main>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const terminal = ["Delivered", "Completed", "Failed", "Cancelled"];
  const cancellable = order && order.source !== "server" && !terminal.includes(order.status);

  const requestCancel = () => {
    if (!cancellable || cancelling) return;
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setCancelling(true);
    setTimeout(() => {
      dispatch(cancelOrder(order.id));
      setCancelling(false);
      setConfirming(false);
    }, 600);
  };
  const currency = items[0]?.currency || "INR";
  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0,
  );
  const stepIndex = stepIndexFor(order.status);
  const failed = stepIndex === -1;

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 sm:px-6 lg:px-8">
          <Link
            to="/orders"
            className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Back to orders
          </Link>
        </div>

        <section aria-labelledby="order-heading" className="mx-auto w-full max-w-[1240px] px-4 pb-12 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Order #{order.id} · {order.date}
              </p>
              <h1 id="order-heading" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                {order.itemCount || items.length} {order.itemCount === 1 ? "item" : "items"} ·{" "}
                {formatPrice({ basePrice: order.totalAmount, currency })}
              </h1>
            </div>
            <div className="flex flex-col items-end gap-3">
              <OrderStatusPill status={order.status} />
              {cancellable && (
                <button
                  type="button"
                  onClick={requestCancel}
                  disabled={cancelling}
                  aria-busy={cancelling}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 border px-5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-70 ${
                    confirming
                      ? "border-red-700 bg-red-700 text-white hover:bg-red-800"
                      : "border-red-300 text-red-700 hover:border-red-700"
                  }`}
                >
                  {cancelling && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      aria-hidden="true"
                      className="animate-spin"
                    >
                      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
                    </svg>
                  )}
                  {cancelling ? "Cancelling…" : confirming ? "Confirm cancel" : "Cancel order"}
                </button>
              )}
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-3 gap-px border border-neutral-200 bg-neutral-200">
            <div className="bg-white px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Total paid
              </dt>
              <dd className="mt-1 text-sm font-bold tabular-nums">
                {formatPrice({ basePrice: order.totalAmount, currency })}
              </dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Items
              </dt>
              <dd className="mt-1 text-sm font-bold tabular-nums">
                {order.itemCount || items.length}
              </dd>
            </div>
            <div className="bg-white px-4 py-3">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                Placed
              </dt>
              <dd className="mt-1 text-sm font-bold">{order.date}</dd>
            </div>
          </dl>

          <div className="mt-6 bg-black px-5 py-4 text-white">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Arriving
            </p>
            <p className="mt-1 text-base font-semibold">
              {order.deliveryEstimate || "Delivery expected soon"}
            </p>
          </div>

          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
            <div>
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Items in this order
              </h2>
              <ul className="mt-4 divide-y divide-neutral-100 border-y border-neutral-200">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-4 py-4">
                    <div className="h-20 w-16 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase text-neutral-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-500">
                        {item.size && `Size: ${item.size}`}
                        {item.color && ` · Color: ${item.color}`}
                        {` · Qty: ${item.quantity || 1}`}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-neutral-900">
                      {formatPrice({
                        basePrice: (Number(item.price) || 0) * (Number(item.quantity) || 1),
                        currency: item.currency || currency,
                      })}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-600">Subtotal</dt>
                  <dd className="font-medium tabular-nums">
                    {formatPrice({ basePrice: subtotal, currency })}
                  </dd>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-neutral-600">
                      Coupon{order.couponCode ? ` (${order.couponCode})` : ""}
                    </dt>
                    <dd className="font-medium tabular-nums text-emerald-700">
                      −{formatPrice({ basePrice: order.discount, currency })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-t border-neutral-200 pt-3">
                  <dt className="font-semibold">Total paid</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatPrice({ basePrice: order.totalAmount, currency })}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="space-y-6">
              <section aria-label="Delivery status" className="border border-neutral-200 p-5">
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Delivery status
                </h2>
                {failed ? (
                  <p role="alert" className="mt-3 text-sm leading-6 text-red-700">
                    This order was {order.status}. Contact support if money was deducted.
                  </p>
                ) : (
                  <ol className="mt-4">
                    {STEPS.map((step, idx) => {
                      const done = idx < stepIndex;
                      const current = idx === stepIndex;
                      const isLast = idx === STEPS.length - 1;
                      return (
                        <li key={step} className="relative flex gap-3 pb-6 last:pb-0">
                          {!isLast && (
                            <span
                              aria-hidden="true"
                              className={`absolute left-[9px] top-5 h-[calc(100%-1.25rem)] w-0.5 ${
                                idx < stepIndex
                                  ? "bg-black"
                                  : idx === stepIndex
                                    ? "order-flow-line bg-black"
                                    : "bg-neutral-200"
                              }`}
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className={`z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                              done
                                ? "border-black bg-black text-white"
                                : current
                                  ? "border-black text-black"
                                  : "border-neutral-300 text-neutral-400"
                            }`}
                          >
                            {done ? "✓" : idx + 1}
                          </span>
                          <span className={`text-sm ${done || current ? "font-medium text-neutral-900" : "text-neutral-500"}`}>
                            {step}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
                <p className="mt-4 text-xs leading-5 text-neutral-600">
                  {order.deliveryEstimate || "Delivery expected soon"}
                </p>
              </section>

              <div className="flex flex-col gap-3">
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Shop more items
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  All orders
                </Link>
              </div>
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-12 border-t border-neutral-200 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Similar picks
              </p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                You may also like
              </h2>
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4 xl:gap-x-6">
                {similar.map((item) => (
                  <ProductCard key={item._id} product={item} />
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
