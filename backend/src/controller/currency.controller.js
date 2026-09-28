import { exchangeRate } from "../service/currencyConverter.service.js";
import { getJson, setJsonEx } from "../service/cache.service.js";

export const SUPPORTED_CURRENCIES = [
    { code: "INR", label: "INR — Indian Rupee", locale: "en-IN" },
    { code: "USD", label: "USD — US Dollar", locale: "en-US" },
    { code: "EUR", label: "EUR — Euro", locale: "de-DE" },
    { code: "GBP", label: "GBP — British Pound", locale: "en-GB" },
];

const SUPPORTED_CODES = new Set(SUPPORTED_CURRENCIES.map((entry) => entry.code));
const RATES_TTL_SECONDS = 12 * 60 * 60;

const cachedRate = async (from, to) => {
    if (from === to) return 1;
    const key = `rates:${from}:${to}`;
    const hit = await getJson(key);
    if (Number.isFinite(hit) && hit > 0) return hit;
    const rate = await exchangeRate(from, to);
    await setJsonEx(key, rate, RATES_TTL_SECONDS);
    return rate;
};

export const supportedCurrenciesController = (req, res) => {
    return res.status(200).json({ success: true, data: SUPPORTED_CURRENCIES });
};

export const convertCurrencyController = async (req, res) => {
    const { amount, from, to } = req.body ?? {};
    try {
        const value = Number(amount);
        if (!Number.isFinite(value) || value < 0) {
            return res.status(400).json({ success: false, message: "A valid non-negative amount is required" });
        }
        if (!SUPPORTED_CODES.has(from) || !SUPPORTED_CODES.has(to)) {
            return res.status(400).json({ success: false, message: "Unsupported currency" });
        }
        const rate = await cachedRate(from, to);
        const converted = Math.round(value * rate * 100) / 100;
        return res.status(200).json({
            success: true,
            data: { amount: value, from, to, rate, converted },
        });
    } catch (error) {
        return res.status(503).json({
            success: false,
            message: error?.message || "Currency conversion is unavailable",
        });
    }
};
