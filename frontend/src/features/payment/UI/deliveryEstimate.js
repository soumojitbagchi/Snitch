export function isValidPin(pin) {
  return /^[1-9][0-9]{5}$/.test(String(pin || "").trim());
}

const METRO_PREFIXES = ["110", "400", "560", "700", "600", "500", "380", "302"];

function addDays(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

function formatDay(date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function getDeliveryEstimate(pin, now = new Date()) {
  const clean = String(pin || "").trim();
  if (!isValidPin(clean)) return null;

  const isMetro = METRO_PREFIXES.some((prefix) => clean.startsWith(prefix));
  const digitSum = clean.split("").reduce((sum, d) => sum + Number(d), 0);
  const minDays = isMetro ? 2 : 3;
  const maxDays = isMetro ? 3 + (digitSum % 2) : 4 + (digitSum % 2);

  return {
    pin: clean,
    minDays,
    maxDays,
    isMetro,
    from: addDays(now, minDays),
    to: addDays(now, maxDays),
    label: `${formatDay(addDays(now, minDays))} – ${formatDay(addDays(now, maxDays))}`,
    summary: isMetro
      ? `Delivery to ${clean} in ${minDays}–${maxDays} days`
      : `Delivery to ${clean} in ${minDays}–${maxDays} days (non-metro)`,
  };
}

export const COD_MAX_SUBTOTAL_INR = 50000;

export function getCodEligibility({ pin, subtotal = 0, currency = "INR" }) {
  const clean = String(pin || "").trim();
  if (!isValidPin(clean)) {
    return {
      eligible: false,
      reason: "Enter a valid 6-digit PIN code to check COD availability.",
    };
  }
  if (String(currency || "INR").toUpperCase() !== "INR") {
    return {
      eligible: false,
      reason: "COD is available for INR orders only. Prepaid options work in this currency.",
    };
  }
  if (Number(subtotal) > COD_MAX_SUBTOTAL_INR) {
    return {
      eligible: false,
      reason: `COD is available up to ₹50,000. This order exceeds that limit — please use prepaid.`,
    };
  }
  return {
    eligible: true,
    reason: `COD available to ${clean}. Pay in cash or UPI on arrival.`,
  };
}
