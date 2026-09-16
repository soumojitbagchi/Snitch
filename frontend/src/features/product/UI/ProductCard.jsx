import { useState } from "react";
import { Link } from "react-router-dom";
import {
  formatPrice,
  sizeList,
  stockState,
  variantPriceRange,
} from "../utils/product";

const stockLabels = {
  low: "Low stock",
  out: "Out of stock",
  nostock: "Unavailable",
};

export default function ProductCard({ product }) {
  const [failedImage, setFailedImage] = useState(null);
  const image = product.images?.[0]?.url;
  const range = variantPriceRange(product);
  const stock = stockState(product);
  const sizes = sizeList(product);
  const stockLabel = stockLabels[stock];

  const price = range
    ? range.min === range.max
      ? formatPrice({ basePrice: range.min, currency: range.currency })
      : `${formatPrice({ basePrice: range.min, currency: range.currency })} – ${formatPrice({ basePrice: range.max, currency: range.currency })}`
    : "Price unavailable";

  return (
    <article className="group min-w-0">
      <Link
        to={`/product/${product._id}`}
        aria-label={`View ${product.title}`}
        className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <div className="relative aspect-[3/4] overflow-hidden border border-neutral-200 bg-neutral-100">
          {image && image !== failedImage ? (
            <img
              src={image}
              alt={product.title}
              loading="lazy"
              onError={() => setFailedImage(image)}
              className="h-full w-full object-cover object-top transition-transform duration-500 motion-reduce:transition-none sm:group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-neutral-600">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Image unavailable
              </span>
              <span className="text-xs">Product image coming soon</span>
            </div>
          )}

          {stockLabel && (
            <span className="absolute bottom-3 left-3 border border-neutral-300 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-neutral-700">
              {stockLabel}
            </span>
          )}
        </div>

        <div className="flex min-h-31 flex-col border-x border-b border-neutral-200 px-3 py-3.5 sm:px-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="min-w-0 break-words text-sm font-semibold leading-5 text-neutral-900">
              {product.title}
            </h2>
            <p className="shrink-0 whitespace-nowrap text-sm font-semibold tabular-nums text-neutral-900">
              {price}
            </p>
          </div>

          {sizes.length > 0 && (
            <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-600">
              Sizes: {sizes.join(", ")}
            </p>
          )}

          {product.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-600">
              {product.description}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}
