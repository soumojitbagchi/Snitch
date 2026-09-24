import axios from "axios";

const api = axios.create({
  baseURL: "/api/auth",
  withCredentials: true,
});

export const signin = async ({ email, password }) => {
  const response = await api.post("/signin", { email, password });
  return response.data;
};

export const signup = async ({ email, password, fullname, contact, role}) => {
  const response = await api.post("/signup", { email, password ,fullname,contact,role});
  return response.data;
};

export const getMe = async () => {
  const response = await api.get("/me");
  return response.data;
};

export const updateProfile = async (profile) => {
  const response = await api.put("/profile", profile);
  return response.data;
};

export const logout = async () => {
  await api.post("/logout");
};

export const becomeSeller = async () => {
  const response = await api.patch("/role", { role: "seller" });
  return response.data;
};
