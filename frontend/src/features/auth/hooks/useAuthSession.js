import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { getMe, refreshAccessToken } from "../services/auth.api";
import { logout, setUser } from "../../redux/auth.slice";
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from "../services/api.client";

export const useAuthSession = ({ autoRefresh = true } = {}) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("checking");
  const timerRef = useRef(null);

  const checkSession = useCallback(async () => {
    try {
      const { user } = await getMe();
      if (user) dispatch(setUser(user));
      setStatus("authenticated");
      return true;
    } catch {
      dispatch(logout());
      setStatus("unauthenticated");
      return false;
    }
  }, [dispatch]);

  const refreshNow = useCallback(async () => {
    try {
      await refreshAccessToken();
      const { user } = await getMe();
      if (user) dispatch(setUser(user));
      setStatus("authenticated");
      return true;
    } catch {
      dispatch(logout());
      setStatus("unauthenticated");
      return false;
    }
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const ok = await checkSession();
      if (cancelled || !ok || !autoRefresh) return;
      timerRef.current = window.setInterval(() => {
        refreshNow();
      }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);
    };

    init();

    const handleVisible = () => {
      if (document.visibilityState === "visible") checkSession();
    };
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearInterval(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [checkSession, refreshNow, autoRefresh]);

  return { status, checkSession, refreshNow };
};

export default useAuthSession;
