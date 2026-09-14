import { useDispatch, useSelector } from "react-redux";
import { signin, signup } from "../services/auth.api";
import {
  selectAuth,
  setUser,
  setToken,
  setField,
  setRole as setRoleAction,
  setErrors,
  setServerError,
  setShowPassword,
  setLoading,
  setDone,
  reset,
} from "../../redux/auth.slice";
import { useNavigate } from "react-router";

const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v ?? "").trim());

export const useAuth = (mode = "signin") => {
  const dispatch = useDispatch();
  const { values, errors, serverError, showPassword, loading, done, user, token } =
    useSelector(selectAuth);
  const navigate = useNavigate();

  const set = (key) => (e) => dispatch(setField({ key, value: e.target.value }));
  const setRole = (value) => dispatch(setRoleAction(value));
  const toggleShowPassword = () => dispatch(setShowPassword());
  const resetForm = (m = mode) => dispatch(reset(m));

  const submit = async () => {
    const er = {};
    if (mode === "signup" && !String(values.fullname ?? "").trim()) {
      er.fullname = "Full name is required.";
    }
    if (!String(values.email ?? "").trim()) {
      er.email = "Email is required.";
    } else if (!isEmail(values.email)) {
      er.email = "Enter a valid email.";
    }
    if (mode === "signup") {
      if (!String(values.contact ?? "").trim()) {
        er.contact = "Contact is required.";
      } else if (!/^\d{10}$/.test(values.contact.trim())) {
        er.contact = "Contact needs to be 10 digits.";
      }
    }
    if (!values.password) {
      er.password = "Password is required.";
    } else if (values.password.length < 6) {
      er.password = "Min 6 characters.";
    }

    if (Object.keys(er).length > 0) {
      dispatch(setErrors(er));
      return { ok: false };
    }

    dispatch(setLoading(true));
    dispatch(setServerError(""));
    dispatch(setErrors({}));
    dispatch(setDone(false));

    try {
      const data =
        mode === "signup"
          ? await signup({
              fullname: values.fullname.trim(),
              email: values.email.trim().toLowerCase(),
              contact: values.contact.trim(),
              password: values.password,
              role: values.role ?? "buyer",
            })
          : await signin({
              email: values.email.trim().toLowerCase(),
              password: values.password,
            });

      if (data?.success === false) {
        dispatch(setServerError(data.error || "Something went wrong."));
        dispatch(setLoading(false));
        return { ok: false };
      }

      const userValue = data?.user ?? { email: values.email };
      dispatch(setUser(userValue));
      dispatch(setToken(data?.token ?? null));
      dispatch(setDone(true));
      dispatch(setLoading(false));

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/");
      return { ok: true };
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong.";
      dispatch(setServerError(typeof msg === "string" ? msg : "Something went wrong."));
      dispatch(setLoading(false));
      return { ok: false };
    }
  };

  return {
    values,
    errors,
    serverError,
    showPassword,
    loading,
    done,
    user,
    token,
    set,
    setRole,
    toggleShowPassword,
    submit,
    reset: resetForm,
  };
};

export default useAuth;
