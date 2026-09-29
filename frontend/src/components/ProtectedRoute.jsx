import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe, refreshAccessToken } from "../features/auth/services/auth.api";
import { logout, selectAuth, setUser } from "../features/redux/auth.slice";
import { ACCESS_TOKEN_REFRESH_INTERVAL_MS } from "../features/auth/services/api.client";
import BecomeSeller from "../features/product/UI/BecomeSeller.jsx";

const Forbidden = ({ requiredRole, showBecome }) => (
  <main className="grid min-h-screen place-items-center bg-white px-6 text-neutral-900">
    <div className="w-full max-w-sm border-t border-neutral-900 pt-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em]">
        Snitch
      </p>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">Sellers only</h1>
      <p className="mt-2 text-sm leading-6 text-neutral-600">
        {requiredRole
          ? `This area needs a ${requiredRole} account. Your current account cannot open it.`
          : "Your current account cannot open this area."}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/"
          className="inline-flex min-h-11 items-center border border-neutral-300 px-4 text-sm font-medium transition-colors hover:border-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Back to store
        </a>
        <a
          href="/profile"
          className="inline-flex min-h-11 items-center bg-black px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          Manage account
        </a>
      </div>
      {showBecome && (
        <div className="mt-6">
          <BecomeSeller />
        </div>
      )}
    </div>
  </main>
);

const ProtectedRoute = ({ children, allowedRoles = null }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionUser = useSelector(selectAuth)?.user;
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
    return <Navigate to="/signin" state={{ from: location.pathname }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(sessionUser?.role)) {
    return <Forbidden requiredRole={allowedRoles.join(" or ")} showBecome={Boolean(sessionUser)} />;
  }
  return children;
};

export default ProtectedRoute;
