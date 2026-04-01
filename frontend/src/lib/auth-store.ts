"use client";
import { create } from "zustand";

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; email: string; role: string } | null;
  setAuth: (payload: { accessToken: string; refreshToken: string; user: any }) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  setAuth: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),
  clear: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
