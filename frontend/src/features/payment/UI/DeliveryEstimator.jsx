import { useEffect, useMemo, useState } from "react";
import {
  COUNTRIES,
  getCodEligibility,
  getDeliveryEstimate,
  isValidPostal,
  normalizeCountry,
  postalExample,
  postalHint,
} from "./deliveryEstimate";

const allowsLetters = (country) => !["IN", "US"].includes(normalizeCountry(country));

const cleanCodeInput = (value, country) => {
  if (allowsLetters(country)) {
    return String(value || "")
      .toUpperCase()
      .replace(/[^A-Z0-9 -]/g, "")
      .slice(0, 10);
  }
  return String(value || "")
    .replace(/\D/g, "")
    .slice(0, 10);
};

export default function DeliveryEstimator({
  initialPin = "",
  country: countryProp = "IN",
  onCountryChange = null,
  subtotal = 0,
  currency = "INR",
  onChange = null,
  compact = false,
}) {
  const [country, setCountry] = useState(() => normalizeCountry(countryProp));
  const [syncedCountry, setSyncedCountry] = useState(() => normalizeCountry(countryProp));
  const [pin, setPin] = useState(String(initialPin || ""));
  const [checkedPin, setCheckedPin] = useState(String(initialPin || ""));
  const [touched, setTouched] = useState(false);
  const [syncedPin, setSyncedPin] = useState(String(initialPin || ""));

  if (normalizeCountry(countryProp) !== syncedCountry) {
    setSyncedCountry(normalizeCountry(countryProp));
    setCountry(normalizeCountry(countryProp));
  }

  if (String(initialPin || "") !== syncedPin && pin === syncedPin) {
    setSyncedPin(String(initialPin || ""));
    setPin(String(initialPin || ""));
    setCheckedPin(String(initialPin || ""));
  }

  const hint = postalHint(country);
  const estimate = useMemo(() => getDeliveryEstimate(checkedPin, country), [checkedPin, country]);
  const cod = useMemo(
    () => getCodEligibility({ pin: checkedPin, country, subtotal, currency }),
    [checkedPin, country, subtotal, currency],
  );
  const showError = touched && checkedPin && !isValidPostal(checkedPin, country);

  useEffect(() => {
    if (onChange) onChange({ pin: checkedPin, country, estimate, cod });
  }, [checkedPin, country, estimate, cod, onChange]);

  const pickCountry = (code) => {
    const next = normalizeCountry(code);
    setCountry(next);
    setTouched(false);
    setCheckedPin("");
    if (onCountryChange) onCountryChange(next);
  };

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
      {onCountryChange && (
        <div className="mt-2">
          <label htmlFor={compact ? "cart-country-input" : "checkout-country-input"} className="sr-only">
            Delivery country
          </label>
          <select
            id={compact ? "cart-country-input" : "checkout-country-input"}
            value={COUNTRIES.some((entry) => entry.code === country) ? country : "OTHER"}
            onChange={(event) => pickCountry(event.target.value)}
            className="h-11 min-h-11 w-full border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus-visible:outline-2 focus-visible:outline-black"
          >
            {COUNTRIES.map((entry) => (
              <option key={entry.code} value={entry.code}>
                {entry.name}
              </option>
            ))}
            <option value="OTHER">Other country</option>
          </select>
        </div>
      )}
      <form onSubmit={check} className="mt-2 flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <label htmlFor={compact ? "cart-pin-input" : "checkout-pin-input"} className="sr-only">
            Delivery PIN or postal code
          </label>
          <input
            id={compact ? "cart-pin-input" : "checkout-pin-input"}
            type="text"
            inputMode="text"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(cleanCodeInput(e.target.value, country))}
            onBlur={() => {
              setTouched(true);
              setCheckedPin(pin.trim());
            }}
            placeholder={`PIN code, e.g. ${postalExample(country)}`}
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
        {hint}, e.g. {postalExample(country)}. Estimate shows before you pay.
      </p>
      {showError && (
        <p id="pin-error" role="alert" className="mt-1.5 text-xs text-red-700">
          Enter a valid {hint}.
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
