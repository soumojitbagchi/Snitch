import { Link, useParams } from "react-router-dom";
import useProductDetails from "../hooks/useProductDetails";
import ProductDetails from "./ProductDetails";
import ProductDetailsSkeleton from "./ProductDetailsSkeleton";

function StoreHeader() {
  return (
    <header className="border-b border-neutral-200">
      <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center justify-between gap-5 px-5 sm:px-8">
        <Link
          to="/"
          className="text-lg font-bold uppercase tracking-[0.22em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Snitch
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center px-2 text-sm font-medium text-neutral-700 underline underline-offset-4 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          All products
        </Link>
      </div>
    </header>
  );
}

function ProductError({ error, onRetry }) {
  const notFound = error === "Product not found" || error === "Product not found.";

  return (
    <section className="mx-auto w-full max-w-[760px] px-5 py-16 sm:px-8 sm:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        {notFound ? "Product not found" : "Product unavailable"}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {notFound ? "This product is no longer available." : "We could not load this product."}
      </h1>
      <p role="alert" className="mt-4 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
        {error}
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        {!notFound && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Try again
          </button>
        )}
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

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { product, loading, error, retry } = useProductDetails(id);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <StoreHeader />
      <main className="flex-1" aria-busy={loading}>
        {loading ? (
          <ProductDetailsSkeleton />
        ) : error ? (
          <ProductError error={error} onRetry={retry} />
        ) : (
          <>
            <div className="mx-auto w-full max-w-[1240px] px-4 pt-6 sm:px-6 lg:px-8">
              <Link
                to="/"
                className="inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4 transition-colors hover:text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Back to products
              </Link>
            </div>
            <ProductDetails key={product._id} product={product} className="pt-2" />
          </>
        )}
      </main>
    </div>
  );
}
