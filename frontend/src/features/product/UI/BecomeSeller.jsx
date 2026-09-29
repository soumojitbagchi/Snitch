import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { becomeSeller } from "../../auth/services/auth.api";
import { setUser } from "../../redux/auth.slice";

const messageFor = (error, fallback) =>
  error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;

export default function BecomeSeller({ compact = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const response = await becomeSeller();
      if (response?.user) dispatch(setUser(response.user));
      navigate("/seller");
    } catch (requestError) {
      setError(messageFor(requestError, "Could not open your store. Try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "" : "border border-neutral-200 bg-neutral-50 px-5 py-5"}>
      {!compact && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-neutral-600">
            Sell on Snitch
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-700">
            Open your seller studio to publish products, track orders, and see earnings.
          </p>
        </>
      )}
      {error && (
        <p role="alert" className="mt-3 border-l-2 border-red-700 pl-3 text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={busy}
        onClick={handleClick}
        className="mt-4 inline-flex min-h-11 items-center justify-center bg-black px-5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Opening your store…" : "Become a seller"}
      </button>
    </div>
  );
}
