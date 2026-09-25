import { useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import ProductLandingFooter from "./ProductLandingFooter";

const accountTools = [
  {
    title: "Order history",
    description: "Review your purchases and the order information already connected to your account.",
    action: "View orders",
    to: "/orders",
  },
  {
    title: "Profile details",
    description: "Keep your name, contact information, and saved delivery details current in one place.",
    action: "Manage profile",
    to: "/profile",
  },
];

export default function ContactPage() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Contact | Snitch";
    window.scrollTo(0, 0);
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-neutral-200">
          <div className="mx-auto grid w-full max-w-[1400px] gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20 lg:py-28">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
                Help &amp; contact
              </p>
              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl">
                Help with orders and account details.
              </h1>
            </div>
            <p className="max-w-xl text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
              Snitch currently provides self-service help through the account tools below. Choose the area that matches what you need; protected tools may ask you to sign in first.
            </p>
          </div>
        </section>

        <section aria-labelledby="account-help-heading" className="mx-auto w-full max-w-[1400px] px-5 py-14 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Available now
            </p>
            <h2 id="account-help-heading" className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
              Start with your account
            </h2>
            <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-base sm:leading-7">
              These destinations use the information already available in the storefront. No message form or external contact channel is currently connected.
            </p>
          </div>

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {accountTools.map((tool) => (
              <article key={tool.to} className="flex min-h-64 flex-col border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight">{tool.title}</h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-neutral-600">{tool.description}</p>
                <Link
                  to={tool.to}
                  className="mt-auto inline-flex min-h-11 w-fit items-center pt-8 text-sm font-semibold underline decoration-neutral-400 underline-offset-4 transition-colors hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
                >
                  {tool.action}
                </Link>
              </article>
            ))}
          </div>

          <section aria-labelledby="account-access-heading" className="mt-5 grid gap-6 bg-neutral-950 px-6 py-8 text-white sm:px-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 id="account-access-heading" className="text-lg font-semibold">
                Need account access?
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-300">
                Sign in before opening protected account tools, or create an account if you are new to Snitch.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/signin"
                className="inline-flex min-h-11 items-center justify-center bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-neutral-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="inline-flex min-h-11 items-center justify-center border border-neutral-600 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Create account
              </Link>
            </div>
          </section>
        </section>
      </main>

      <ProductLandingFooter />
    </div>
  );
}
