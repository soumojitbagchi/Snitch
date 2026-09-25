import { Link } from "react-router-dom";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-sm text-neutral-700 transition-colors hover:text-black hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black sm:min-h-9";

export default function StoreFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-neutral-200 bg-white">
      <div className="mx-auto flex min-h-16 w-full max-w-[1400px] flex-col items-center justify-center gap-1 px-5 py-3 text-xs text-neutral-600 sm:flex-row sm:justify-between sm:gap-6 sm:px-8">
        <p>© {currentYear} Snitch</p>
        <nav aria-label="Authentication footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-0">
            <li>
              <Link to="/" className={footerLinkClass}>
                Back to shop
              </Link>
            </li>
            <li>
              <Link to="/contact" className={footerLinkClass}>
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
