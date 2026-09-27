import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import router from "./route.jsx";
import { getMe, refreshAccessToken } from "./features/auth/services/auth.api.js";
import { logout, setUser } from "./features/redux/auth.slice.jsx";
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from "./features/auth/services/api.client.js";

function App() {
  const dispatch = useDispatch();
  const timerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const checkSessionAvailability = async () => {
      try {
        const { user } = await getMe();
        if (!cancelled && user) dispatch(setUser(user));
        return true;
      } catch {
        if (!cancelled) dispatch(logout());
        return false;
      }
    };

    const startProactiveRefresh = () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = window.setInterval(async () => {
        try {
          await refreshAccessToken();
          const { user } = await getMe();
          if (!cancelled && user) dispatch(setUser(user));
        } catch {
          if (!cancelled) dispatch(logout());
        }
      }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);
    };

    checkSessionAvailability().then((available) => {
      if (!cancelled && available) startProactiveRefresh();
    });

    const handleVisible = () => {
      if (document.visibilityState === "visible") checkSessionAvailability();
    };
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
