import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthRequiredModal from "../../../components/AuthRequiredModal";
import { selectAuth } from "../../redux/auth.slice";
import {
  selectCartItems,
  selectCartCount,
  selectCartTotal,
  selectCartCurrency,
} from "../../redux/cart.slice";
import CartItem from "./CartItem";
import { formatPrice } from "../../product/utils/product";
import useCart from "../hooks/useCart";
import DeliveryEstimator from "../../payment/UI/DeliveryEstimator";
import ThemeToggle from "../../theme/ThemeToggle";

function BagIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-400"
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export default function CartPage() {
  const navigate = useNavigate();

  const cartItems = useSelector(selectCartItems);
  const totalCount = useSelector(selectCartCount);
  const totalValue = useSelector(selectCartTotal);
  const currency = useSelector(selectCartCurrency);

  const { removeItem, setQuantity, cartProducts } = useCart();
  const { user } = useSelector(selectAuth);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    cartProducts().catch(() => {});
  }, [cartProducts]);

  const handleDeleteItem = async (item) => {
    await removeItem(item.productId, item.variantId);
  };

  const handleUpdateQuantity = (item, quantity) => {
    return setQuantity(item.productId, item.variantId, quantity);
  };

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    if (!user) {
      setAuthOpen(true);
      return;
    }

    navigate("/buy-now", {
      state: {
        source: "cart",
        items: cartItems,
      },
    });
  };
  return (
    <div className="flex min-h-dvh flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex min-h-16 w-full max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            className="text-lg font-bold uppercase tracking-[0.24em] focus-visible:outline-2 focus-visible:outline-black"
          >
            Snitch
          </Link>
          <div className="flex shrink-0 items-center gap-1 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-600 transition-colors hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              ← Back to shop
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1000px] px-5 py-8 sm:px-8 sm:py-12">
          <div className="flex flex-col gap-2 border-b border-neutral-200 pb-6 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Shopping Bag
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Your Cart
              </h1>
            </div>

            {cartItems.length > 0 && (
              <div className="flex items-center gap-4 text-xs">
                <span className="font-medium text-neutral-600">
                  Total Products Added:{" "}
                  <strong className="text-neutral-900">{totalCount}</strong>
                </span>
                <span className="text-neutral-300">|</span>
                <span className="font-medium text-neutral-600">
                  Total Value:{" "}
                  <strong className="text-neutral-900">
                    {formatPrice({ basePrice: totalValue, currency })}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center border border-neutral-200 bg-neutral-50">
                <BagIcon />
              </div>
              <h2 className="mt-6 text-lg font-semibold tracking-tight text-neutral-900">
                Your cart is currently empty
              </h2>
              <p className="mt-2 text-sm text-neutral-500">
                Explore our collection to add minimal essentials to your bag.
              </p>
              <div className="mt-8">
                <Link
                  to="/"
                  className="inline-flex min-h-12 items-center justify-center bg-black px-8 text-xs font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-black"
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onDelete={()=>handleDeleteItem(item)}
                    onUpdateQuantity={(id, quantity) => handleUpdateQuantity(item, quantity)}
                  />
                ))}
              </div>

              <div className="mt-8 border border-neutral-200 bg-neutral-50 p-6">
                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span>Products count</span>
                  <span className="font-semibold text-neutral-900 tabular-nums">
                    {totalCount} {totalCount === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3 text-sm font-bold text-neutral-900">
                  <span>Total Value</span>
                  <span className="tabular-nums">
                    {formatPrice({ basePrice: totalValue, currency })}
                  </span>
                </div>
                <p className="mt-1 text-right text-[10px] uppercase tracking-wider text-neutral-400">
                  Inclusive of all taxes
                </p>
              </div>

              <DeliveryEstimator
                subtotal={totalValue}
                currency={currency}
                compact
              />

              <div className="mt-6 pt-2">
                <button
                  type="button"
                  data-testid="place-order-button"
                  onClick={handlePlaceOrder}
                  className="flex min-h-14 w-full items-center justify-center gap-3 bg-black px-6 text-xs font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-black active:scale-[0.99]"
                >
                  <span>
                    Place Order ·{" "}
                    {formatPrice({ basePrice: totalValue, currency })}
                  </span>
                  <ArrowRightIcon />
                </button>
                <p className="mt-3 text-center text-[11px] text-neutral-400">
                  Free standard shipping over ₹1,499 on prepaid orders. Check your PIN above for an exact delivery date and COD eligibility.
                </p>
              </div>
            </div>
          )}
        </div>
        <AuthRequiredModal open={authOpen} onClose={() => setAuthOpen(false)} />
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-xs text-neutral-400">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8">
          <span>Snitch © 2026 · Minimalist Menswear</span>
        </div>
      </footer>
    </div>
  );
}
