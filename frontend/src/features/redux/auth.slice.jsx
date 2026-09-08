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
    // type in an input
    field: (state, action) => {
      const { key, value } = action.payload;
      state.values[key] =
        key === "contact"
          ? String(value ?? "").replace(/\D/g, "").slice(0, 10)
          : value;
      delete state.errors[key];
      state.serverError = "";
    },
    role: (state, action) => {
      state.values.role = action.payload;
    },
    togglePassword: (state) => {
      state.showPassword = !state.showPassword;
    },
    // internal: request lifecycle (hook uses these, you don't have to)
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

export const { field, role, togglePassword, start, fail, success, reset, logout } =
  authSlice.actions;
export const selectAuth = (state) => state.auth;
export default authSlice.reducer;
