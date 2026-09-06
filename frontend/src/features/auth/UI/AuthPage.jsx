import { useNavigate } from "react-router-dom";
import Signin from "./Signin";
import Signup from "./Signup";
import StoreHeader from "./StoreHeader";
import StoreFooter from "./StoreFooter";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M15.68 8.18c0-.55-.05-1.09-.14-1.61H8V9.4h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.59c1.51-1.4 2.39-3.45 2.39-5.64Z"
      />
      <path
        fill="#34A853"
        d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.59-2c-.72.48-1.64.77-2.7.77-2.08 0-3.84-1.4-4.47-3.3H.87v2.08A8 8 0 0 0 8 16Z"
      />
      <path
        fill="#FBBC05"
        d="M3.53 9.53a4.8 4.8 0 0 1 0-3.06V4.39H.87a8 8 0 0 0 0 7.22l2.66-2.08Z"
      />
      <path
        fill="#EA4335"
        d="M8 3.17c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .87 4.39l2.66 2.08C4.16 4.57 5.92 3.17 8 3.17Z"
      />
    </svg>
  );
}

export default function AuthPage({ initialMode = "signin" }) {
  const navigate = useNavigate();
  const mode = initialMode === "signup" ? "signup" : "signin";
  const goTo = (next) =>
    navigate(next === "signup" ? "/signup" : "/signin");

  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <StoreHeader />

      <main className="grid flex-1 grid-cols-1 lg:grid-cols-[1.1fr_1fr]">
        {/* Editorial panel */}
        <aside className="relative h-64 overflow-hidden bg-neutral-900 sm:h-80 lg:h-auto">
          <img
            src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1400&auto=format&fit=crop"
            alt="Snitch FW26 menswear editorial"
            className="absolute inset-0 h-full w-full object-cover object-top grayscale"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-7 py-6 text-[11px] font-medium uppercase tracking-[0.22em] text-white/70 sm:px-10">
            <span>Snitch Man</span>
            <span>FW26 — Drop 02</span>
          </div>
          <div className="absolute inset-x-0 bottom-0 px-7 pb-8 sm:px-10 sm:pb-10">
            <p className="max-w-sm font-serif text-4xl font-light leading-[1.08] tracking-tight text-white xl:text-5xl">
              Dress like you mean it.
            </p>
            <p className="mt-3 max-w-xs text-[13px] leading-6 text-white/70">
              Members take an extra 10% off their first order. Code{" "}
              <span className="font-semibold tracking-[0.14em] text-white">
                SNITCH200
              </span>
            </p>
          </div>
        </aside>

        {/* Form column */}
        <section className="flex min-w-0 justify-center px-5 py-12 sm:py-16">
          <div className="w-full" style={{ maxWidth: 380 }}>
            <div
              role="tablist"
              aria-label="Authentication"
              className="flex gap-8 border-b border-neutral-200"
            >
              {[
                { id: "signin", label: "Sign In" },
                { id: "signup", label: "Register" },
              ].map((t) => {
                const active = mode === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => goTo(t.id)}
                    className={`cursor-pointer pb-3 text-[12px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                      active
                        ? "border-b-2 border-black text-black"
                        : "border-b-2 border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <h1 className="mt-8 font-serif text-[34px] font-light leading-tight tracking-tight">
              {mode === "signin" ? "Welcome back." : "Create an account."}
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-neutral-500">
              {mode === "signin"
                ? "Sign in for faster checkout, order tracking and your wishlist."
                : "One account for orders, wishlist and members-only prices."}
            </p>

            {mode === "signin" ? (
              <Signin onSwitch={() => goTo("signup")} />
            ) : (
              <Signup onSwitch={() => goTo("signin")} />
            )}

            <div className="my-7 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              <span className="h-px flex-1 bg-neutral-200" />
              or
              <span className="h-px flex-1 bg-neutral-200" />
            </div>

            <a
              href="/api/auth/google"
              className="flex h-12 w-full items-center justify-center gap-2.5 border border-neutral-300 text-[12px] font-semibold uppercase tracking-[0.16em] transition-colors hover:border-black"
            >
              <GoogleIcon />
              Continue with Google
            </a>

            <p className="mt-7 text-[12px] leading-5 text-neutral-400">
              By continuing you agree to our{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline underline-offset-2 hover:text-black"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="underline underline-offset-2 hover:text-black"
              >
                Privacy Policy
              </a>
              .
            </p>

            <p className="mt-8 border-t border-neutral-200 pt-5 text-[11px] font-medium uppercase leading-6 tracking-[0.16em] text-neutral-400">
              Free shipping over ₹999
              <br />
              7-day easy returns
            </p>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  );
}
