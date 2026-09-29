import {
  formatPrice,
  stockState,
  totalStock,
  variantPriceRange,
} from "../utils/product";

function IconPencil() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17l-1 3Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StockBadge({ product }) {
  const state = stockState(product);

  if (state === "in") {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-neutral-800">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-700" />
        {totalStock(product)} in stock
      </span>
    );
  }

  if (state === "low") {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800">
        <span aria-hidden="true" className="h-1.5 w-1.5 bg-black" />
        Low · {totalStock(product)} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm text-neutral-700">
      <span aria-hidden="true" className="h-1.5 w-1.5 bg-neutral-400" />
      {state === "nostock" ? "Unlisted" : "Out of stock"}
    </span>
  );
}

function VariantBadges({ product }) {
  const variants = product.variant ?? [];
  if (variants.length <= 1) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label={`Variants of ${product.title}`}>
      {variants.map((variant, index) => {
        const size = variant.attributes?.size ?? variant.attributes?.get?.("size") ?? "";
        const color = variant.attributes?.color ?? variant.attributes?.get?.("color") ?? "";
        const stock = Number(variant.stock) || 0;
        const dot = stock === 0 ? "bg-neutral-400" : stock < 5 ? "bg-black" : "bg-green-700";
        return (
          <li
            key={variant._id || index}
            title={`${size}${color ? ` / ${color}` : ""} — ${stock} in stock`}
            className="inline-flex items-center gap-1.5 border border-neutral-200 px-2 py-1 text-[11px] text-neutral-700"
          >
            <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${dot}`} />
            {[size, color].filter(Boolean).join(" / ") || `V${index + 1}`} · {stock}
          </li>
        );
      })}
    </ul>
  );
}

function priceLabel(product) {
  const range = variantPriceRange(product);
  if (!range) return "—";

  const { min, max, currency } = range;
  return min === max
    ? formatPrice({ basePrice: min, currency })
    : `${formatPrice({ basePrice: min, currency })}+`;
}

function RowActions({ product, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        aria-label={`Edit ${product.title}`}
        onClick={onEdit}
        className="flex h-11 w-11 items-center justify-center border border-transparent text-neutral-700 transition-colors hover:border-neutral-300 hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        <IconPencil />
      </button>
      <button
        type="button"
        aria-label={`Delete ${product.title}`}
        onClick={onDelete}
        className="flex h-11 w-11 items-center justify-center border border-transparent text-neutral-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
      >
        <IconTrash />
      </button>
    </div>
  );
}

export function SellerProductsSkeleton() {
  return (
    <div aria-hidden="true" className="divide-y divide-neutral-200 border-y border-neutral-200">
      {[0, 1, 2, 3].map((index) => (
        <div
          key={index}
          className="grid grid-cols-[48px_minmax(0,1fr)_88px] items-center gap-3 py-4 md:grid-cols-[64px_minmax(0,1fr)_140px_140px_96px] md:gap-4"
        >
          <div className="h-16 w-12 animate-pulse bg-neutral-100 md:w-14" />
          <div className="min-w-0">
            <div className="h-4 w-3/4 animate-pulse bg-neutral-100" />
            <div className="mt-2 h-3 w-2/5 animate-pulse bg-neutral-100" />
          </div>
          <div className="h-4 w-16 justify-self-end animate-pulse bg-neutral-100 md:justify-self-auto" />
          <div className="hidden h-4 w-20 animate-pulse bg-neutral-100 md:block" />
          <div className="hidden h-11 w-23 justify-self-end animate-pulse bg-neutral-100 md:block" />
        </div>
      ))}
    </div>
  );
}

export default function SellerProducts({
  products = [],
  loading = false,
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  selectedIds = null,
  onToggleSelect = null,
  onToggleAll = null,
  onBulkDelete = null,
  bulkBusy = false,
}) {
  const selectable = Array.isArray(selectedIds) && typeof onToggleSelect === "function";
  const allSelected = selectable && products.length > 0 && products.every((p) => selectedIds.includes(p._id));
  return (
    <section
      aria-label="My products"
      className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8 sm:py-12"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-neutral-200 pb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Seller studio
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">My products</h1>
          <p className="mt-2 text-sm text-neutral-600">
            {loading
              ? "Loading products…"
              : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Add product
        </button>
      </div>

      {selectable && selectedIds.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-neutral-300 bg-neutral-50 px-4 py-2.5">
          <p className="text-sm font-medium" role="status">
            {selectedIds.length} selected
          </p>
          {onBulkDelete && (
            <button
              type="button"
              disabled={bulkBusy}
              onClick={onBulkDelete}
              className="inline-flex min-h-11 items-center gap-2 border border-red-200 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-red-700 transition-colors hover:bg-red-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-wait disabled:opacity-60"
            >
              <IconTrash />
              {bulkBusy ? "Deleting…" : `Delete ${selectedIds.length}`}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div role="status" aria-label="Loading products">
          <SellerProductsSkeleton />
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Your catalog
          </p>
          <h2 className="mt-2 text-xl font-semibold">No products yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">
            Add your first product to open your store.
          </p>
        </div>
      ) : (
        <div>
          <div
            aria-hidden="true"
            className={`hidden gap-4 border-b border-neutral-900 pb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600 md:grid ${
              selectable
                ? "grid-cols-[28px_64px_minmax(0,1fr)_140px_140px_96px]"
                : "grid-cols-[64px_minmax(0,1fr)_140px_140px_96px]"
            }`}
          >
            {selectable && <span />}
            <span>Image</span>
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span className="text-right">Actions</span>
          </div>

          <ul className="divide-y divide-neutral-200">
            {selectable && products.length > 0 && (
              <li className="flex items-center gap-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onToggleAll}
                  aria-label={allSelected ? "Deselect all products" : "Select all products"}
                  className="h-5 w-5 accent-black"
                />
                <span className="text-neutral-600">
                  {allSelected ? "Deselect all" : "Select all"}
                </span>
              </li>
            )}
            {products.map((product) => (
              <li
                key={product._id}
                className={`grid items-center gap-3 py-4 ${
                  selectable
                    ? "grid-cols-[28px_48px_minmax(0,1fr)_auto] md:grid-cols-[28px_64px_minmax(0,1fr)_140px_140px_96px] md:gap-4"
                    : "grid-cols-[48px_minmax(0,1fr)_auto] md:grid-cols-[64px_minmax(0,1fr)_140px_140px_96px] md:gap-4"
                }`}
              >
                {selectable && (
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product._id)}
                    onChange={() => onToggleSelect(product._id)}
                    aria-label={`Select ${product.title}`}
                    className="h-5 w-5 accent-black"
                  />
                )}
                <div className="h-16 w-12 overflow-hidden border border-neutral-200 bg-neutral-100 md:w-14">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                      —
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p
                    title={product.title}
                    className="truncate text-[15px] font-semibold leading-5 text-neutral-900"
                  >
                    {product.title}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    {(product.variant ?? []).length} variant
                    {(product.variant ?? []).length === 1 ? "" : "s"}
                  </p>
                  <VariantBadges product={product} />
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
                    <span className="text-sm font-semibold tabular-nums">
                      {priceLabel(product)}
                    </span>
                    <StockBadge product={product} />
                  </div>
                </div>

                <span className="hidden text-sm font-semibold tabular-nums md:block">
                  {priceLabel(product)}
                </span>
                <span className="hidden md:block">
                  <StockBadge product={product} />
                </span>
                <RowActions
                  product={product}
                  onEdit={() => onEdit(product)}
                  onDelete={() => onDelete(product)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
