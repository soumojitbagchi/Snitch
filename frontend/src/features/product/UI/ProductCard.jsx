import { useState } from "react";
import { formatPrice, sizeList, stockState, variantPriceRange } from "../utils/product";

export default function ProductCard({ product }) {
  const [failedImage, setFailedImage] = useState(null);
  const image = product.images?.[0]?.url;
  const range = variantPriceRange(product);
  const stock = stockState(product);
  const sizes = sizeList(product);
  const stockLabel = { low: "Low stock", out: "Out of stock", nostock: "Unavailable" }[stock];

  return (
    <article className="min-w-0">
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-100">
        {image && image !== failedImage ? (
          <img src={image} alt={product.title} loading="lazy" onError={() => setFailedImage(image)} className="h-full w-full object-cover object-top" />
        ) : <div className="flex h-full items-center justify-center text-sm text-neutral-600">No image</div>}
        {stockLabel && <span className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs text-neutral-700">{stockLabel}</span>}
      </div>
      <div className="pt-3">
        <h2 className="break-words text-sm font-medium leading-5">{product.title}</h2>
        <p className="mt-1 text-sm font-semibold">
          {range ? formatPrice({ basePrice: range.min, currency: range.currency }) + (range.min !== range.max ? "+" : "") : "Price unavailable"}
        </p>
        {sizes.length > 0 && <p className="mt-1 text-xs leading-5 text-neutral-600">Sizes: {sizes.join(", ")}</p>}
        {product.description && <p className="mt-2 line-clamp-2 text-sm leading-5 text-neutral-600">{product.description}</p>}
      </div>
    </article>
  );
}
