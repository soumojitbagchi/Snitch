import { Link } from "react-router-dom";
import { formatPrice } from "../../product/utils/product";

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function CartItem({ item, onDelete, onUpdateQuantity }) {
  const lineTotal = (item.price || 0) * (item.quantity || 1);

  return (
    <div
      data-testid={`cart-item-${item.id}`}
      className="group relative flex flex-col gap-4 border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 sm:flex-row sm:items-center sm:justify-between sm:p-5"
    >
      {/* Product Image & Info */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Link
          to={`/product/${item.productId}`}
          className="relative h-24 w-20 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100 focus-visible:outline-2 focus-visible:outline-black"
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-wider text-neutral-400">
              Snitch
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            to={`/product/${item.productId}`}
            className="truncate text-sm font-semibold text-neutral-900 transition-colors hover:underline"
          >
            {item.title}
          </Link>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            {item.size && (
              <span className="border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-[11px] font-medium uppercase text-neutral-700">
                Size: {item.size}
              </span>
            )}
            {item.color && (
              <span className="text-[11px] text-neutral-600">
                Color: {item.color}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            <span className="text-sm font-bold tabular-nums text-neutral-900">
              {formatPrice({ basePrice: lineTotal, currency: item.currency || "INR" })}
            </span>
            {item.quantity > 1 && (
              <span className="text-[11px] text-neutral-400">
                ({formatPrice({ basePrice: item.price, currency: item.currency || "INR" })} each)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Side Actions Area: Quantity & Side Delete Button */}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3 sm:border-t-0 sm:pt-0 sm:justify-end sm:gap-6">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-neutral-200">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
            disabled={item.quantity <= 1}
            className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30"
          >
            –
          </button>
          <span className="flex h-8 min-w-8 items-center justify-center px-2 text-xs font-semibold tabular-nums text-neutral-900">
            {item.quantity || 1}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
            className="flex h-8 w-8 items-center justify-center text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-100"
          >
            +
          </button>
        </div>

        {/* Side Delete Button (as explicitly requested) */}
        <button
          type="button"
          aria-label={`Delete ${item.title} from cart`}
          onClick={() => onDelete(item.id)}
          className="flex h-9 items-center gap-1.5 border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:border-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-red-600"
        >
          <TrashIcon />
          <span className="uppercase tracking-wider text-[11px]">Delete</span>
        </button>
      </div>
    </div>
  );
}
