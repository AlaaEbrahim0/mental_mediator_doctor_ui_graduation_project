import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: { Accept: "application/json" },
    timeout: 30000,
});

apiClient.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? window.localStorage.getItem("token") : null;
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        } else {
            config.headers.delete("Authorization");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== "undefined") {
            window.dispatchEvent(new Event("auth:expired"));
        }
        if (!error.response) {
            error.message = error.code === "ECONNABORTED"
                ? "The request timed out. Please try again."
                : "Unable to connect to the server. Check your connection and try again.";
        } else {
            const payload = error.response.data;
            error.apiMessage = payload?.message || payload?.title || error.message;
        }
        return Promise.reject(error);
    }
);

export const getApiErrorMessage = (error, fallback = "Something went wrong. Please try again.") =>
    error?.apiMessage ||
    error?.errors?.[0]?.description ||
    error?.response?.data?.errors?.[0]?.description ||
    error?.response?.data?.message ||
    error?.response?.data?.title ||
    error?.message ||
    fallback;

export default apiClient;
