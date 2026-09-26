import useAiSuggestions from "../hooks/useAiSuggestions";
import ProductCard from "./ProductCard";

function SuggestionSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading recommendations"
      className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} aria-hidden="true">
          <div className="aspect-[3/4] animate-pulse bg-neutral-100" />
          <div className="mt-3 h-4 w-4/5 animate-pulse bg-neutral-100" />
          <div className="mt-2 h-3 w-2/5 animate-pulse bg-neutral-100" />
        </div>
      ))}
    </div>
  );
}

export default function AiSuggestions({ productId }) {
  const { items, loading, error, retry } = useAiSuggestions(productId);

  // Nothing to show (guest, quota 503, or empty) — keep the page clean.
  if (!loading && !error && items.length === 0) return null;

  return (
    <section
      aria-label="Recommended for you"
      className="mx-auto w-full max-w-[1240px] px-4 pb-12 sm:px-6 lg:px-8"
    >
      <div className="mb-6 border-t border-neutral-200 pt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
          Recommended for you
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
          You may also like
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
          Picked from your orders, wishlist and the product you are viewing.
        </p>
      </div>

      {loading ? (
        <SuggestionSkeleton />
      ) : error ? (
        <div className="flex flex-wrap items-center gap-4 border border-neutral-200 bg-neutral-50 px-5 py-5">
          <p role="alert" className="text-sm text-neutral-600">
            {error}
          </p>
          <button
            type="button"
            onClick={retry}
            className="min-h-10 border border-neutral-300 bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            Try again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4 xl:gap-x-6">
          {items.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      )}
    </section>
  );
}
