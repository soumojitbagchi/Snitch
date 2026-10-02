export const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "IE", name: "Ireland" },
  { code: "CH", name: "Switzerland" },
  { code: "AT", name: "Austria" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "DK", name: "Denmark" },
  { code: "FI", name: "Finland" },
  { code: "PT", name: "Portugal" },
  { code: "GR", name: "Greece" },
  { code: "PL", name: "Poland" },
  { code: "AE", name: "UAE" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SG", name: "Singapore" },
  { code: "MY", name: "Malaysia" },
  { code: "JP", name: "Japan" },
  { code: "ZA", name: "South Africa" },
  { code: "NZ", name: "New Zealand" },
  { code: "BR", name: "Brazil" },
];

export const COD_COUNTRIES = ["IN", "US", "GB"];

const COD_CAPS = {
  IN: { max: 50000, label: "₹50,000" },
  US: { max: 600, label: "$600" },
  GB: { max: 500, label: "£500" },
};

export function normalizeCountry(value) {
  const raw = String(value || "").trim();
  if (!raw) return "IN";
  const byCode = COUNTRIES.find((entry) => entry.code === raw.toUpperCase());
  if (byCode) return byCode.code;
  const byName = COUNTRIES.find((entry) => entry.name.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.code;
  if (/^india$/i.test(raw)) return "IN";
  if (/^(united states|usa|u\.s\.)$/i.test(raw)) return "US";
  if (/^(united kingdom|uk|britain)$/i.test(raw)) return "GB";
  return "OTHER";
}

export function countryName(code) {
  const entry = COUNTRIES.find((item) => item.code === normalizeCountry(code));
  return entry ? entry.name : "your country";
}

const STRICT_POSTAL_PATTERNS = {
  IN: /^[1-9][0-9]{5}$/,
  US: /^\d{5}(-\d{4})?$/,
  GB: /^[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}$/,
  CA: /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/,
};

const LENIENT_POSTAL = /^[A-Za-z0-9][A-Za-z0-9\s-]{1,8}[A-Za-z0-9]$/;

export function isValidPin(pin) {
  return /^[1-9][0-9]{5}$/.test(String(pin || "").trim());
}

export function isValidPostal(code, country = "IN") {
  const clean = String(code || "").trim();
  if (!clean) return false;
  const strict = STRICT_POSTAL_PATTERNS[normalizeCountry(country)];
  if (strict) return strict.test(clean);
  if (normalizeCountry(country) === "OTHER") return clean.length >= 3;
  return LENIENT_POSTAL.test(clean);
}

export function postalExample(country = "IN") {
  switch (normalizeCountry(country)) {
    case "IN":
      return "560038";
    case "US":
      return "10001";
    case "GB":
      return "SW1A 1AA";
    case "CA":
      return "M5V 1J1";
    default:
      return "10001";
  }
}

export function postalHint(country = "IN") {
  switch (normalizeCountry(country)) {
    case "IN":
      return "6-digit PIN code";
    case "US":
      return "5-digit ZIP code";
    case "GB":
      return "postcode";
    default:
      return "postal code";
  }
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

const DOMESTIC_RANGES = {
  US: [3, 5],
  GB: [2, 4],
};

export function getDeliveryEstimate(pin, country = "IN", now = new Date()) {
  const code = normalizeCountry(country);
  const clean = String(pin || "").trim();
  if (!isValidPostal(clean, code)) return null;

  let minDays;
  let maxDays;
  let isMetro = false;
  if (code === "IN") {
    isMetro = METRO_PREFIXES.some((prefix) => clean.startsWith(prefix));
    const digitSum = clean.split("").reduce((sum, d) => sum + Number(d), 0);
    minDays = isMetro ? 2 : 3;
    maxDays = isMetro ? 3 + (digitSum % 2) : 4 + (digitSum % 2);
  } else if (DOMESTIC_RANGES[code]) {
    [minDays, maxDays] = DOMESTIC_RANGES[code];
  } else {
    [minDays, maxDays] = [7, 12];
  }

  return {
    pin: clean,
    country: code,
    minDays,
    maxDays,
    isMetro,
    from: addDays(now, minDays),
    to: addDays(now, maxDays),
    label: `${formatDay(addDays(now, minDays))} – ${formatDay(addDays(now, maxDays))}`,
    summary:
      code === "IN" && !isMetro
        ? `Delivery to ${clean} in ${minDays}–${maxDays} days (non-metro)`
        : `Delivery to ${clean} in ${minDays}–${maxDays} days`,
  };
}

export const COD_MAX_SUBTOTAL_INR = 50000;

export function getCodEligibility({ pin, country = "IN", subtotal = 0 }) {
  const code = normalizeCountry(country);
  const clean = String(pin || "").trim();
  if (!COD_COUNTRIES.includes(code)) {
    return {
      eligible: false,
      reason: "Cash on Delivery is available in India, the US and the UK only.",
    };
  }
  if (!isValidPostal(clean, code)) {
    return {
      eligible: false,
      reason: `Enter a valid ${postalHint(code)} to check COD availability.`,
    };
  }
  const cap = COD_CAPS[code];
  if (Number(subtotal) > cap.max) {
    return {
      eligible: false,
      reason: `COD is available up to ${cap.label}. This order exceeds that limit — please use prepaid.`,
    };
  }
  return {
    eligible: true,
    reason: `COD available to ${clean}. Pay in cash or UPI on arrival.`,
  };
}
