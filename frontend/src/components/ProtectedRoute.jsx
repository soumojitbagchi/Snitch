import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getMe, refreshAccessToken } from "../features/auth/services/auth.api";
import { logout, setUser } from "../features/redux/auth.slice";
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from "../features/auth/services/api.client";

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let cancelled = false;
    let timer = null;

    const checkAccessTokenAvailable = async () => {
      try {
        const { user } = await getMe();
        if (cancelled) return;
        dispatch(setUser(user));
        setStatus("authenticated");
      } catch (firstError) {
        if (firstError?.response?.status !== 401) {
          if (!cancelled) setStatus("unauthenticated");
          return;
        }
        try {
          await refreshAccessToken();
          const { user } = await getMe();
          if (cancelled) return;
          dispatch(setUser(user));
          setStatus("authenticated");
        } catch {
          if (cancelled) return;
          dispatch(logout());
          setStatus("unauthenticated");
        }
      }
    };

    checkAccessTokenAvailable().then(() => {
      if (cancelled) return;
      timer = window.setInterval(async () => {
        try {
          await refreshAccessToken();
        } catch {
          dispatch(logout());
          if (!cancelled) setStatus("unauthenticated");
        }
      }, ACCESS_TOKEN_REFRESH_INTERVAL_MS);
    });

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
    };
  }, [dispatch]);

  if (status === "checking") {
    return (
      <main
        aria-busy="true"
        aria-live="polite"
        className="grid min-h-screen place-items-center bg-white px-6 text-neutral-900"
      >
        <div className="w-full max-w-xs border-t border-neutral-900 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
            Snitch
          </p>
          <div className="mt-6 flex items-center gap-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-neutral-900" />
            <p className="text-sm text-neutral-600">Checking your session</p>
          </div>
        </div>
      </main>
    );
  }
  if (status === "unauthenticated") {
    return <Navigate to="/signin" replace />;
  }
  return children;
};

export default ProtectedRoute;
