import { useEffect } from "react";
import Field from "./Field";
import { inputClass } from "./inputClass";
import { useAuth } from "../hooks/useAuth";

export default function Signin({ onSwitch }) {
  const {
    values,
    errors,
    serverError,
    showPassword,
    loading,
    done,
    set,
    toggleShowPassword,
    submit,
    reset,
  } = useAuth("signin");

  useEffect(() => {
    reset("signin");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const onSubmit = async (e) => {
    e.preventDefault();
    await submit();
    

  };

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <Field label="Email" htmlFor="signin-email" error={errors.email}>
        <input
          id="signin-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email ?? ""}
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
