import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectOrders, selectLatestOrder } from "../../redux/order.slice";
import { formatPrice } from "../../product/utils/product";
import OrderStatusPill from "./OrderStatusPill";

function CheckBadgeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-emerald-600"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-400"
      aria-hidden="true"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

export default function OrdersPage() {
  const orders = useSelector(selectOrders);
  const latestOrder = useSelector(selectLatestOrder);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      {/* Header */}
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex min-h-16 w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="text-lg font-bold uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-black"
          >
            Snitch
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider">
            <Link
              to="/cart"
              className="text-neutral-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Cart
            </Link>
            <Link
              to="/"
              className="text-neutral-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Shop
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1000px] px-5 py-8 sm:px-8 sm:py-12">
          {/* Newly Placed Order Banner (if just placed) */}
          {latestOrder && (
            <div className="mb-8 border border-emerald-300 bg-emerald-50/60 p-5 text-neutral-900 sm:p-6">
              <div className="flex items-start gap-3">
                <CheckBadgeIcon />
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
                    Order Placed Successfully!
                  </p>
                  <h2 className="mt-1 text-base font-semibold">
                    Thank you for ordering with Snitch.
                  </h2>
                  <p className="mt-1 text-xs text-neutral-600">
                    Order <strong>#{latestOrder.id}</strong> has been confirmed. Total paid:{" "}
                    <strong>
                      {formatPrice({
                        basePrice: latestOrder.totalAmount,
                        currency: "INR",
                      })}
                    </strong>
                    .
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Page Heading */}
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-6 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Purchase History
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Your Orders
              </h1>
            </div>
            <p className="text-xs font-medium text-neutral-600">
              {orders.length} {orders.length === 1 ? "order" : "orders"} placed
            </p>
          </div>

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border border-neutral-200 bg-neutral-50">
                <PackageIcon />
              </div>
              <h2 className="mt-6 text-lg font-semibold tracking-tight text-neutral-900">
                No orders yet
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                When you place orders, they will appear here with live tracking updates.
              </p>
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  className="border border-neutral-200 bg-white transition-colors hover:border-neutral-300"
                >
                  {/* Order Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3.5 text-xs">
                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                          Order Number
                        </span>
                        <p className="font-bold text-neutral-900">#{order.id}</p>
                      </div>
                      <span className="hidden text-neutral-300 sm:inline">|</span>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                          Date Placed
                        </span>
                        <p className="font-medium text-neutral-700">{order.date}</p>
                      </div>
                      <span className="hidden text-neutral-300 sm:inline">|</span>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500">
                          Total Value
                        </span>
                        <p className="font-bold text-neutral-900 tabular-nums">
                          {formatPrice({
                            basePrice: order.totalAmount,
                            currency: "INR",
                          })}
                        </p>
                      </div>
                    </div>

                    <OrderStatusPill status={order.status} />
                  </div>

                  {/* Order Items List */}
                  <div className="divide-y divide-neutral-100 p-5">
                    {order.items?.map((item, idx) => (
                      <Link
                        key={idx}
                        to={`/orders/${order.id}`}
                        aria-label={`View order ${order.id} details`}
                        className="flex items-center gap-4 py-3 first:pt-0 last:pb-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        <div className="h-16 w-14 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              aria-hidden="true"
                              className="h-full w-full object-cover object-top"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[9px] uppercase text-neutral-400">
                              Item
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-neutral-900 sm:text-sm">
                            {item.title}
                          </p>
                          <p className="mt-0.5 text-[11px] text-neutral-500">
                            {item.size && `Size: ${item.size}`}
                            {item.color && ` · Color: ${item.color}`}
                            {` · Qty: ${item.quantity || 1}`}
                          </p>
                        </div>

                        <span className="text-xs font-semibold tabular-nums text-neutral-900">
                          {formatPrice({
                            basePrice: (item.price || 0) * (item.quantity || 1),
                            currency: item.currency || "INR",
                          })}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 bg-neutral-50/50 px-5 py-3 text-xs">
                    <span className="text-neutral-500">
                      {order.deliveryEstimate || "Delivery expected soon"}
                    </span>
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-semibold uppercase tracking-wider text-black underline underline-offset-4 hover:text-neutral-600"
                      >
                        View details
                      </Link>
                      <Link
                        to="/"
                        className="font-semibold uppercase tracking-wider text-neutral-500 underline underline-offset-4 hover:text-black"
                      >
                        Shop More Items
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <span>Snitch © 2026 · Minimalist Menswear</span>
        </div>
      </footer>
    </div>
  );
}
