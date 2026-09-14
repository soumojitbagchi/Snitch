import { createSlice } from "@reduxjs/toolkit";

const FORMS = {
  signin: { email: "", password: "" },
  signup: { fullname: "", email: "", contact: "", password: "", role: "buyer" },
};

const initialState = {
  values: { ...FORMS.signup },
  errors: {},
  serverError: "",
  showPassword: false,
  loading: false,
  done: false,
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setValues: (state, action) => {
      state.values = action.payload;
    },
    setField: (state, action) => {
      const { key, value } = action.payload;
      state.values[key] =
        key === "contact"
          ? String(value ?? "").replace(/\D/g, "").slice(0, 10)
          : value;
      if (state.errors[key]) {
        delete state.errors[key];
      }
      state.serverError = "";
    },
    setRole: (state, action) => {
      state.values.role = action.payload;
    },
    setErrors: (state, action) => {
      state.errors = action.payload ?? {};
    },
    setServerError: (state, action) => {
      state.serverError = action.payload ?? "";
    },
    setShowPassword: (state, action) => {
      state.showPassword =
        action.payload !== undefined ? action.payload : !state.showPassword;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setDone: (state, action) => {
      state.done = action.payload;
    },

    field: (state, action) => {
      const { key, value } = action.payload;
      state.values[key] =
        key === "contact"
          ? String(value ?? "").replace(/\D/g, "").slice(0, 10)
          : value;
      if (state.errors[key]) {
        delete state.errors[key];
      }
      state.serverError = "";
    },
    role: (state, action) => {
      state.values.role = action.payload;
    },
    togglePassword: (state) => {
      state.showPassword = !state.showPassword;
    },
    start: (state) => {
      state.loading = true;
      state.serverError = "";
      state.done = false;
      state.errors = {};
    },
    fail: (state, action) => {
      state.loading = false;
      if (typeof action.payload === "object") state.errors = action.payload;
      else state.serverError = action.payload;
    },
    success: (state, action) => {
      state.loading = false;
      state.done = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    reset: (state, action) => {
      const mode = action.payload === "signup" ? "signup" : "signin";
      state.values = { ...FORMS[mode] };
      state.errors = {};
      state.serverError = "";
      state.loading = false;
      state.done = false;
      state.showPassword = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.done = false;
      state.errors = {};
      state.serverError = "";
    },
  },
});

export const {
  setUser,
  setToken,
  setValues,
  setField,
  setRole,
  setErrors,
  setServerError,
  setShowPassword,
  setLoading,
  setDone,
  field,
  role,
  togglePassword,
  start,
  fail,
  success,
  reset,
  logout,
} = authSlice.actions;

export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
