import { useEffect } from "react";
import Field from "./Field";
import { inputClass } from "./inputClass";
import { useAuth } from "../hooks/useAuth";

export default function Signup({ onSwitch }) {
  const {
    values,
    errors,
    serverError,
    showPassword,
    loading,
    done,
    set,
    setRole,
    toggleShowPassword,
    submit,
    reset,
  } = useAuth("signup");

  useEffect(() => {
    reset("signup");
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await submit();
  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <Field label="Full name" htmlFor="signup-name" error={errors.fullname}>
        <input
          id="signup-name"
          type="text"
          autoComplete="name"
          placeholder="Aarav Sharma"
          value={values.fullname ?? ""}
          onChange={set("fullname")}
          className={inputClass(errors.fullname)}
        />
      </Field>

      <Field label="Email" htmlFor="signup-email" error={errors.email}>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email ?? ""}
          onChange={set("email")}
          className={inputClass(errors.email)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Contact"
          htmlFor="signup-contact"
          error={errors.contact}
          hint={!errors.contact ? "10-digit mobile number" : undefined}
        >
          <div className="flex">
            <span className="flex h-12 items-center border border-r-0 border-neutral-300 bg-neutral-50 px-3 text-[14px] text-neutral-500">
              +91
            </span>
            <input
              id="signup-contact"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="98765 43210"
              value={values.contact ?? ""}
              onChange={set("contact")}
              className={inputClass(errors.contact)}
            />
          </div>
        </Field>

        <Field
          label="Password"
          htmlFor="signup-password"
          error={errors.password}
          hint={!errors.password ? "Minimum 6 characters" : undefined}
        >
          <div className="relative">
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={values.password ?? ""}
              onChange={set("password")}
              className={`${inputClass(errors.password)} pr-16`}
            />
            <button
              type="button"
              onClick={toggleShowPassword}
              className="absolute inset-y-0 right-0 px-3 text-xs font-medium uppercase tracking-wider text-neutral-500 hover:text-black"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </Field>
      </div>

      <div>
        <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          I want to
        </span>
        <div
          role="radiogroup"
          aria-label="Account type"
          className="grid grid-cols-2 divide-x divide-neutral-300 border border-neutral-300"
        >
          {[
            { value: "buyer", title: "Shop", sub: "Buy products" },
            { value: "seller", title: "Sell", sub: "Open a store" },
          ].map((opt) => {
            const active = values.role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRole(opt.value)}
                className={`px-4 py-2.5 text-left transition-colors ${
                  active ? "bg-black text-white" : "bg-white hover:bg-neutral-50"
                } ${opt.value === "buyer" ? "border-r border-neutral-300" : ""}`}
              >
                <span className="block text-[13px] font-medium uppercase tracking-[0.12em]">
                  {opt.title}
                </span>
                <span
                  className={`block text-xs ${active ? "text-white/70" : "text-neutral-500"}`}
                >
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
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
          Account created. Welcome to Snitch.
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
            Creating account
          </span>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-[13px] text-neutral-500">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="font-medium text-black underline underline-offset-4 decoration-neutral-300 hover:decoration-black"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
