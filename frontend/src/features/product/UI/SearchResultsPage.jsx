import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import { productError } from "../utils/product";
import { searchProducts } from "../services/product.api";
import ShopGrid from "./ShopGrid";

function SearchEmptyState({ query }) {
  return (
    <div className="border border-dashed border-neutral-300 px-6 py-16 text-center sm:py-20">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
        No matches
      </p>
      <h2 className="mt-2 text-xl font-semibold text-neutral-900">
        Nothing found for “{query}”
      </h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-neutral-600">
        Try a product type, colour, or a shorter search term.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        Browse all products
      </Link>
    </div>
  );
}

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!query) return undefined;

    const controller = new AbortController();

    const loadResults = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await searchProducts(query, controller.signal);
        setProducts(Array.isArray(response?.data) ? response.data : []);
      } catch (requestError) {
        if (requestError?.code !== "ERR_CANCELED") {
          setProducts([]);
          setError(productError(requestError, "Unable to search products."));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    loadResults();
    return () => controller.abort();
  }, [query, retryCount]);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-10 sm:px-8 sm:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
              Catalog search
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {query ? <>Results for “{query}”</> : "Find your next essential"}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
              {query
                ? "Browse the pieces that match your search."
                : "Use the search field above to explore the latest collection."}
            </p>
          </div>
        </section>

        {!query ? (
          <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
            <SearchEmptyState query="your search" />
          </div>
        ) : !loading && !error && products.length === 0 ? (
          <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-16">
            <SearchEmptyState query={query} />
          </div>
        ) : (
          <ShopGrid
            title="Matching products"
            products={products}
            loading={loading}
            error={error}
            onRetry={() => setRetryCount((count) => count + 1)}
          />
        )}
      </main>
    </div>
  );
}
