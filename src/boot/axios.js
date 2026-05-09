import { defineBoot } from "#q-app/wrappers";
import axios from "axios";

const api = axios.create({
  // baseURL: 'https://annreportopsbackend-production.up.railway.app/',
  baseURL: "http://localhost:8080/",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN");

  if (token && !["/v1/web/login"].includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !["/v1/web/login"].includes(error.config.url)
    ) {
      localStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default defineBoot(({ app }) => {
  app.config.globalProperties.$api = api;
});

export { api };
