import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../../../components/Navbar";
import ProductLandingFooter from "./ProductLandingFooter";
import ShopGrid from "./ShopGrid";
import { useProduct } from "../hooks/useProduct";
import { selectAuth } from "../../redux/auth.slice";

const CATEGORIES = [
  { label: "New Arrivals", query: "new arrivals" },
  { label: "Bestsellers", query: "bestsellers" },
  { label: "Shirts", query: "shirts" },
  { label: "T-Shirts", query: "t-shirts" },
  { label: "Jeans", query: "jeans" },
  { label: "Cargos", query: "cargos" },
  { label: "Sale", query: "sale" },
];

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
        <section aria-labelledby="hero-heading" className="border-b border-neutral-200 bg-neutral-950 text-white">
          <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-2 lg:items-center lg:gap-12">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                FW26 — Drop 02
              </p>
              <h2 id="hero-heading" className="mt-3 font-serif text-4xl font-light leading-[1.08] tracking-tight sm:text-5xl">
                Dress like you mean it.
              </h2>
              <p className="mt-4 max-w-md text-base leading-7 text-white/70">
                Everyday pieces, made to be worn on repeat. Flat ₹200 off over ₹1,499 with code SNITCH200.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Shop the latest
                </a>
                <Link
                  to="/search?q=bestsellers"
                  className="inline-flex min-h-11 items-center justify-center border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Bestsellers
                </Link>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-900 lg:aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1400&auto=format&fit=crop"
                alt="Snitch FW26 menswear editorial"
                loading="eager"
                className="absolute inset-0 h-full w-full object-cover object-top grayscale"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" aria-hidden="true" />
            </div>
          </div>
        </section>

        <section aria-label="Shop by category" className="border-b border-neutral-200 bg-white">
          <nav aria-label="Categories" className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8">
            <ul className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((item) => (
                <li key={item.label}>
                  <Link
                    to={`/search?q=${encodeURIComponent(item.query)}`}
                    className={`inline-flex min-h-11 items-center justify-center border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black ${
                      item.label === "Sale"
                        ? "border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        : "border-neutral-300 text-neutral-800 hover:border-black hover:text-black"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                This week
              </p>
              <p className="mt-2 max-w-xl text-base leading-7 text-neutral-700 sm:text-lg sm:leading-8">
                New fits landing daily — scroll down to browse the full collection.
              </p>
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
