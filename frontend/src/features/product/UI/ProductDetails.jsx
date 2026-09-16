import { useMemo, useState } from "react";
import { mockProducts } from "./mockProducts";
import { formatPrice } from "../utils/product";

function WishlistIcon({ filled }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={filled ? "text-red-600 scale-110 transition-transform duration-200" : "text-neutral-800 transition-transform duration-200"}
    >
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ChevronDownIcon({ open }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function ProductGallery({
  images = [],
  title = "Product",
  isWishlisted = false,
  onToggleWishlist,
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [failedImages, setFailedImages] = useState(new Set());

  const imageList = useMemo(() => {
    if (!images || images.length === 0) return [];
    return images.map((img) => (typeof img === "string" ? img : img.url));
  }, [images]);

  const activeImage = imageList[selectedIdx] || imageList[0];
  const isImageFailed = activeImage && failedImages.has(activeImage);

  const handleImageError = (url) => {
    setFailedImages((prev) => new Set(prev).add(url));
  };

  return (
    <div className="flex flex-col-reverse gap-3 lg:flex-row lg:gap-4">
      {imageList.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 lg:w-20 lg:flex-col lg:overflow-visible lg:pb-0">
          {imageList.map((imgUrl, idx) => {
            const isSelected = idx === selectedIdx;
            const hasFailed = failedImages.has(imgUrl);

            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-label={`View image ${idx + 1} of ${imageList.length}`}
                aria-current={isSelected ? "true" : undefined}
                className={`relative aspect-[3/4] w-16 shrink-0 overflow-hidden border transition-all focus-visible:outline-2 focus-visible:outline-black ${isSelected
                    ? "border-black ring-1 ring-black"
                    : "border-neutral-200 hover:border-neutral-400"
                  }`}
              >
                {!hasFailed ? (
                  <img
                    src={imgUrl}
                    alt=""
                    onError={() => handleImageError(imgUrl)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-[9px] uppercase tracking-wider text-neutral-400">
                    N/A
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden border border-neutral-200 bg-neutral-100">
        {activeImage && !isImageFailed ? (
          <img
            src={activeImage}
            alt={title}
            onError={() => handleImageError(activeImage)}
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center text-neutral-500">
            <span className="text-xs font-semibold uppercase tracking-[0.16em]">
              Image Unavailable
            </span>
            <span className="text-xs text-neutral-400">
              Product visual coming soon
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isWishlisted}
          className="absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/95 shadow-sm backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:border-black hover:bg-white focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
        >
          <WishlistIcon filled={isWishlisted} />
        </button>
      </div>
    </div>
  );
}

export function ProductHeader({ category, title, price, currency, stockAmount }) {
  const formatted = formatPrice({ basePrice: price, currency });
  const isOutOfStock = stockAmount === 0;
  const isLowStock = stockAmount > 0 && stockAmount <= 5;

  return (
    <div className="border-b border-neutral-200 pb-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
          {category || "Snitch Menswear"}
        </span>

        {isOutOfStock ? (
          <span className="border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-700">
            Out of Stock
          </span>
        ) : isLowStock ? (
          <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-800">
            Only {stockAmount} left
          </span>
        ) : (
          <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
            In Stock
          </span>
        )}
      </div>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
        {title}
      </h1>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-semibold tabular-nums text-neutral-900 sm:text-3xl">
          {formatted}
        </span>
        <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
          Incl. of all taxes
        </span>
      </div>
    </div>
  );
}

export function VariantSelector({
  variants = [],
  selectedVariantIndex = 0,
  onSelectVariant,
  quantity = 1,
  onChangeQuantity,
}) {
  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const maxStock = typeof activeVariant?.stock === "number" ? activeVariant.stock : (activeVariant?.stock?.basePrice ?? 99);

  const sizes = useMemo(() => {
    return variants.map((v, idx) => {
      const sizeVal = v.attributes?.size || (v.attributes instanceof Map ? v.attributes.get("size") : "") || "Standard";
      const stock = typeof v.stock === "number" ? v.stock : (v.stock?.basePrice ?? 0);
      return { size: sizeVal, index: idx, inStock: stock > 0 };
    });
  }, [variants]);

  const colorName = useMemo(() => {
    if (!activeVariant?.attributes) return null;
    return (
      activeVariant.attributes.color ||
      (activeVariant.attributes instanceof Map ? activeVariant.attributes.get("color") : null)
    );
  }, [activeVariant]);

  return (
    <div className="space-y-5 border-b border-neutral-200 py-5">
      {colorName && (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Color:
            </span>
            <span className="font-medium text-neutral-900">{colorName}</span>
          </div>
        </div>
      )}

      {sizes.length > 0 && sizes[0].size !== "Standard" && (
        <div>
          <div className="mb-2.5 flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-[0.14em] text-neutral-600">
              Select Size
            </span>
            <span className="text-neutral-500 underline cursor-pointer hover:text-black">
              Size Guide
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label="Product size">
            {sizes.map(({ size, index, inStock }) => {
              const isSelected = index === selectedVariantIndex;

              return (
                <button
                  key={index}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={!inStock}
                  onClick={() => onSelectVariant(index)}
                  className={`relative flex min-w-12 h-11 items-center justify-center px-3.5 text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-2 focus-visible:outline-black ${isSelected
                      ? "border-2 border-black bg-black text-white"
                      : inStock
                        ? "border border-neutral-300 bg-white text-neutral-900 hover:border-black"
                        : "border border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed line-through"
                    }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-600">
          Quantity:
        </span>
        <div className="inline-flex items-center border border-neutral-300 bg-white">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => onChangeQuantity(Math.max(1, quantity - 1))}
            className="flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            -
          </button>
          <span className="w-10 text-center text-sm font-semibold tabular-nums text-neutral-900">
            {quantity}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={quantity >= maxStock}
            onClick={() => onChangeQuantity(quantity + 1)}
            className="flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductActions({
  onAddToCart,
  onBuyNow,
  isOutOfStock = false,
  addedFeedback = false,
}) {
  return (
    <div className="space-y-3 py-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          className={`flex min-h-12 w-full items-center justify-center gap-2 border px-6 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isOutOfStock
              ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : addedFeedback
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-black bg-white text-black hover:bg-neutral-100 active:bg-neutral-200"
            }`}
        >
          <BagIcon />
          <span>{addedFeedback ? "Added to Cart ✓" : "Add to Cart"}</span>
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onBuyNow}
          className={`flex min-h-12 w-full items-center justify-center border px-6 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${isOutOfStock
              ? "border-neutral-200 bg-neutral-200 text-neutral-400 cursor-not-allowed"
              : "border-black bg-black text-white hover:bg-neutral-800 active:bg-neutral-900"
            }`}
        >
          Buy Now
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-200 text-center">
        <div className="flex flex-col items-center gap-1.5 p-2">
          <TruckIcon />
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">
            Free Shipping &gt; ₹1,499
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-2">
          <ReturnIcon />
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">
            7 Days Easy Returns
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-2">
          <ShieldIcon />
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600">
            100% Genuine
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProductAccordion({ description }) {
  const [openSections, setOpenSections] = useState({
    description: true,
    shipping: false,
    care: false,
  });

  const toggle = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="border-t border-neutral-200">
      <div className="border-b border-neutral-200">
        <button
          type="button"
          onClick={() => toggle("description")}
          aria-expanded={openSections.description}
          className="flex w-full items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:text-neutral-600"
        >
          <span>Description & Details</span>
          <ChevronDownIcon open={openSections.description} />
        </button>
        {openSections.description && (
          <div className="pb-4 text-sm leading-relaxed text-neutral-600">
            <p>{description || "Premium everyday essential crafted for elevated comfort and timeless style."}</p>
            <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-neutral-600">
              <li>Relaxed modern silhouette</li>
              <li>Breathable, high-density fabric composition</li>
              <li>Signature reinforced seam stitching</li>
            </ul>
          </div>
        )}
      </div>

      <div className="border-b border-neutral-200">
        <button
          type="button"
          onClick={() => toggle("shipping")}
          aria-expanded={openSections.shipping}
          className="flex w-full items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:text-neutral-600"
        >
          <span>Shipping & Returns</span>
          <ChevronDownIcon open={openSections.shipping} />
        </button>
        {openSections.shipping && (
          <div className="pb-4 text-sm leading-relaxed text-neutral-600 space-y-2">
            <p className="text-xs">
              Orders dispatched within 24-48 hours. Standard domestic delivery takes 3-5 business days.
            </p>
            <p className="text-xs">
              Hassle-free 7-day doorstep return and exchange available for unworn items with tags intact.
            </p>
          </div>
        )}
      </div>

      <div className="border-b border-neutral-200">
        <button
          type="button"
          onClick={() => toggle("care")}
          aria-expanded={openSections.care}
          className="flex w-full items-center justify-between py-4 text-left text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900 hover:text-neutral-600"
        >
          <span>Materials & Care</span>
          <ChevronDownIcon open={openSections.care} />
        </button>
        {openSections.care && (
          <div className="pb-4 text-xs leading-relaxed text-neutral-600 space-y-1">
            <p>• 100% Combed Cotton</p>
            <p>• Machine wash cold inside out with like colors</p>
            <p>• Tumble dry low or hang dry in shade</p>
            <p>• Warm iron if needed, avoid ironing directly on prints</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductDetails({
  product: initialProduct = null,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted: initialWishlist = false,
  className = "",
}) {
  const product = initialProduct || mockProducts[0];

  const variants = useMemo(() => {
    return product?.verient || product?.variants || [];
  }, [product]);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(initialWishlist);
  const [addedFeedback, setAddedFeedback] = useState(false);

  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const activePrice = activeVariant?.price?.basePrice ?? 0;
  const activeCurrency = activeVariant?.price?.currency ?? "INR";
  const activeStock = typeof activeVariant?.stock === "number" ? activeVariant.stock : (activeVariant?.stock?.basePrice ?? 0);
  const isOutOfStock = activeStock === 0;

  const allImages = useMemo(() => {
    const mainImages = product?.images ?? [];
    const variantImages = activeVariant?.images ?? [];
    const combined = [...mainImages, ...variantImages];
    const seen = new Set();
    return combined.filter((img) => {
      const url = typeof img === "string" ? img : img?.url;
      if (!url || seen.has(url)) return false;
      seen.add(url);
      return true;
    });
  }, [product?.images, activeVariant]);

  const handleToggleWishlist = () => {
    const nextState = !wishlisted;
    setWishlisted(nextState);
    if (onToggleWishlist) {
      onToggleWishlist(product, nextState);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);

    if (onAddToCart) {
      onAddToCart({
        product,
        variant: activeVariant,
        quantity,
      });
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (onBuyNow) {
      onBuyNow({
        product,
        variant: activeVariant,
        quantity,
      });
    }
  };

  if (!product) return null;

  return (
    <article className={`mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 ${className}`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <ProductGallery
            images={allImages}
            title={product.title}
            isWishlisted={wishlisted}
            onToggleWishlist={handleToggleWishlist}
          />
        </div>

        <div className="flex flex-col lg:col-span-5">
          <ProductHeader
            category={product.category}
            title={product.title}
            price={activePrice}
            currency={activeCurrency}
            stockAmount={activeStock}
          />

          <VariantSelector
            variants={variants}
            selectedVariantIndex={selectedVariantIndex}
            onSelectVariant={setSelectedVariantIndex}
            quantity={quantity}
            onChangeQuantity={setQuantity}
          />

          <ProductActions
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isOutOfStock={isOutOfStock}
            addedFeedback={addedFeedback}
          />

          <ProductAccordion description={product.description} />
        </div>
      </div>
    </article>
  );
}
