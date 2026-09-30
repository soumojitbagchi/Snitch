import { createApiClient, refreshAccessTokenRequest } from "./api.client";

const api = createApiClient("/api/auth");

export const signin = async ({ email, password }) => {
  const response = await api.post("/signin", { email, password });
  return response.data;
};

export const signup = async ({ email, password, fullname, contact, role }) => {
  const response = await api.post("/signup", {
    email,
    password,
    fullname,
    contact,
    role,
  });
  return response.data;
};

export const refreshAccessToken = async () => refreshAccessTokenRequest();

export const getMe = async () => {
  try {
    const response = await api.get("/me");
    return response.data;
  } catch (error) {
    if (error?.response?.status === 401 && !error.config?._retry) {
      await refreshAccessTokenRequest();
      const retry = await api.get("/me");
      return retry.data;
    }
    throw error;
  }
};

export const updateProfile = async (profile) => {
  const response = await api.put("/profile", profile);
  return response.data;
};

export const updateThemePreference = async (theme) => {
  const response = await api.patch("/preferences", { theme });
  return response.data;
};

export const logout = async () => {
  await api.post("/logout");
};

export const becomeSeller = async () => {
  const response = await api.patch("/role", { role: "seller" });
  return response.data;
};
