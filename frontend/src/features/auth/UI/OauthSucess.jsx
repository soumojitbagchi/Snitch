import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { success } from "../../redux/auth.slice";
import { getMe } from "../services/auth.api";

const OauthSuccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        const data = await getMe();
        dispatch(success({ user: data.user }));
        navigate("/");
      } catch {
        navigate("/signin?error=oauth");
      }
    };

    completeSignIn();
  }, [navigate, dispatch]);

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
          <p className="text-sm text-neutral-600">Signing you in</p>
        </div>
      </div>
    </main>
  );
};

export default OauthSuccess;
