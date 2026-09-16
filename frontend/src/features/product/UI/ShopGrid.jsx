import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { variantPriceRange } from "../utils/product";
import { useSelector } from "react-redux";

function CatalogSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading products"
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} aria-hidden="true">
          <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
          <div className="mt-3 h-4 w-4/5 animate-pulse bg-neutral-100" />
          <div className="mt-2 h-3 w-2/5 animate-pulse bg-neutral-100" />
          <div className="mt-3 h-3 w-full animate-pulse bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export default function ShopGrid({
  loading,
  products,
  error,
  onRetry,
  title = "Products",
}) {
  const [sort, setSort] = useState("featured");
  const currencies = new Set(
    products
      .map((product) => variantPriceRange(product)?.currency)
      .filter(Boolean)
  );
  const canSortPrice = currencies.size <= 1;
  const sorted = [...products];

  if (canSortPrice && sort !== "featured") {
    sorted.sort((firstProduct, secondProduct) => {
      const first = variantPriceRange(firstProduct);
      const second = variantPriceRange(secondProduct);

      if (!first) return second ? 1 : 0;
      if (!second) return -1;

      return sort === "low"
        ? first.min - second.min
        : second.min - first.min;
    });
  }

  return (
    <section
      aria-label="Products"
      className="mx-auto w-full max-w-[1400px] px-5 pb-12 pt-8 sm:px-8 sm:pb-16"
    >
      <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {!error && (
            <p className="mt-2 text-sm text-neutral-600">
              {loading
                ? "Loading products…"
                : `${products.length} product${products.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>

        {!loading && !error && products.length > 1 && canSortPrice && (
          <div className="flex min-h-11 items-center gap-3">
            <label
              htmlFor="product-sort"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-600"
            >
              Sort by
            </label>
            <select
              id="product-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="min-h-11 border border-neutral-300 bg-white px-3 text-sm text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <CatalogSkeleton />
      ) : error ? (
        <div className="border border-neutral-300 bg-white px-5 py-8 sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Catalog unavailable
          </p>
          <h2 className="mt-2 text-xl font-semibold">We could not load the products.</h2>
          <p role="alert" className="mt-3 max-w-lg text-sm leading-6 text-neutral-700">
            {error}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="min-h-11 bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Try again
            </button>
            <Link
              to="/signin"
              className="inline-flex min-h-11 items-center px-2 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Sign in
            </Link>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            New season
          </p>
          <h2 className="mt-2 text-xl font-semibold">No products yet</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">
            Products will appear here once they are published.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4 xl:gap-x-6">
          {sorted.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
