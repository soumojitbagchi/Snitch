import axios from "axios";

export const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
export const ACCESS_TOKEN_REFRESH_INTERVAL_MS =
  ACCESS_TOKEN_TTL_MS - 5 * 60 * 1000;

let inflightRefresh = null;

export const refreshAccessTokenRequest = async () => {
  if (!inflightRefresh) {
    inflightRefresh = axios
      .get("/api/auth/refresh", { withCredentials: true })
      .then((res) => res.data)
      .finally(() => {
        inflightRefresh = null;
      });
  }
  return inflightRefresh;
};

const isRefreshUrl = (url = "") => url.includes("/api/auth/refresh");
const isAuthUrl = (url = "") =>
  url.includes("/api/auth/signin") ||
  url.includes("/api/auth/signup") ||
  isRefreshUrl(url);

export const createApiClient = (baseURL) => {
  const client = axios.create({ baseURL, withCredentials: true });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const status = error.response?.status;
      const url = original?.url ?? "";

      if (
        status === 401 &&
        original &&
        !original._retry &&
        !isAuthUrl(url) &&
        !isRefreshUrl(original.baseURL + url)
      ) {
        original._retry = true;
        try {
          await refreshAccessTokenRequest();
          return client(original);
        } catch (refreshError) {
          return Promise.reject(refreshError?.response?.data ? refreshError : error);
        }
      }
      return Promise.reject(error);
    },
  );

  return client;
};

export default createApiClient;
