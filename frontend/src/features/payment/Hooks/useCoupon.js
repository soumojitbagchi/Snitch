import { useState, useCallback } from "react";
import { validateCouponApi, couponErrorMessage } from "../service/coupon.api";
import { formatPrice } from "../../product/utils/product";

// All coupon-redemption state lives here so any checkout UI
// (PaymentPage, BuyNow flows, future prepayment steps) can share it.
export default function useCoupon() {
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const clearCoupon = useCallback(() => {
    setAppliedCoupon("");
    setAppliedDiscount(0);
  }, []);

  const resetCouponState = useCallback(() => {
    setCouponCode("");
    setAppliedCoupon("");
    setAppliedDiscount(0);
    setValidating(false);
    setError("");
    setSuccess("");
  }, []);

  // Validate the typed code against the live subtotal and, on success,
  // remember it for order creation.
  const applyCoupon = useCallback(async ({ subtotal, currency }) => {
    setError("");
    setSuccess("");
    const clean = couponCode.trim().toUpperCase();

    if (!clean) {
      setError("Please enter a valid coupon code.");
      return { ok: false };
    }

    setValidating(true);
    try {
      const result = await validateCouponApi({ code: clean, subtotal });
      setAppliedCoupon(result.code);
      setAppliedDiscount(result.discount);
      setSuccess(
        `Code ${result.code} applied (${formatPrice({ basePrice: result.discount, currency })} OFF).`
      );
      return { ok: true, code: result.code, discount: result.discount };
    } catch (err) {
      clearCoupon();
      setError(couponErrorMessage(err));
      return { ok: false, error: err };
    } finally {
      setValidating(false);
    }
  }, [couponCode, clearCoupon]);

  // Re-check the remembered coupon against the current subtotal.
  // Call right before payment so the displayed discount always matches
  // what the backend will actually charge.
  const revalidateCoupon = useCallback(async ({ subtotal }) => {
    if (!appliedCoupon) return { ok: true, skipped: true };
    try {
      const recheck = await validateCouponApi({ code: appliedCoupon, subtotal });
      setAppliedDiscount(recheck.discount);
      return { ok: true, discount: recheck.discount };
    } catch (err) {
      clearCoupon();
      return { ok: false, error: err };
    }
  }, [appliedCoupon, clearCoupon]);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    appliedDiscount,
    validating,
    error,
    success,
    applyCoupon,
    revalidateCoupon,
    clearCoupon,
    resetCouponState,
  };
}
