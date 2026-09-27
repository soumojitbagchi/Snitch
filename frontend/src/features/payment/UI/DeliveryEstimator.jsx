import { useEffect, useMemo, useState } from "react";
import {
  getCodEligibility,
  getDeliveryEstimate,
  isValidPin,
} from "./deliveryEstimate";

export default function DeliveryEstimator({
  initialPin = "",
  subtotal = 0,
  currency = "INR",
  onChange = null,
  compact = false,
}) {
  const [pin, setPin] = useState(String(initialPin || ""));
  const [checkedPin, setCheckedPin] = useState(String(initialPin || ""));
  const [touched, setTouched] = useState(false);
  const [syncedPin, setSyncedPin] = useState(String(initialPin || ""));

  if (String(initialPin || "") !== syncedPin && pin === syncedPin) {
    setSyncedPin(String(initialPin || ""));
    setPin(String(initialPin || ""));
    setCheckedPin(String(initialPin || ""));
  }

  const estimate = useMemo(() => getDeliveryEstimate(checkedPin), [checkedPin]);
  const cod = useMemo(
    () => getCodEligibility({ pin: checkedPin, subtotal, currency }),
    [checkedPin, subtotal, currency]
  );
  const showError = touched && checkedPin && !isValidPin(checkedPin);

  useEffect(() => {
    if (onChange) onChange({ pin: checkedPin, estimate, cod });
  }, [checkedPin, estimate, cod, onChange]);

  const check = (event) => {
    event?.preventDefault?.();
    setTouched(true);
    setCheckedPin(pin.trim());
  };

  return (
    <div className={compact ? "border border-neutral-200 bg-neutral-50 p-4" : ""}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-900">
        Delivery estimate
      </p>
      <form onSubmit={check} className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={compact ? "cart-pin-input" : "checkout-pin-input"} className="sr-only">
            Delivery PIN code
          </label>
          <input
            id={compact ? "cart-pin-input" : "checkout-pin-input"}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onBlur={() => {
              setTouched(true);
              setCheckedPin(pin.trim());
            }}
            placeholder="PIN code, e.g. 560038"
            aria-invalid={Boolean(showError)}
            aria-describedby={showError ? "pin-error" : "pin-help"}
            className="h-11 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm tabular-nums text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-2 focus-visible:outline-black"
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-11 items-center justify-center border border-black bg-white px-4 text-xs font-semibold uppercase tracking-[0.14em] text-black transition-colors hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Check
        </button>
      </form>
      <p id="pin-help" className="mt-1.5 text-[11px] text-neutral-500">
        6-digit Indian PIN code. Estimate shows before you pay.
      </p>
      {showError && (
        <p id="pin-error" role="alert" className="mt-1.5 text-xs text-red-700">
          Enter a valid 6-digit PIN code (first digit 1–9).
        </p>
      )}

      {estimate && (
        <div role="status" className="mt-3 space-y-1.5 border-t border-neutral-200 pt-3 text-xs">
          <p className="font-semibold text-neutral-900">
            Estimated delivery: {estimate.label}
          </p>
          <p className="text-neutral-600">{estimate.summary}.</p>
          <p className={cod.eligible ? "text-emerald-700" : "text-amber-800"}>
            {cod.eligible ? "✓ " : "• "}{cod.reason}
          </p>
        </div>
      )}
    </div>
  );
}
