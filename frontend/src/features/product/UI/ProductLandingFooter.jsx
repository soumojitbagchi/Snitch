import { Link } from "react-router-dom";

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <path d="M12 3 19 6v5c0 4.6-2.8 8-7 10-4.2-2-7-5.4-7-10V6l7-3Z" strokeLinejoin="round" />
      <path d="m8.8 12 2.1 2.1 4.5-4.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <rect x="2.5" y="6" width="19" height="12" rx="1" />
      <circle cx="12" cy="12" r="2.7" />
      <path d="M6 9.5h.01M18 14.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <path d="M4 11a8 8 0 1 0 2.4-5.7" strokeLinecap="round" />
      <path d="M4 4v7h7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const serviceHighlights = [
  {
    title: "Secure checkout",
    description: "Online payments through Razorpay",
    Icon: ShieldIcon,
  },
  {
    title: "Cash on delivery",
    description: "Pay when your parcel arrives",
    Icon: CashIcon,
  },
  {
    title: "7-day returns",
    description: "Eligible unworn items with tags intact",
    Icon: ReturnIcon,
  },
];

const linkGroups = [
  {
    id: "footer-shop-heading",
    title: "Shop",
    links: [
      { label: "Shop all", to: "/" },
      { label: "Cart", to: "/cart" },
      { label: "Wishlist", to: "/wishlist" },
    ],
  },
  {
    id: "footer-account-heading",
    title: "Account",
    links: [
      { label: "Sign in", to: "/signin" },
      { label: "Create account", to: "/signup" },
    ],
  },
];

const footerLinkClass =
  "inline-flex min-h-11 items-center text-sm text-neutral-700 transition-colors hover:text-black hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black lg:min-h-9";

export default function ProductLandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-8 shrink-0 border-t border-neutral-200 bg-white text-neutral-900">
      <section aria-labelledby="service-highlights-heading" className="border-b border-neutral-200 bg-neutral-50">
        <h2 id="service-highlights-heading" className="sr-only">
          Shopping benefits
        </h2>
        <div className="mx-auto grid w-full max-w-[1400px] divide-y divide-neutral-200 px-5 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-8">
          {serviceHighlights.map(({ title, description, Icon }) => (
            <div
              key={title}
              className="flex items-start gap-4 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="mt-0.5 shrink-0 text-neutral-800">
                <Icon />
              </span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
                  {title}
                </p>
                <p className="mt-1 text-sm leading-6 text-neutral-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto w-full max-w-[1400px] px-5 py-12 sm:px-8 sm:py-14">
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.85fr_1.2fr]">
          <section aria-labelledby="footer-about-heading">
            <h2
              id="footer-about-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500"
            >
              About
            </h2>
            <Link
              to="/"
              aria-label="Snitch home"
              className="mt-3 inline-flex min-h-11 items-center text-lg font-bold uppercase tracking-[0.24em] transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              Snitch
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-6 text-neutral-600">
              Menswear, simplified. Everyday pieces, made to be worn on repeat.
            </p>
            <Link to="/about" className={`${footerLinkClass} mt-2`}>
              About Snitch
            </Link>
          </section>

          {linkGroups.map((group) => (
            <nav key={group.id} aria-labelledby={group.id}>
              <h2
                id={group.id}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500"
              >
                {group.title}
              </h2>
              <ul className="mt-3 space-y-1">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <nav aria-labelledby="footer-help-heading">
            <h2
              id="footer-help-heading"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500"
            >
              Help &amp; contact
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-6 text-neutral-600">
              Need help with a purchase? Review your orders or keep your contact details current in your profile.
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-1 lg:block lg:space-y-1">
              <li>
                <Link to="/contact" className={footerLinkClass}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/orders" className={footerLinkClass}>
                  Orders
                </Link>
              </li>
              <li>
                <Link to="/profile" className={footerLinkClass}>
                  Profile
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto flex min-h-16 w-full max-w-[1400px] flex-col justify-center gap-2 px-5 py-4 text-xs text-neutral-600 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {currentYear} Snitch</p>
          <p className="uppercase tracking-[0.14em]">Menswear, simplified</p>
        </div>
      </div>
    </footer>
  );
}
