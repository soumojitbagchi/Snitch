import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { mockProducts } from "../../product/UI/mockProducts";
import { formatPrice } from "../../product/utils/product";
import { selectAuth } from "../../redux/auth.slice.jsx";
import useRazorpay from "../Hooks/useRazorpay";
import useCart from "../../cart/hooks/useCart";
import useCoupon from "../Hooks/useCoupon";
import useCurrency from "../Hooks/useCurrency";
import { convertCurrency } from "../service/currency.api";
import { SUPPORTED_CURRENCIES } from "../../product/utils/currency";
import { couponErrorMessage } from "../service/coupon.api";
import { createCodOrder } from "../service/payment.api";
import DeliveryEstimator from "./DeliveryEstimator";
import { COUNTRIES, countryName, getCodEligibility, getDeliveryEstimate, isValidPostal, normalizeCountry } from "./deliveryEstimate";
import ThemeToggle from "../../theme/ThemeToggle";

function LockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-black" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function CashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

export default function PaymentPage({
  order = null,
  externalPaymentProvider = null,
  onSuccess = null,
  onFailure = null,
}) {
  const defaultOrder = useMemo(() => {
    const item1 = mockProducts[0];
    const item2 = mockProducts[1];
    return {
      id: "SN-829104",
      items: [
        {
          id: item1?._id || "item-1",
          title: item1?.title || "Oversized Tee",
          size: item1?.variant?.[0]?.attributes?.size || "M",
          color: item1?.variant?.[0]?.attributes?.color || "Black",
          price: item1?.variant?.[0]?.price?.basePrice || 999,
          currency: item1?.variant?.[0]?.price?.currency || "INR",
          quantity: 1,
          image: item1?.images?.[0]?.url || "",
        },
        ...(item2
          ? [
              {
                id: item2._id,
                title: item2.title,
                size: item2.variant?.[0]?.attributes?.size || "32",
                color: item2.variant?.[0]?.attributes?.color || "Indigo",
                price: item2.variant?.[0]?.price?.basePrice || 1999,
                currency: item2.variant?.[0]?.price?.currency || "INR",
                quantity: 1,
                image: item2.images?.[0]?.url || "",
              },
            ]
          : []),
      ],
    };
  }, []);

  const activeOrder = order || defaultOrder;
  const { items: cartItems, total: cartTotal, currency: cartCurrency, changeCurrency } = useCart();
  const isCartCheckout = activeOrder.source === "cart";
  const displayItems = isCartCheckout ? cartItems : activeOrder.items;

  // Sticky-currency rule: explicit user choice > backend currency > locale
  // seed. The dropdown is the only writer; backend responses never move it.
  const { selectCurrency, resolveCurrency } = useCurrency();
  const itemsCurrency = displayItems[0]?.currency || "INR";
  const backendCurrency = isCartCheckout ? cartCurrency : itemsCurrency;
  const activeCurrency = resolveCurrency(backendCurrency);

  const { user } = useSelector(selectAuth);
  const savedAddresses = user?.addresses ?? [];
  const defaultAddress =
    savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0] ?? null;

  const [customer, setCustomer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    country: "IN",
  });

  // Prefill identity fields from the session once it hydrates; never
  // overwrite what the user has already typed.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing async session hydration into local form state
    setCustomer((prev) => ({
      ...prev,
      fullName: prev.fullName || user?.fullname || "",
      email: prev.email || user?.email || "",
      phone: prev.phone || user?.contact || "",
    }));
  }, [user?.fullname, user?.email, user?.contact]);

  const [useShipSaved, setUseShipSaved] = useState(true);
  const shippingSaved = Boolean(useShipSaved && defaultAddress);

  const formatSavedStreet = (address) =>
    [address?.line1, address?.line2].filter(Boolean).join(", ");

  // Single source of truth for the address the order will ship to.
  const shipTo = shippingSaved
    ? {
        fullName: defaultAddress.recipientName || user?.fullname || "",
        email: user?.email || "",
        phone: defaultAddress.phone || user?.contact || "",
        address: formatSavedStreet(defaultAddress),
        city: defaultAddress.city || "",
        pincode: defaultAddress.postalCode || "",
        country: normalizeCountry(defaultAddress.country),
      }
    : { ...customer, country: normalizeCountry(customer.country) };
  const shipPincode = shipTo.pincode || "";
  const shipCountry = shipTo.country || "IN";

  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [currencyUpdating, setCurrencyUpdating] = useState(false);
  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    appliedDiscount,
    validating: couponValidating,
    error: couponError,
    success: couponSuccess,
    applyCoupon,
    revalidateCoupon,
  } = useCoupon();
  const [localProcessing, setLocalProcessing] = useState(false);
  const [localResult, setLocalResult] = useState(null);
  const [localError, setLocalError] = useState("");

  const {
    initializePayment,
    loading: razorpayLoading,
    error: razorpayError,
    paymentResult: razorpayResult,
    resetPaymentState,
  } = useRazorpay();

  // Explicit user action is the only writer of display currency. On the
  // direct path the quote effect below converts; on the cart path the
  // backend rebuilds converted totals.
  const handleCurrencyChange = async (event) => {
    const currency = event.target.value;
    selectCurrency(currency);

    // Direct path converts in the quote effect below; flag loading here
    // (event handler, not effect body) so the dropdown disables meanwhile.
    if (!isCartCheckout) {
      setQuote(null);
      setCurrencyUpdating(true);
      return;
    }

    setCurrencyUpdating(true);
    try {
      await changeCurrency(currency);
    } catch (error) {
      setLocalError(error?.response?.data?.message || "Unable to update the payment currency.");
    } finally {
      setCurrencyUpdating(false);
    }
  };

  const subtotal = useMemo(() => {
    if (isCartCheckout) return cartTotal;

    return displayItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }, [cartTotal, displayItems, isCartCheckout]);

  // Direct-path conversion quote. Fires only when the displayed currency
  // differs from the items' native currency — i.e. after an explicit user
  // switch (initial state always matches, so no call on first paint).
  // Line items keep their native currency labels; only the summary converts.
  const [quote, setQuote] = useState(null);
  useEffect(() => {
    if (isCartCheckout) return undefined;
    if (!itemsCurrency || activeCurrency === itemsCurrency) return undefined;

    let cancelled = false;
    convertCurrency({ amount: subtotal, from: itemsCurrency, to: activeCurrency })
      .then((res) => {
        if (cancelled) return;
        if (res?.success) setQuote({ amount: res.data.converted, currency: res.data.to });
      })
      .catch((err) => {
        if (cancelled) return;
        setLocalError(err?.response?.data?.message || "Unable to convert currency.");
      })
      .finally(() => {
        if (!cancelled) setCurrencyUpdating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isCartCheckout, itemsCurrency, activeCurrency, subtotal]);

  const pricedSubtotal = quote ? quote.amount : subtotal;
  const displayCurrency = isCartCheckout
    ? cartCurrency
    : quote
      ? quote.currency
      : itemsCurrency;
  const { shippingAmount, freeShipping } = displayCurrency === "INR"
    ? { shippingAmount: Math.round(pricedSubtotal * 0.1), freeShipping: 1499 }
    : { shippingAmount: pricedSubtotal < 30 ? 10 : Math.round(pricedSubtotal * 0.33), freeShipping: 49 };

  const shipping = pricedSubtotal > freeShipping ? 0 : shippingAmount;
  const grandTotal = Math.max(0, pricedSubtotal + shipping - appliedDiscount);
  const deliveryEstimate = useMemo(
    () => getDeliveryEstimate(shipPincode, shipCountry),
    [shipPincode, shipCountry]
  );
  const codEligibility = useMemo(
    () =>
      getCodEligibility({
        pin: shipPincode,
        country: shipCountry,
        subtotal: grandTotal,
        currency: displayCurrency,
      }),
    [shipPincode, shipCountry, grandTotal, displayCurrency]
  );
  const codBlocked = Boolean(shipPincode.trim()) && !codEligibility.eligible &&
    isValidPostal(shipPincode, shipCountry);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    return applyCoupon({ subtotal: pricedSubtotal, currency: displayCurrency });
  };

  const handleInputChange = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePayment = async () => {
    setLocalError("");
    resetPaymentState();

    if (!shipTo.fullName.trim() || !shipTo.phone.trim() || !shipTo.email.trim()) {
      setLocalError("Please fill out your full name, email, and phone number.");
      return;
    }

    if (!shipTo.address.trim() || !shipTo.city.trim() || !shipTo.pincode.trim()) {
      setLocalError("Please provide your delivery address, city, and PIN / postal code.");
      return;
    }

    if (!isValidPostal(shipTo.pincode, shipCountry)) {
      setLocalError(`Enter a valid postal code for ${countryName(shipCountry)} before paying.`);
      return;
    }

    if (paymentMethod === "cod" && codBlocked) {
      setLocalError(codEligibility.reason);
      return;
    }

    if (externalPaymentProvider) {
      setLocalProcessing(true);
      try {
        const response = await externalPaymentProvider({
          order: activeOrder,
          amount: grandTotal,
          customer: shipTo,
          method: paymentMethod,
          currency: displayCurrency,
        });
        setLocalProcessing(false);
        setLocalResult(response);
        if (onSuccess) onSuccess(response);
        return;
      } catch (err) {
        setLocalProcessing(false);
        const errText = err?.message || "External payment provider error.";
        setLocalError(errText);
        if (onFailure) onFailure(err);
        return;
      }
    }

    if (paymentMethod === "cod") {
      setLocalProcessing(true);
      try {
        const response = await createCodOrder({
          source: isCartCheckout ? "cart" : "direct",
          items: displayItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity || 1,
          })),
          orderId: activeOrder.id,
          couponCode: appliedCoupon || undefined,
          shipping: {
            fullName: shipTo.fullName,
            phone: shipTo.phone,
            address: shipTo.address,
            city: shipTo.city,
            pincode: shipTo.pincode,
            country: shipCountry,
          },
        });
        setLocalProcessing(false);
        const codResult = {
          orderId: response.orderId || activeOrder.id,
          paymentId: response.paymentId,
          amount: response.amount ?? grandTotal,
          method: "Cash on Delivery",
          currency: response.currency || displayCurrency,
        };
        setLocalResult(codResult);
        if (onSuccess) onSuccess(codResult);
      } catch (err) {
        setLocalProcessing(false);
        const errText =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Could not place the COD order. Try again.";
        setLocalError(errText);
        if (onFailure) onFailure(err);
      }
      return;
    }

    // Re-validate against the live subtotal so the displayed discount
    // always matches what the backend will actually charge.
    const recheck = await revalidateCoupon({ subtotal: pricedSubtotal });
    if (!recheck.ok) {
      setLocalError(couponErrorMessage(recheck.error, "Coupon is no longer valid for this order."));
      return;
    }

    initializePayment({
      order: { ...activeOrder, couponCode: appliedCoupon || undefined },
      customer: {
        name: shipTo.fullName,
        email: shipTo.email,
        phone: shipTo.phone,
      },
      onSuccess: (res) => {
        if (onSuccess) onSuccess(res);
      },
      onFailure: (err) => {
        if (onFailure) onFailure(err);
      },
    });
  };

  const activeResult = localResult || razorpayResult;
  const isBusy = localProcessing || razorpayLoading;
  const displayError = localError || razorpayError;

  if (activeResult) {
    return (
      <div className="min-h-dvh bg-white text-neutral-900">
        <header className="border-b border-neutral-200">
          <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
            <Link to="/" className="text-lg font-bold uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-black">
              Snitch
            </Link>
            <div className="flex shrink-0 items-center gap-1 sm:gap-3">
              <span className="text-xs uppercase tracking-[0.16em] text-neutral-500">Order Confirmed</span>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[640px] px-5 py-12 text-center sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border border-neutral-200 bg-neutral-50">
            <CheckCircleIcon />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-600">
            Thank you for your order
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Payment Successful
          </h1>
          <p className="mt-3 text-sm text-neutral-600">
            We have sent an order confirmation and delivery updates to{" "}
            <strong className="text-neutral-900">{shipTo.email}</strong>.
          </p>

          <div className="mt-8 border border-neutral-200 bg-neutral-50 p-6 text-left text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-neutral-500 uppercase tracking-wider">Order ID</span>
                <p className="mt-1 font-semibold text-neutral-900">{activeResult.orderId}</p>
              </div>
              <div>
                <span className="text-neutral-500 uppercase tracking-wider">Payment Reference</span>
                <p className="mt-1 font-semibold text-neutral-900 break-all">{activeResult.paymentId}</p>
              </div>
              <div>
                <span className="text-neutral-500 uppercase tracking-wider">Amount Paid</span>
                <p className="mt-1 font-semibold text-neutral-900">
                  {formatPrice({ basePrice: activeResult.amount, currency: activeResult.currency || displayCurrency })}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 uppercase tracking-wider">Method</span>
                <p className="mt-1 font-semibold text-neutral-900">{activeResult.method || "Razorpay"}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/"
              className="inline-flex min-h-12 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-neutral-800"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="text-lg font-bold uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-black"
          >
            Snitch
          </Link>

          <div className="hidden items-center gap-2 text-xs uppercase tracking-[0.16em] sm:flex">
            <span className="text-neutral-400">1. Bag</span>
            <span className="text-neutral-300">/</span>
            <span className="text-neutral-400">2. Address</span>
            <span className="text-neutral-300">/</span>
            <span className="font-semibold text-black underline underline-offset-4">3. Payment</span>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-600">
              <LockIcon />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">256-Bit Encrypted</span>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <section className="lg:col-span-7">
            <div className="border-b border-neutral-200 pb-5">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Checkout Details
              </span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Payment & Shipping
              </h1>
            </div>

            {displayError && (
              <div
                role="alert"
                className="mt-6 border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800"
              >
                {displayError}
              </div>
            )}

            <div className="mt-8 space-y-6">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
                  1. Contact & Shipping Address
                </h2>

                {shippingSaved && (
                  <div className="mt-4 border border-neutral-300 bg-neutral-50 p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="inline-flex min-h-6 items-center border border-neutral-300 bg-white px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-neutral-700">
                          {defaultAddress.label || "Home"}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-neutral-900">{shipTo.fullName}</p>
                          <address className="mt-1 text-sm not-italic leading-6 text-neutral-600">
                            {shipTo.address}
                            <br />
                            {shipTo.city}{defaultAddress.state ? `, ${defaultAddress.state}` : ""} — {shipTo.pincode}
                            <br />
                            {countryName(shipCountry)}
                            <br />
                            Phone: {shipTo.phone || "—"}
                          </address>
                      </div>
                      <Link
                        to="/profile#saved-addresses"
                        className="inline-flex min-h-11 shrink-0 items-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                      >
                        Change
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUseShipSaved(false)}
                      className="mt-3 inline-flex min-h-11 items-center px-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 underline decoration-neutral-400 underline-offset-4 transition-colors hover:text-black hover:decoration-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                    >
                      Use a different address
                    </button>
                  </div>
                )}

                {!shippingSaved && defaultAddress && (
                  <button
                    type="button"
                    onClick={() => setUseShipSaved(true)}
                    className="mt-4 inline-flex min-h-11 items-center border border-neutral-300 px-4 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-900 transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Use saved address
                  </button>
                )}

                {!shippingSaved && (
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="full-name" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      Full Name *
                    </label>
                    <input
                      id="full-name"
                      type="text"
                      value={customer.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-phone" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      Phone Number *
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="contact-email" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      Email Address (for order tracking) *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={customer.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="delivery-address" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      Street Address *
                    </label>
                    <input
                      id="delivery-address"
                      type="text"
                      value={customer.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="city-input" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      City *
                    </label>
                    <input
                      id="city-input"
                      type="text"
                      value={customer.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="country-input" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      Country *
                    </label>
                    <select
                      id="country-input"
                      value={COUNTRIES.some((entry) => entry.code === normalizeCountry(customer.country)) ? normalizeCountry(customer.country) : "OTHER"}
                      onChange={(e) => handleInputChange("country", e.target.value)}
                      className="mt-1.5 min-h-11 w-full border border-neutral-300 bg-white px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    >
                      {COUNTRIES.map((entry) => (
                        <option key={entry.code} value={entry.code}>
                          {entry.name}
                        </option>
                      ))}
                      <option value="OTHER">Other country</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="pincode-input" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                      PIN / Postal code *
                    </label>
                    <input
                      id="pincode-input"
                      type="text"
                      value={customer.pincode}
                      onChange={(e) => handleInputChange("pincode", e.target.value)}
                      className="mt-1.5 h-10 w-full border border-neutral-300 px-3 text-xs text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                    />
                  </div>
                </div>
                )}
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
                  2. Delivery Estimate
                </h2>
                <div className="mt-4">
                  <DeliveryEstimator
                    key={shippingSaved ? `saved-${shipPincode}` : "manual"}
                    initialPin={shipPincode}
                    country={shipCountry}
                    onCountryChange={(code) => {
                      setUseShipSaved(false);
                      handleInputChange("country", code);
                    }}
                    subtotal={grandTotal}
                    currency={displayCurrency}
                    onChange={({ pin }) => {
                      if (shippingSaved && pin !== shipPincode) {
                        setUseShipSaved(false);
                      }
                      if (pin !== customer.pincode) handleInputChange("pincode", pin);
                    }}
                  />
                  {deliveryEstimate && (
                    <p role="status" className="mt-2 text-xs text-neutral-600">
                      Estimated delivery: <strong className="text-neutral-900">{deliveryEstimate.label}</strong>
                      {" "}· {deliveryEstimate.summary}.
                    </p>
                  )}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
                  3. Payment Currency
                </h2>

                <div className="mt-4 max-w-xs">
                  <label htmlFor="payment-currency" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                    Pay in
                  </label>
                  <select
                    id="payment-currency"
                    value={activeCurrency}
                    onChange={handleCurrencyChange}
                    disabled={currencyUpdating}
                    className="mt-1.5 min-h-11 w-full border border-neutral-300 bg-white px-3 text-xs font-semibold uppercase tracking-wider text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
                  >
                    {SUPPORTED_CURRENCIES.map((entry) => (
                      <option key={entry.code} value={entry.code}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
                  4. Select Payment Method
                </h2>
                <p className="mt-2 text-xs leading-5 text-neutral-600">
                  {codEligibility.eligible ? (
                    <span className="text-emerald-700">✓ {codEligibility.reason}</span>
                  ) : (
                    <span className="text-amber-800">• {codEligibility.reason}</span>
                  )}
                  {deliveryEstimate && (
                    <> Prepaid orders ship first and arrive {deliveryEstimate.label}.</>
                  )}
                </p>

                <div className="mt-4 space-y-3">
                  <label
                    className={`flex cursor-pointer items-start justify-between border p-4 transition-colors ${
                      paymentMethod === "razorpay"
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="razorpay"
                        checked={paymentMethod === "razorpay"}
                        onChange={() => setPaymentMethod("razorpay")}
                        className="mt-0.5 accent-black"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CreditCardIcon />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                            Razorpay Standard Checkout
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          UPI, Credit / Debit Cards, Netbanking, Cred & Wallets.
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5">
                      <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-600">UPI</span>
                      <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-600">Cards</span>
                      <span className="border border-neutral-200 bg-white px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-600">Netbanking</span>
                    </div>
                  </label>

                  <label
                    className={`flex items-start justify-between border p-4 transition-colors ${
                      codBlocked
                        ? "cursor-not-allowed border-neutral-200 bg-neutral-100 opacity-70"
                        : paymentMethod === "cod"
                          ? "cursor-pointer border-black bg-neutral-50"
                          : "cursor-pointer border-neutral-200 bg-white hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={paymentMethod === "cod"}
                        disabled={codBlocked}
                        onChange={() => setPaymentMethod("cod")}
                        aria-describedby="cod-eligibility"
                        className="mt-0.5 accent-black"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <CashIcon />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                            Cash on Delivery (COD)
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500">
                          Pay in cash or digital scan upon parcel arrival.
                        </p>
                        <p
                          id="cod-eligibility"
                          className={`mt-1.5 text-xs ${codEligibility.eligible ? "text-emerald-700" : "text-amber-800"}`}
                        >
                          {codBlocked ? `Not available: ${codEligibility.reason}` : codEligibility.reason}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={handlePayment}
                  className="flex min-h-13 w-full items-center justify-center bg-black px-6 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-black disabled:opacity-50"
                >
                  {isBusy ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      Connecting Payment Gateway…
                    </span>
                  ) : paymentMethod === "razorpay" ? (
                    `Pay ${formatPrice({ basePrice: grandTotal, currency: displayCurrency })} with Razorpay`
                  ) : (
                    `Confirm COD Order (${formatPrice({ basePrice: grandTotal, currency: displayCurrency })})`
                  )}
                </button>

                <p className="mt-3 text-center text-[11px] text-neutral-500">
                  By confirming payment, you agree to Snitch terms of service and return policies.
                </p>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-5">
            <div className="border border-neutral-200 bg-neutral-50 p-6 lg:sticky lg:top-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-900">
                Order Summary ({displayItems.length})
              </h2>

              <div className="mt-4 divide-y divide-neutral-200 border-y border-neutral-200">
                {displayItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-3.5">
                    <div className="h-16 w-12 shrink-0 border border-neutral-200 bg-white overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-full w-full object-cover object-top" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[9px] uppercase text-neutral-400">
                          Item
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-neutral-900">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-neutral-500">
                        Size: {item.size} · Color: {item.color} · Qty: {item.quantity || 1}
                      </p>
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-neutral-900">
                      {formatPrice({ basePrice: item.price * (item.quantity || 1), currency: item.currency || "INR" })}
                    </span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleApplyCoupon} className="mt-5">
                <label htmlFor="coupon-input" className="block text-[11px] font-medium uppercase tracking-wider text-neutral-600">
                  Promo Code
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="Try SNITCH200"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-10 flex-1 border border-neutral-300 bg-white px-3 text-xs uppercase tracking-wider placeholder:normal-case placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-black"
                  />
                  <button
                    type="submit"
                    disabled={couponValidating}
                    className="min-h-10 border border-black bg-white px-4 text-xs font-semibold uppercase tracking-wider text-black transition-colors hover:bg-black hover:text-white disabled:opacity-50"
                  >
                    {couponValidating ? "Checking…" : "Apply"}
                  </button>
                </div>
                {couponError && <p className="mt-1.5 text-xs text-red-600">{couponError}</p>}
                {couponSuccess && <p className="mt-1.5 text-xs text-emerald-600">{couponSuccess}</p>}
              </form>

              <div className="mt-6 space-y-2.5 border-t border-neutral-200 pt-5 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-900 tabular-nums">
                    {formatPrice({ basePrice: pricedSubtotal, currency: displayCurrency })}
                  </span>
                </div>

                <div className="flex justify-between text-neutral-600">
                  <span>Shipping Delivery</span>
                  <span className="font-medium text-neutral-900">
                    {shipping === 0 ? "FREE" : formatPrice({ basePrice: shipping, currency: displayCurrency })}
                  </span>
                </div>

                <div className="flex justify-between gap-3 text-neutral-600">
                  <span>Delivery estimate</span>
                  <span className="text-right font-medium text-neutral-900">
                    {deliveryEstimate ? deliveryEstimate.label : "Enter PIN / postal code"}
                  </span>
                </div>
                <div className="flex justify-between gap-3 text-neutral-600">
                  <span>COD</span>
                  <span className={`text-right font-medium ${codEligibility.eligible ? "text-emerald-700" : "text-amber-800"}`}>
                    {codEligibility.eligible ? "Available" : "Check PIN"}
                  </span>
                </div>

                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-medium tabular-nums">
                      - {formatPrice({ basePrice: appliedDiscount, currency: displayCurrency })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-900">
                  <span>Total Amount</span>
                  <span className="tabular-nums">
                    {formatPrice({ basePrice: grandTotal, currency: displayCurrency })}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-500 uppercase tracking-wider text-right">
                  Inclusive of all applicable taxes
                </p>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-5 text-[11px] text-neutral-600 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon />
                  <span>100% Secure Checkout with Razorpay</span>
                </div>
                <div className="flex items-center gap-2">
                  <LockIcon />
                  <span>Doorstep exchange and easy 7-day returns</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
