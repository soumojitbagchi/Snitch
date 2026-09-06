import { useState } from "react";
import Field from "./Field";
import { inputClass } from "./inputClass";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export default function Signin({ onSwitch }) {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
    setServerError("");
  };

  const validate = () => {
    const er = {};
    if (!values.email.trim()) er.email = "Email is required.";
    else if (!isEmail(values.email)) er.email = "Enter a valid email.";
    if (!values.password) er.password = "Password is required.";
    else if (values.password.length < 6)
      er.password = "Password needs to be at least 6 characters.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setDone(false);
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        const msg =
          data?.error ||
          (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
          "Wrong credentials. Check your email and password.";
        setServerError(typeof msg === "string" ? msg : "Sign in failed.");
        return;
      }
      setDone(true);
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <Field label="Email" htmlFor="signin-email" error={errors.email}>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={set("email")}
          className={inputClass(errors.email)}
        />
      </Field>

      <Field label="Password" htmlFor="signin-password" error={errors.password}>
        <div className="relative">
          <input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            value={values.password}
            onChange={set("password")}
            className={`${inputClass(errors.password)} pr-16`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-black"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </Field>

      <div className="flex items-center justify-between pt-1">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-neutral-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded-none border-neutral-300 accent-black"
          />
          Remember me
        </label>
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="text-[13px] font-medium text-neutral-900 underline underline-offset-4 decoration-neutral-300 hover:decoration-black"
        >
          Forgot password?
        </a>
      </div>

      {serverError && (
        <p
          role="alert"
          className="border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] leading-5 text-red-700"
        >
          {serverError}
        </p>
      )}
      {done && (
        <p
          role="status"
          className="border border-green-200 bg-green-50 px-3 py-2.5 text-[13px] leading-5 text-green-800"
        >
          Signed in. Redirecting you to the store…
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center bg-black text-[12px] font-semibold uppercase tracking-[0.22em] text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin border-2 border-white/30 border-t-white" />
            Signing in
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-[13px] text-neutral-500">
        New to Snitch?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-black underline underline-offset-4 decoration-neutral-300 hover:decoration-black"
        >
          Create an account
        </button>
      </p>
    </form>
  );
}
