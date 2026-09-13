import { formatPrice, stockState, totalStock, variantPriceRange } from "../utils/product";

function IconPencil() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m3 0-1 13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1L6 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StockBadge({ product }) {
  const state = stockState(product);
  if (state === "in") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-700">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-green-600" />
        {totalStock(product)} in stock
      </span>
    );
  }
  if (state === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-900">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-black" />
        Low · {totalStock(product)} left
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-400">
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
      {state === "nostock" ? "Unlisted" : "Out of stock"}
    </span>
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
        className="flex h-11 w-11 items-center justify-center text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2"
      >
        <IconPencil />
      </button>
      <button
        type="button"
        aria-label={`Delete ${product.title}`}
        onClick={onDelete}
        className="flex h-11 w-11 items-center justify-center text-neutral-600 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2"
      >
        <IconTrash />
      </button>
    </div>
  );
}

export function SellerProductsSkeleton() {
  return (
    <div aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-4 border-b border-neutral-200 py-4">
          <div className="h-16 w-14 animate-pulse bg-neutral-100" />
          <div className="flex-1">
            <div className="h-3.5 w-1/2 animate-pulse bg-neutral-100" />
            <div className="mt-2 h-3 w-1/4 animate-pulse bg-neutral-100" />
          </div>
          <div className="h-3.5 w-16 animate-pulse bg-neutral-100" />
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
}) {
  return (
    <section aria-label="My products" className="mx-auto w-full max-w-[1100px] px-5 py-10 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            My products
          </h1>
          <p className="mt-1 text-sm text-neutral-600">
            {loading ? "Loading products…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Add product
        </button>
      </div>

      {loading ? (
        <div role="status" aria-label="Loading products"><SellerProductsSkeleton /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center border border-neutral-200 px-6 py-20 text-center">
          <h2 className="text-lg font-semibold">No products yet</h2>
          <p className="mt-2 max-w-xs text-[14px] leading-6 text-neutral-500">
            Add your first product to open your store.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-6 flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Add product
          </button>
        </div>
      ) : (
        <div>
          <div aria-hidden="true" className="hidden grid-cols-[64px_1fr_140px_140px_96px] gap-4 border-b border-black pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-500 md:grid">
            <span>Image</span>
            <span>Product</span>
            <span>Price</span>
            <span>Stock</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="divide-y divide-neutral-200">
            {products.map((p) => (
              <li
                key={p._id}
                className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 py-4 md:grid-cols-[64px_minmax(0,1fr)_140px_140px_96px] md:gap-4"
              >
                <div className="h-16 w-12 overflow-hidden bg-neutral-100">
                  {p.images?.[0]?.url ? (
                    <img src={p.images[0].url} alt="" loading="lazy" className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.14em] text-neutral-400">
                      —
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-neutral-900">{p.title}</p>
                  <p className="mt-0.5 truncate text-[13px] text-neutral-500">
                    {(p.verient ?? []).length} variant{(p.verient ?? []).length === 1 ? "" : "s"}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 md:hidden">
                    <span className="text-[14px] font-semibold">{priceLabel(p)}</span>
                    <StockBadge product={p} />
                  </div>
                </div>
                <span className="hidden text-[14px] font-semibold md:block">{priceLabel(p)}</span>
                <span className="hidden md:block"><StockBadge product={p} /></span>
                <RowActions product={p} onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
