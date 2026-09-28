import { createSlice } from "@reduxjs/toolkit";
import { isSupportedCurrency } from "../product/utils/currency";

const STORAGE_KEY = "snitch:currency";

const loadStoredChoice = () => {
  try {
    const code = sessionStorage.getItem(STORAGE_KEY);
    return isSupportedCurrency(code) ? code.toUpperCase() : null;
  } catch {
    return null;
  }
};

// Stores ONLY the user's explicit choice. Backend currencies are never
// written here — they flow through resolveCurrency() in the hook instead,
// so the display stays sticky per the rule: user choice > backend > locale.
const initialState = {
  choice: loadStoredChoice(),
};

const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    selectCurrency: (state, action) => {
      const code = String(action.payload || "").toUpperCase();
      if (!isSupportedCurrency(code)) return;
      state.choice = code;
    },
    clearCurrencyChoice: (state) => {
      state.choice = null;
    },
  },
});

export const { selectCurrency, clearCurrencyChoice } = currencySlice.actions;

export const selectCurrencyChoice = (state) => state.currency.choice || null;

export const persistCurrencyChoice = (code) => {
  try {
    if (isSupportedCurrency(code)) {
      sessionStorage.setItem(STORAGE_KEY, String(code).toUpperCase());
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // storage unavailable (private mode) — choice lasts for this session
  }
};

export default currencySlice.reducer;
