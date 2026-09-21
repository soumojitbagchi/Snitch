import ShopGrid from "./ShopGrid";
import Navbar from "../../../components/Navbar";
import { useProduct } from "../hooks/useProduct";
import { useEffect } from "react";

function Home() {

  const { products, error, loading, fetchProducts } = useProduct();
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts])
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1400px] px-5 pt-10 sm:px-8 sm:pt-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
            The latest drop
          </p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600 sm:text-[15px]">
            Everyday pieces, made to be worn on repeat.
          </p>
        </div>
        <ShopGrid
          products={products}
          loading={loading}
          error={error}
          onRetry={fetchProducts}
        />
      </main>

      <footer className="mt-8 border-t border-neutral-200">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-5 text-sm text-neutral-600 sm:px-8">
          <span>Snitch</span>
          <span className="text-xs uppercase tracking-[0.14em]">
            Menswear, simplified
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Home;
