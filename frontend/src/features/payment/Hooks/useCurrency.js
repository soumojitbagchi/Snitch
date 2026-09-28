import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrency as selectCurrencyAction,
  selectCurrencyChoice,
  persistCurrencyChoice,
} from "../../redux/currency.slice";
import {
  currencyFromLocale,
  isSupportedCurrency,
} from "../../product/utils/currency";

// Sticky-currency rule:
//   1. explicit user choice (persisted) always wins,
//   2. otherwise the backend's currency (cart / checkout / convert response),
//   3. browser locale is a first-paint seed only.
// Nothing here ever auto-switches: resolveCurrency() is a pure read.
export default function useCurrency() {
  const dispatch = useDispatch();
  const choice = useSelector(selectCurrencyChoice);

  const select = useCallback(
    (code) => {
      if (!isSupportedCurrency(code)) return;
      const normalized = String(code).toUpperCase();
      persistCurrencyChoice(normalized);
      dispatch(selectCurrencyAction(normalized));
    },
    [dispatch]
  );

  const resolveCurrency = useCallback(
    (backendCurrency) => {
      if (choice) return choice;
      if (isSupportedCurrency(backendCurrency)) {
        return String(backendCurrency).toUpperCase();
      }
      if (typeof navigator !== "undefined") {
        return currencyFromLocale(navigator.language);
      }
      return "INR";
    },
    [choice]
  );

  return { choice, selectCurrency: select, resolveCurrency };
}
