"use client";
import axios from "axios";
import { useAuthStore } from "./auth-store";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, user } = useAuthStore.getState();
      if (!refreshToken || !user) throw error;
      const refreshRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/auth/refresh`,
        { refresh_token: refreshToken, user_id: user.id }
      );
      useAuthStore.getState().setAuth({
        accessToken: refreshRes.data.accessToken,
        refreshToken: refreshRes.data.refreshToken,
        user,
      });
      original.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;
      return api(original);
    }
    throw error;
  }
);

export default api;
