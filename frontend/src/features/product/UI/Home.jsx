import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ShopGrid from "./ShopGrid";
import { fetchAllProducts } from "../services/product.api";
import { productError } from "../utils/product";

function Home() {
  const [catalog, setCatalog] = useState({ products: [], loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    fetchAllProducts(controller.signal).then((response) => {
      if (!Array.isArray(response?.data)) throw new Error("Invalid products response.");
      if (!controller.signal.aborted) setCatalog({ products: response.data, loading: false, error: "" });
    }).catch((error) => {
      if (!controller.signal.aborted) setCatalog({ products: [], loading: false, error: productError(error, "Products could not be loaded. Please try again.") });
    });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex min-h-16 max-w-[1400px] flex-wrap items-center justify-between gap-3 px-5 sm:px-8">
          <Link to="/" className="text-lg font-bold uppercase tracking-[0.2em]">Snitch</Link>
          <nav aria-label="Store" className="flex gap-4 text-sm">
            <Link to="/seller" className="inline-flex min-h-11 items-center hover:underline">My products</Link>
            <Link to="/signin" className="inline-flex min-h-11 items-center hover:underline">Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <ShopGrid {...catalog} onRetry={() => {
          setCatalog({ products: [], loading: true, error: "" });
          setAttempt((value) => value + 1);
        }} />
      </main>
      <footer className="border-t border-neutral-200 px-5 py-6 text-sm text-neutral-600 sm:px-8">Snitch</footer>
    </div>
  );
}

export default Home;
