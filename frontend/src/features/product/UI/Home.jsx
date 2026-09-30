import { useEffect, useRef, useState } from "react";
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

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing olive field jacket and jeans" },
  { src: "https://images.unsplash.com/photo-1520975954732-35dd22299614?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing white shirt and chinos" },
  { src: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing denim jacket outfit" },
  { src: "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model in streetwear layered outfit" },
  { src: "https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing casual jacket and tee" },
  { src: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing tailored suit" },
  { src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=600&h=800&auto=format&fit=crop", alt: "Folded graphic t-shirts collection" },
  { src: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing plain white tee" },
  { src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing printed t-shirt" },
  { src: "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing black tee and trousers" },
  { src: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing checked shirt" },
  { src: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing blazer over shirt" },
  { src: "https://images.unsplash.com/photo-1603252109303-2751441dd157?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing suit on the street" },
  { src: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600&h=800&auto=format&fit=crop", alt: "Rail of shirts in store" },
  { src: "https://images.unsplash.com/photo-1521341957697-b93449760f30?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing layered casual outfit" },
  { src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing formal suit and tie" },
  { src: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing jacket and scarf" },
  { src: "https://images.unsplash.com/photo-1507680434567-5739c80be1ac?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing button-up shirt" },
  { src: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing casual shirt outfit" },
  { src: "https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=600&h=800&auto=format&fit=crop", alt: "Model wearing coat over shirt" },
];

function Home() {

  const { products, error, loading, fetchProducts } = useProduct();
  const { user } = useSelector(selectAuth);
  const firstName = String(user?.fullname || user?.name || "").trim().split(/\s+/)[0];
  const [paused, setPaused] = useState(false);
  const [hoverSlow, setHoverSlow] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const trackRef = useRef(null);
  const motionRef = useRef({ offset: 0, speed: 0 });
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts])
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event) => setReducedMotion(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  useEffect(() => {
    if (reducedMotion) {
      if (trackRef.current) trackRef.current.style.transform = "";
      return undefined;
    }
    let frame = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const motion = motionRef.current;
      const target = paused ? 0 : hoverSlow ? 22 : 110;
      motion.speed += (target - motion.speed) * Math.min(1, dt * 3);
      const track = trackRef.current;
      if (track && Math.abs(motion.speed) > 0.05) {
        const half = track.scrollWidth / 2;
        if (half > 0) {
          motion.offset = (motion.offset + motion.speed * dt) % half;
          track.style.transform = `translateX(${-motion.offset}px)`;
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, hoverSlow, reducedMotion]);
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <section aria-labelledby="hero-heading" className="relative min-h-[600px] overflow-hidden border-b border-neutral-200 bg-neutral-950 text-white sm:min-h-[680px] lg:min-h-[720px]">
          <div className="relative z-20 mx-auto w-full max-w-[1400px] px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
            <div className="hero-anim max-w-2xl">
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
                  viewTransition
                  className="inline-flex min-h-11 items-center justify-center border border-white/40 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Bestsellers
                </Link>
              </div>
            </div>
          </div>
          <div
            className="absolute inset-0 overflow-hidden"
            aria-label="Featured outfits showcase"
            onMouseEnter={() => setHoverSlow(true)}
            onMouseLeave={() => setHoverSlow(false)}
          >
            <div ref={trackRef} className="flex h-full w-max will-change-transform">
              {[...HERO_IMAGES, ...HERO_IMAGES].map((img, i) => (
                <img
                  key={`${img.src}-${i}`}
                  src={img.src}
                  alt={i < HERO_IMAGES.length ? img.alt : ""}
                  aria-hidden={i >= HERO_IMAGES.length}
                  loading={i < 4 ? "eager" : "lazy"}
                  draggable={false}
                  className="mr-4 aspect-[3/4] h-full w-auto shrink-0 select-none object-cover object-top"
                />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-neutral-950/30" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-neutral-950 to-transparent" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-neutral-950 to-transparent sm:w-28" aria-hidden="true" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-neutral-950 to-transparent sm:w-28" aria-hidden="true" />
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play outfits showcase" : "Pause outfits showcase"}
              aria-pressed={paused}
              className="absolute bottom-4 right-4 z-30 inline-flex min-h-11 min-w-11 items-center justify-center border border-white/40 text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <span aria-hidden="true">{paused ? "▶" : "❚❚"}</span>
            </button>
          </div>
        </section>

        <section aria-label="Shop by category" className="border-b border-neutral-200 bg-white">
          <nav aria-label="Categories" className="mx-auto w-full max-w-[1400px] px-5 py-6 sm:px-8">
            <ul className="flex flex-wrap gap-2.5">
              {CATEGORIES.map((item, i) => (
                <li key={item.label} className="hero-chip" style={{ animationDelay: `${i * 60}ms` }}>
                  <Link
                    to={`/search?q=${encodeURIComponent(item.query)}`}
                    viewTransition
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
