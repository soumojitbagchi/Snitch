import { useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { variantPriceRange } from "../utils/product";

export default function ShopGrid({ products = [], loading = false, error = "", onRetry, title = "Products" }) {
  const [sort, setSort] = useState("featured");
  const currencies = new Set(products.map((product) => variantPriceRange(product)?.currency).filter(Boolean));
  const canSortPrice = currencies.size <= 1;
  const sorted = [...products];
  if (canSortPrice && sort !== "featured") {
    sorted.sort((a, b) => {
      const first = variantPriceRange(a);
      const second = variantPriceRange(b);
      if (!first) return second ? 1 : 0;
      if (!second) return -1;
      return sort === "low" ? first.min - second.min : second.min - first.min;
    });
  }

  return (
    <section aria-label="Products" className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {!error && <p className="mt-2 text-sm text-neutral-600">
            {loading ? "Loading products…" : `${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>}
        </div>
        {!loading && !error && products.length > 1 && canSortPrice && <div>
          <label htmlFor="product-sort" className="mr-3 text-sm text-neutral-600">Sort by</label>
          <select id="product-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="min-h-11 border border-neutral-300 bg-white px-3 text-sm focus-visible:outline-2">
            <option value="featured">Featured</option>
            <option value="low">Price: Low to high</option>
            <option value="high">Price: High to low</option>
          </select>
        </div>}
      </div>
      {loading ? (
        <div role="status" aria-label="Loading products" className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => <div key={index} aria-hidden="true" className="aspect-[3/4] bg-neutral-100" />)}
        </div>
      ) : error ? (
        <div className="border border-neutral-200 p-6">
          <p role="alert" className="text-sm leading-6 text-neutral-700">{error}</p>
          <div className="mt-4 flex items-center gap-5">
            <button type="button" onClick={onRetry} className="min-h-11 bg-black px-4 text-sm text-white">Try again</button>
            <Link to="/signin" className="inline-flex min-h-11 items-center text-sm underline">Sign in</Link>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="border border-neutral-200 px-6 py-16 text-center">
          <h2 className="text-lg font-medium">No products yet</h2>
          <p className="mt-2 text-sm text-neutral-600">Products will appear here once they are published.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
          {sorted.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}
    </section>
  );
}
