const dead = (e) => e.preventDefault();

const NAV = [
  "New Arrivals",
  "Bestsellers",
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Cargos",
  "Sale",
];

function IconSearch() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" strokeLinecap="round" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 20.5C7 16.5 3 13.2 3 9.3 3 6.4 5.2 4.5 7.7 4.5c1.7 0 3.3.9 4.3 2.4 1-1.5 2.6-2.4 4.3-2.4 2.5 0 4.7 1.9 4.7 4.8 0 3.9-4 7.2-9 11.2Z" strokeLinejoin="round" />
    </svg>
  );
}

function IconBag() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" strokeLinejoin="round" />
      <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" strokeLinecap="round" />
    </svg>
  );
}

export default function StoreHeader() {
  return (
    <div className="shrink-0 bg-white">
      {/* Announcement bar */}
      <div className="bg-black px-4 py-2 text-center text-[11px] font-medium uppercase tracking-[0.18em] text-white">
        Flat ₹200 off over ₹1,499&ensp;·&ensp;Code: SNITCH200&ensp;·&ensp;Free shipping
      </div>

      {/* Main header */}
      <header className="border-b border-neutral-200">
        <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
          {/* Left: mobile menu stub + logo */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={dead}
              className="flex flex-col gap-1 py-2 lg:hidden"
            >
              <span className="block h-px w-5 bg-black" />
              <span className="block h-px w-5 bg-black" />
              <span className="block h-px w-3.5 bg-black" />
            </button>
            <a
              href="#"
              onClick={dead}
              className="text-lg font-bold uppercase tracking-[0.3em]"
            >
              Snitch
            </a>
          </div>

          {/* Center: category nav */}
          <nav aria-label="Categories" className="hidden items-center gap-7 lg:flex">
            {NAV.map((item) => (
              <a
                key={item}
                href="#"
                onClick={dead}
                className={`text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-black ${
                  item === "Sale" ? "text-red-600" : "text-neutral-600"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Right: icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              aria-label="Search"
              onClick={dead}
              className="hidden p-2 text-neutral-800 hover:text-black sm:block"
            >
              <IconSearch />
            </button>
            <button
              type="button"
              aria-label="Account"
              aria-current="page"
              className="border-b-2 border-black p-2 text-black"
            >
              <IconUser />
            </button>
            <button
              type="button"
              aria-label="Wishlist"
              onClick={dead}
              className="p-2 text-neutral-800 hover:text-black"
            >
              <IconHeart />
            </button>
            <button
              type="button"
              aria-label="Shopping bag, 0 items"
              onClick={dead}
              className="relative p-2 text-neutral-800 hover:text-black"
            >
              <IconBag />
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center bg-black px-1 text-[10px] font-semibold text-white">
                0
              </span>
            </button>
          </div>
        </div>

        {/* Mobile category strip */}
        <nav
          aria-label="Categories"
          className="flex gap-6 overflow-x-auto border-t border-neutral-100 px-5 py-2.5 lg:hidden"
        >
          {NAV.map((item) => (
            <a
              key={item}
              href="#"
              onClick={dead}
              className={`whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.14em] ${
                item === "Sale" ? "text-red-600" : "text-neutral-600"
              }`}
            >
              {item}
            </a>
          ))}
        </nav>
      </header>
    </div>
  );
}
