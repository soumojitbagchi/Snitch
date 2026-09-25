import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ProductLandingFooter from "./ProductLandingFooter";

const storefrontFeatures = [
  {
    number: "01",
    title: "Browse without friction",
    description: "Search the catalog, compare the available pieces, and sort products by price when you need a quicker path.",
  },
  {
    number: "02",
    title: "Save what stands out",
    description: "Keep products in your wishlist or cart so the pieces you want remain easy to return to.",
  },
  {
    number: "03",
    title: "Keep purchases together",
    description: "Use your account to review orders and keep the profile details connected to your shopping experience current.",
  },
];

export default function AboutPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About | Snitch";
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className="mx-auto w-full max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24 lg:py-28">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
              About Snitch
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
              Menswear, simplified.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              Everyday pieces should be easy to discover and easy to return to. Snitch brings browsing, saving, checkout, and account tools into one straightforward storefront.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex min-h-11 items-center justify-center bg-black px-6 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              Shop all
            </Link>
          </div>
        </section>

        <section aria-labelledby="storefront-experience-heading" className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
          <div className="grid gap-8 border-b border-neutral-200 pb-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 lg:pb-14">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                The storefront
              </p>
              <h2 id="storefront-experience-heading" className="mt-4 max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
                Built around the pieces you wear on repeat.
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-neutral-600">
              The experience stays focused on the essentials: finding products, keeping track of favourites, completing a purchase, and returning to the information connected to your account.
            </p>
          </div>

          <div className="grid gap-0 divide-y divide-neutral-200 md:grid-cols-3 md:divide-x md:divide-y-0">
            {storefrontFeatures.map((feature) => (
              <article key={feature.number} className="py-8 md:px-8 md:py-10 md:first:pl-0 md:last:pr-0">
                <p className="text-xs font-semibold tabular-nums text-neutral-400">{feature.number}</p>
                <h2 className="mt-5 text-lg font-semibold tracking-tight">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <ProductLandingFooter />
    </div>
  );
}
