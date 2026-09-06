const dead = (e) => e.preventDefault();

function IconTruck() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M2 5h12v11H2zM14 9h4l4 4v3h-8" strokeLinejoin="round" />
      <circle cx="6.5" cy="18.5" r="1.8" />
      <circle cx="17.5" cy="18.5" r="1.8" />
    </svg>
  );
}

function IconCash() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M5.5 9.5h.01M18.5 14.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function IconReturn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7" strokeLinecap="round" />
      <path d="M3 4v5h5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}

const PERKS = [
  { icon: <IconTruck />, title: "Free shipping", sub: "On orders over ₹999" },
  { icon: <IconCash />, title: "COD available", sub: "Pay at your doorstep" },
  { icon: <IconReturn />, title: "7-day returns", sub: "No questions asked" },
  { icon: <IconLock />, title: "Secure payments", sub: "UPI · Cards · Netbanking" },
];

const COLUMNS = [
  {
    head: "Shop",
    links: ["New Arrivals", "Bestsellers", "Shirts", "T-Shirts", "Jeans", "Sale"],
  },
  {
    head: "Help",
    links: ["Track Order", "Shipping & Delivery", "Returns & Exchange", "Size Guide", "Contact Us"],
  },
  {
    head: "Company",
    links: ["Our Story", "Stores", "Careers", "Terms of Service", "Privacy Policy"],
  },
];

export default function StoreFooter() {
  return (
    <footer className="shrink-0 border-t border-neutral-200 bg-white">
      {/* Perks */}
      <div className="grid grid-cols-2 gap-6 border-b border-neutral-200 px-5 py-7 sm:px-8 lg:grid-cols-4">
        {PERKS.map((p) => (
          <div key={p.title} className="flex items-start gap-3">
            <span className="text-neutral-800">{p.icon}</span>
            <div>
              <p className="text-[13px] font-medium uppercase tracking-[0.1em]">{p.title}</p>
              <p className="mt-0.5 text-[13px] text-neutral-500">{p.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Links + newsletter */}
      <div className="grid gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1fr_1fr_1fr_1.3fr]">
        {COLUMNS.map((col) => (
          <div key={col.head}>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
              {col.head}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    onClick={dead}
                    className="text-[14px] text-neutral-700 hover:text-black hover:underline hover:underline-offset-4"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Get ₹200 off your first order
          </p>
          <p className="mt-4 text-[14px] leading-6 text-neutral-600">
            Drops, restocks and members-only prices. One email a week, no spam.
          </p>
          <form onSubmit={dead} className="mt-4 flex">
            <label htmlFor="newsletter-email" className="sr-only">
              Email for newsletter
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="Email address"
              className="h-11 w-full border border-r-0 border-neutral-300 px-3 text-[14px] outline-none placeholder:text-neutral-400 focus:border-black"
            />
            <button
              type="submit"
              className="h-11 shrink-0 bg-black px-5 text-[12px] font-medium uppercase tracking-[0.16em] text-white hover:bg-neutral-800"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-neutral-200 px-5 py-5 text-[12px] text-neutral-500 sm:flex-row sm:px-8">
        <p>© 2026 Snitch. All rights reserved.</p>
        <div className="flex items-center gap-2" aria-label="Accepted payments">
          {["VISA", "MC", "UPI", "COD"].map((p) => (
            <span
              key={p}
              className="border border-neutral-200 px-2 py-1 text-[10px] font-semibold tracking-wider text-neutral-500"
            >
              {p}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
