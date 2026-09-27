import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectAuth, logout } from "../features/redux/auth.slice";
import { selectCartCount } from "../features/redux/cart.slice";
import { logout as logoutRequest } from "../features/auth/services/auth.api";
import { searchProducts } from "../features/product/services/product.api";
import {
  clearWishlist,
  fetchWishlist,
  selectWishlistCount,
} from "../features/redux/wishlist.slice";

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getInitials(name) {
  return String(name || "Guest")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const SEARCH_CATEGORIES = [
  "New Arrivals",
  "Bestsellers",
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Cargos",
  "Hoodies",
  "Sale",
];

const RECENT_KEY = "snitch:recent-searches";

function readRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}

export default function Navbar({ onSearch = null }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const accountMenuRef = useRef(null);
  const searchWrapRef = useRef(null);
  const { user } = useSelector(selectAuth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector(selectWishlistCount);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestionProducts, setSuggestionProducts] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => readRecentSearches());
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const isAuthenticated = Boolean(user);
  const displayName = user?.fullname || user?.name || "Guest account";
  const displayEmail = user?.email || "Sign in to manage your account";

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch, user?.id]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) setAccountOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setAccountOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const saveRecentSearch = (query) => {
    const clean = String(query || "").trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable (private mode) — suggestions still work for this session
      }
      return next;
    });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    // Reset suggestion state in the event handler (not the effect) so short
    // queries clear stale results without a cascading render.
    if (value.trim().length < 2) {
      setSuggestionProducts([]);
      setSuggestionsLoading(false);
      setActiveSuggestion(-1);
    }
  };

  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) return undefined;

    // All state updates happen inside the debounced callback (async system
    // boundary), keeping the effect body free of synchronous setState.
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await searchProducts(query, controller.signal);
        clearTimeout(timeout);
        const items = Array.isArray(response?.data) ? response.data.slice(0, 5) : [];
        setSuggestionProducts(items);
      } catch {
        setSuggestionProducts([]);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (!searchWrapRef.current?.contains(event.target)) setSearchFocused(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const matchingCategories = searchQuery.trim()
    ? SEARCH_CATEGORIES.filter((c) =>
        c.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ).slice(0, 4)
    : [];
  const visibleRecents =
    recentSearches.length > 0
      ? recentSearches
          .filter((s) =>
            searchQuery.trim()
              ? s.toLowerCase().includes(searchQuery.trim().toLowerCase())
              : true
          )
          .slice(0, 5)
      : [];
  const showDropdown =
    searchFocused &&
    (matchingCategories.length > 0 ||
      suggestionProducts.length > 0 ||
      suggestionsLoading ||
      visibleRecents.length > 0);

  const goToSearch = (query) => {
    const clean = String(query || "").trim();
    saveRecentSearch(clean);
    setSearchFocused(false);
    setActiveSuggestion(-1);
    if (onSearch) {
      onSearch(clean);
      return;
    }
    navigate(clean ? `/search?q=${encodeURIComponent(clean)}` : "/");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (activeSuggestion >= 0 && suggestionProducts[activeSuggestion]) {
      const product = suggestionProducts[activeSuggestion];
      saveRecentSearch(product.title);
      setSearchFocused(false);
      navigate(`/product/${product._id}`);
      return;
    }
    goToSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSuggestionProducts([]);
    if (onSearch) {
      onSearch("");
      return;
    }
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } finally {
      dispatch(logout());
      dispatch(clearWishlist());
      setAccountOpen(false);
      navigate("/signin");
    }
  };

  const closeAccountMenu = () => setAccountOpen(false);
  const menuLinkClass = "flex min-h-11 items-center justify-between px-4 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 hover:text-black focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-8">
        <Link
          to="/"
          className="shrink-0 text-base font-bold uppercase tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-black sm:text-xl sm:tracking-[0.24em]"
        >
          Snitch
        </Link>

        <div ref={searchWrapRef} className="relative mx-1 min-w-0 max-w-lg flex-1 sm:mx-2">
          <form onSubmit={handleSearchSubmit} role="search">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 sm:left-3.5">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => handleSearchChange(event.target.value)}
              onFocus={() => {
                setSearchFocused(true);
                setRecentSearches(readRecentSearches());
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" && suggestionProducts.length > 0) {
                  event.preventDefault();
                  setActiveSuggestion((prev) =>
                    prev < suggestionProducts.length - 1 ? prev + 1 : 0
                  );
                } else if (event.key === "ArrowUp" && suggestionProducts.length > 0) {
                  event.preventDefault();
                  setActiveSuggestion((prev) =>
                    prev > 0 ? prev - 1 : suggestionProducts.length - 1
                  );
                } else if (event.key === "Escape") {
                  setSearchFocused(false);
                  setActiveSuggestion(-1);
                }
              }}
              placeholder="Search shirts, oversized, cargos..."
              aria-label="Search products"
              aria-expanded={showDropdown}
              aria-controls="search-suggestions"
              aria-activedescendant={
                activeSuggestion >= 0 ? `search-option-${activeSuggestion}` : undefined
              }
              role="combobox"
              aria-autocomplete="list"
              autoComplete="off"
              className="h-9 w-full min-w-0 border border-neutral-200 bg-neutral-50 pl-8 pr-8 text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-black focus:bg-white focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:pl-10"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-neutral-400 hover:text-black"
                aria-label="Clear search"
              >
                <CloseIcon />
              </button>
            )}
          </form>

          {showDropdown && (
            <div
              id="search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70dvh] overflow-y-auto border border-neutral-200 bg-white shadow-xl"
            >
              {suggestionsLoading && (
                <p role="status" className="px-4 py-3 text-xs text-neutral-500">
                  Searching…
                </p>
              )}

              {!suggestionsLoading && matchingCategories.length > 0 && (
                <div className="border-b border-neutral-100 px-2 py-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Categories
                  </p>
                  <ul>
                    {matchingCategories.map((category) => (
                      <li key={category}>
                        <button
                          type="button"
                          role="option"
                          aria-selected="false"
                          onClick={() => {
                            setSearchQuery(category);
                            goToSearch(category);
                          }}
                          className="flex min-h-11 w-full items-center gap-2 px-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black"
                        >
                          <span className="text-neutral-400"><SearchIcon /></span>
                          <span>{category}</span>
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-neutral-400">Category</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!suggestionsLoading && suggestionProducts.length > 0 && (
                <div className="border-b border-neutral-100 px-2 py-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Products
                  </p>
                  <ul>
                    {suggestionProducts.map((product, idx) => (
                      <li key={product._id || idx}>
                        <button
                          type="button"
                          id={`search-option-${idx}`}
                          role="option"
                          aria-selected={idx === activeSuggestion}
                          onClick={() => {
                            saveRecentSearch(product.title);
                            setSearchFocused(false);
                            navigate(`/product/${product._id}`);
                          }}
                          onMouseEnter={() => setActiveSuggestion(idx)}
                          className={`flex min-h-11 w-full items-center gap-3 px-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-black ${
                            idx === activeSuggestion ? "bg-neutral-100 text-black" : "text-neutral-800 hover:bg-neutral-50"
                          }`}
                        >
                          <span className="h-9 w-7 shrink-0 overflow-hidden border border-neutral-200 bg-neutral-100">
                            {product.images?.[0]?.url ? (
                              <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </span>
                          <span className="min-w-0 flex-1 truncate">{product.title}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!suggestionsLoading &&
                matchingCategories.length === 0 &&
                suggestionProducts.length === 0 &&
                searchQuery.trim().length >= 2 && (
                  <p className="px-4 py-3 text-xs text-neutral-500">
                    No quick matches — press Enter to search anyway.
                  </p>
                )}

              {visibleRecents.length > 0 && (
                <div className="px-2 py-2">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
                    Recent searches
                  </p>
                  <ul className="flex flex-wrap gap-1.5 px-2 py-1">
                    {visibleRecents.map((recent) => (
                      <li key={recent}>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery(recent);
                            goToSearch(recent);
                          }}
                          className="inline-flex min-h-9 items-center border border-neutral-200 bg-neutral-50 px-2.5 text-xs text-neutral-700 hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                        >
                          {recent}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <Link
            to="/wishlist"
            aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ""}`}
            className="relative flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:w-10"
          >
            <HeartIcon />
            {wishlistCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center bg-black px-1 text-[8px] font-bold text-white sm:right-1 sm:top-1 sm:h-4 sm:min-w-4 sm:text-[9px]">{wishlistCount}</span>}
          </Link>

          <Link
            to="/cart"
            aria-label={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
            className="relative flex h-9 w-9 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:w-10"
          >
            <CartIcon />
            {cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center bg-black px-1 text-[8px] font-bold text-white sm:right-1 sm:top-1 sm:h-4 sm:min-w-4 sm:text-[9px]">{cartCount}</span>}
          </Link>

          <div ref={accountMenuRef} className="relative ml-0.5 sm:ml-1">
            <button
              type="button"
              onClick={() => setAccountOpen((open) => !open)}
              aria-label="Open account menu"
              aria-haspopup="true"
              aria-expanded={accountOpen}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-neutral-300 bg-neutral-100 text-xs font-semibold text-neutral-700 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black sm:h-10 sm:w-10"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                getInitials(displayName)
              )}
            </button>

            {accountOpen && (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(19rem,calc(100vw-1.5rem))] border border-neutral-200 bg-white shadow-xl">
                <div className="border-b border-neutral-200 px-4 py-4">
                  <p className="text-sm font-semibold text-neutral-900">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs text-neutral-500">{displayEmail}</p>
                </div>
                {isAuthenticated ? (
                  <nav aria-label="Account menu" className="py-1">
                    <Link to="/profile" onClick={closeAccountMenu} className={menuLinkClass}>Profile</Link>
                    <Link to="/orders" onClick={closeAccountMenu} className={menuLinkClass}>Orders</Link>
                    <Link to="/wishlist" onClick={closeAccountMenu} className={menuLinkClass}>
                      <span>Wishlist</span><span className="text-xs tabular-nums text-neutral-500">{wishlistCount}</span>
                    </Link>
                    <Link to="/profile#saved-addresses" onClick={closeAccountMenu} className={menuLinkClass}>Delivery addresses</Link>
                    <Link to="/profile#account-settings" onClick={closeAccountMenu} className={menuLinkClass}>Settings</Link>
                  </nav>
                ) : (
                  <div className="grid gap-2 p-3">
                    <Link to="/signin" onClick={closeAccountMenu} className="flex min-h-11 items-center justify-center bg-black px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white hover:bg-neutral-800">Sign in</Link>
                    <Link to="/signup" onClick={closeAccountMenu} className="flex min-h-11 items-center justify-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 hover:border-black">Create account</Link>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="border-t border-neutral-200 p-3">
                    <button type="button" onClick={handleLogout} className="min-h-10 w-full px-3 text-left text-sm text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-black focus-visible:outline-2 focus-visible:outline-black">Sign out</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

);
}
