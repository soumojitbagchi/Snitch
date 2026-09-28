// Canonical currency list. Mirrors the backend map in
// backend/src/controller/currency.controller.js — keep codes in sync.
export const SUPPORTED_CURRENCIES = [
  { code: "INR", label: "INR — Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "USD — US Dollar", locale: "en-US" },
  { code: "EUR", label: "EUR — Euro", locale: "de-DE" },
  { code: "GBP", label: "GBP — British Pound", locale: "en-GB" },
];

export const SUPPORTED_CODES = SUPPORTED_CURRENCIES.map((entry) => entry.code);

export const DEFAULT_CURRENCY = "INR";

export const isSupportedCurrency = (code) =>
  typeof code === "string" && SUPPORTED_CODES.includes(code.toUpperCase());

const normalizeCode = (code) => String(code || "").toUpperCase();

export const localeForCurrency = (code) =>
  SUPPORTED_CURRENCIES.find((entry) => entry.code === normalizeCode(code))
    ?.locale || "en-IN";

// First-paint seed only: browser locale → default currency. Never consulted
// again once the user has chosen or the backend has responded (sticky rule).
export const currencyFromLocale = (language) => {
  const lang = String(language || "").toLowerCase();
  if (lang.startsWith("en-in") || lang.startsWith("hi")) return "INR";
  if (lang.startsWith("en-gb")) return "GBP";
  if (lang.startsWith("en")) return "USD";
  if (/^(de|fr|es|it|nl|pt|el)-?/.test(lang)) return "EUR";
  return DEFAULT_CURRENCY;
};
