import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import ProductLandingFooter from "./ProductLandingFooter";
import ShopGrid from "./ShopGrid";
import { useProduct } from "../hooks/useProduct";
import { selectAuth } from "../../redux/auth.slice";

function Home() {

  const { products, error, loading, fetchProducts } = useProduct();
  const { user } = useSelector(selectAuth);
  const firstName = String(user?.fullname || user?.name || "").trim().split(/\s+/)[0];
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts])
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                The latest drop
              </p>
              <p className="mt-2 max-w-xl text-base leading-7 text-neutral-700 sm:text-lg sm:leading-8">
                Everyday pieces, made to be worn on repeat.
              </p>
              <a
                href="#products"
                className="mt-6 inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                Shop the latest
              </a>
            </div>

            <div className="border-t border-neutral-200 pt-6 lg:w-80 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {user ? (
                <>
                  <p className="text-sm leading-6 text-neutral-600">
                    {firstName ? `Welcome back, ${firstName}.` : "Welcome back."} Your wishlist and orders are saved in one place.
                  </p>
                  <nav aria-label="Account options" className="mt-4">
                    <ul className="flex flex-wrap gap-3">
                      <li>
                        <Link
                          to="/wishlist"
                          className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          View wishlist
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/orders"
                          className="inline-flex min-h-11 items-center justify-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          Review orders
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </>
              ) : (
                <>
                  <p className="text-sm leading-6 text-neutral-600">
                    Sign in to save your wishlist and review your orders in one place.
                  </p>
                  <nav aria-label="Account options" className="mt-4">
                    <ul className="flex flex-wrap gap-3">
                      <li>
                        <Link
                          to="/signin"
                          className="inline-flex min-h-11 items-center justify-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          Sign in
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/signup"
                          className="inline-flex min-h-11 items-center justify-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          Create account
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </>
              )}
            </div>
          </div>
        </section>
        <ShopGrid
          products={products}
          loading={loading}
          error={error}
          onRetry={fetchProducts}
        />
      </main>

      <ProductLandingFooter />
    </div>
  );
}

export default Home;
