import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAuth, logout } from "../features/redux/auth.slice";

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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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

function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export default function Navbar({ onSearch = null }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector(selectAuth);

  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const isAuthenticated = Boolean(token || localStorage.getItem("token"));
  const displayName = user?.fullname || user?.name || (isAuthenticated ? "Aarav Sharma" : "Guest Member");
  const displayEmail = user?.email || (isAuthenticated ? "aarav.sharma@example.com" : "Sign in to access orders");
  const userRole = user?.role || "buyer";

  const [formName, setFormName] = useState(displayName);
  const [formPhone, setFormPhone] = useState("+91 98765 43210");
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && profileOpen) {
        setProfileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profileOpen]);

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("token");
    setProfileOpen(false);
    navigate("/signin");
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2400);
  };

  const avatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop";

  return (
    <>
      <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden border-b border-neutral-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-8">
          <div className="flex shrink-0 items-center">
            <Link
              to="/"
              className="text-base font-bold uppercase tracking-[0.2em] text-neutral-900 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-black sm:text-xl sm:tracking-[0.24em]"
            >
              Snitch
            </Link>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mx-1 min-w-0 max-w-lg flex-1 sm:mx-2">
            <div className="relative flex min-w-0 items-center">
              <span className="pointer-events-none absolute left-2.5 text-neutral-400 sm:left-3.5">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search shirts, oversized, cargos..."
                className="h-9 w-full min-w-0 border border-neutral-200 bg-neutral-50 pl-8 pr-7 text-xs text-neutral-900 placeholder:text-neutral-400 transition-colors focus:border-black focus:bg-white focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:pl-10 sm:pr-8"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 text-neutral-400 hover:text-black"
                  aria-label="Clear search"
                >
                  <CloseIcon />
                </button>
              )}
            </div>
          </form>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
            <button
              type="button"
              aria-label="Wishlist"
              onClick={() => navigate("/")}
              className="flex h-8 w-8 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:w-10"
            >
              <HeartIcon />
            </button>

            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setProfileOpen(true)}
              className="relative hidden h-8 w-8 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black md:flex sm:h-10 sm:w-10"
            >
              <BellIcon />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-600" />
            </button>

            <Link
              to="/payment"
              aria-label="Shopping cart"
              className="relative flex h-8 w-8 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:w-10"
            >
              <CartIcon />
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center bg-black px-1 text-[8px] font-bold text-white sm:right-1 sm:top-1 sm:h-4 sm:min-w-4 sm:text-[9px]">
                2
              </span>
            </Link>

            <button
              type="button"
              aria-label="Account details"
              onClick={() => setProfileOpen(true)}
              className="flex h-8 w-8 items-center justify-center text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-black focus-visible:outline-2 focus-visible:outline-black sm:h-10 sm:w-10"
            >
              <UserIcon />
            </button>

            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile page interface"
              aria-expanded={profileOpen}
              className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-300 p-0.5 transition-all duration-150 hover:border-black hover:ring-2 hover:ring-black/10 focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 sm:ml-1 sm:h-10 sm:w-10"
            >
              <img
                src={avatarUrl}
                alt={displayName}
                className="h-full w-full rounded-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Account page interface"
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setProfileOpen(false)}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-12">
            <div className="flex h-full w-screen max-w-md flex-col justify-between border-l border-neutral-200 bg-white shadow-2xl sm:max-w-lg">
              <div className="overflow-y-auto">
                <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-6 sm:h-20">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-900">
                      Account Interface
                    </span>
                    <span className="flex items-center gap-1.5 border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-800">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Live Sync
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(false)}
                    aria-label="Close account interface"
                    className="flex h-10 w-10 items-center justify-center border border-neutral-200 text-neutral-600 transition-colors hover:border-black hover:text-black focus-visible:outline-2 focus-visible:outline-black"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="border-b border-neutral-200 bg-neutral-50 p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={avatarUrl}
                        alt={displayName}
                        className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm sm:h-18 sm:w-18"
                      />
                      <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-base font-bold text-neutral-900 sm:text-lg">
                          {displayName}
                        </h2>
                        <span className="border border-neutral-300 bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-800">
                          {userRole}
                        </span>
                      </div>
                      <p className="truncate text-xs text-neutral-500 mt-0.5">
                        {displayEmail}
                      </p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="bg-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                          Snitch VIP Elite
                        </span>
                        <span className="text-[11px] text-neutral-500">
                          #SN-89210
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex border-b border-neutral-200 px-6 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setActiveTab("overview")}
                    className={`border-b-2 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                      activeTab === "overview"
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("orders")}
                    className={`ml-5 border-b-2 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                      activeTab === "orders"
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    Orders (3)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("addresses")}
                    className={`ml-5 border-b-2 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                      activeTab === "addresses"
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    Addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("settings")}
                    className={`ml-5 border-b-2 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors whitespace-nowrap ${
                      activeTab === "settings"
                        ? "border-black text-black"
                        : "border-transparent text-neutral-400 hover:text-black"
                    }`}
                  >
                    Settings
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === "overview" && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="border border-neutral-200 p-3 bg-neutral-50/50">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                            Orders
                          </span>
                          <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                            4
                          </p>
                        </div>
                        <div className="border border-neutral-200 p-3 bg-neutral-50/50">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                            Wishlist
                          </span>
                          <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                            12
                          </p>
                        </div>
                        <div className="border border-neutral-200 p-3 bg-neutral-50/50">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                            Credits
                          </span>
                          <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                            ₹1,500
                          </p>
                        </div>
                        <div className="border border-neutral-200 p-3 bg-neutral-50/50">
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
                            Points
                          </span>
                          <p className="mt-1 text-lg font-bold tabular-nums text-neutral-900">
                            320
                          </p>
                        </div>
                      </div>

                      <div className="border border-neutral-200 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            Active Package Delivery
                          </span>
                          <span className="border border-neutral-300 bg-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                            Out for Delivery
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-neutral-900">
                          Oversized Heavyweight Tee · Washed Black
                        </p>
                        <p className="mt-0.5 text-[11px] text-neutral-500">
                          Tracking #SN-982410 · Arriving today by 7 PM
                        </p>
                        <div className="mt-3.5 grid grid-cols-4 gap-1.5">
                          <div className="h-1 bg-black" />
                          <div className="h-1 bg-black" />
                          <div className="h-1 bg-black" />
                          <div className="h-1 bg-neutral-200" />
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <Link
                          to="/seller"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between border border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:border-black hover:bg-neutral-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <ShieldIcon />
                            <span>Seller Studio Dashboard</span>
                          </div>
                          <ChevronRightIcon />
                        </Link>

                        <Link
                          to="/payment"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between border border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:border-black hover:bg-neutral-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <CartIcon />
                            <span>Checkout & Active Bag (2 items)</span>
                          </div>
                          <ChevronRightIcon />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setActiveTab("orders")}
                          className="flex w-full items-center justify-between border border-neutral-200 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 transition-colors hover:border-black hover:bg-neutral-50"
                        >
                          <div className="flex items-center gap-2.5">
                            <PackageIcon />
                            <span>View All Orders & History</span>
                          </div>
                          <ChevronRightIcon />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "orders" && (
                    <div className="space-y-3">
                      <div className="border border-neutral-200 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-900">#SN-982410</span>
                          <span className="border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                            Out for Delivery
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-700">
                          Oversized Heavyweight Tee (L) · ₹1,499
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Ordered on Sep 14, 2026 · Estimated delivery today
                        </p>
                      </div>

                      <div className="border border-neutral-200 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-900">#SN-829104</span>
                          <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                            Delivered
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-700">
                          Clean Oxford Shirt (M) · ₹1,299
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Delivered on Sep 12, 2026
                        </p>
                      </div>

                      <div className="border border-neutral-200 p-4">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-neutral-900">#SN-640192</span>
                          <span className="border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-800">
                            Delivered
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-neutral-700">
                          Slim-Fit Denim Jeans (32) · ₹1,999
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-400">
                          Delivered on Aug 28, 2026
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "addresses" && (
                    <div className="space-y-3">
                      <div className="border-2 border-black p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <MapPinIcon />
                            <span className="text-[10px] font-bold uppercase tracking-wider text-black">
                              Primary Delivery Address
                            </span>
                          </div>
                          <span className="bg-black px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                            Default
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-neutral-900">
                          {displayName}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-600 leading-relaxed">
                          402 Highline Heights, Linking Road, Bandra West
                          <br />
                          Mumbai, Maharashtra 400050
                          <br />
                          Phone: {formPhone}
                        </p>
                      </div>

                      <div className="border border-neutral-200 p-4">
                        <div className="flex items-center gap-1.5">
                          <MapPinIcon />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                            Work Studio
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-bold text-neutral-900">
                          {displayName}
                        </p>
                        <p className="mt-0.5 text-xs text-neutral-600 leading-relaxed">
                          Snitch Design Studio, 100 Feet Road, Indiranagar
                          <br />
                          Bengaluru, Karnataka 560038
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "settings" && (
                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      {saveSuccess && (
                        <div className="flex items-center gap-2 border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
                          <CheckIcon />
                          <span>Profile settings updated successfully.</span>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs text-neutral-900 focus:border-black focus-visible:outline-2 focus-visible:outline-black"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={displayEmail}
                          disabled
                          className="mt-1.5 h-10 w-full border border-neutral-200 bg-neutral-100 px-3 text-xs text-neutral-500 cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="mt-1.5 h-10 w-full border border-neutral-300 bg-white px-3 text-xs text-neutral-900 focus:border-black focus-visible:outline-2 focus-visible:outline-black"
                        />
                      </div>

                      <div className="pt-2">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs text-neutral-700">
                          <input
                            type="checkbox"
                            checked={smsAlerts}
                            onChange={(e) => setSmsAlerts(e.target.checked)}
                            className="h-4 w-4 border-neutral-300 text-black focus:ring-black"
                          />
                          <span>Receive delivery tracking notifications via SMS</span>
                        </label>
                      </div>

                      <button
                        type="submit"
                        className="mt-3 flex min-h-11 w-full items-center justify-center bg-black px-4 text-xs font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-black"
                      >
                        Save Preferences
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-200 p-6 bg-white">
                {isAuthenticated ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex min-h-12 w-full items-center justify-center gap-2 border border-black bg-white px-4 text-xs font-semibold uppercase tracking-[0.18em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-black"
                  >
                    <LogOutIcon />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    to="/signin"
                    onClick={() => setProfileOpen(false)}
                    className="flex min-h-12 w-full items-center justify-center bg-black px-4 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-black"
                  >
                    Sign In to Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
