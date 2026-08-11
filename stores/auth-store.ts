"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { loginRequest, registerRequest } from "@/services/auth.service";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setTwoFactorVerified: () => void;
  updateUser: (partial: Partial<User>) => void;
}

function persistToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem("cg_token", token);
  else localStorage.removeItem("cg_token");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const res = await loginRequest(email, password);
          persistToken(res.access_token);
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true });
        try {
          const res = await registerRequest(name, email, password);
          persistToken(res.access_token);
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        persistToken(null);
        set({ user: null, token: null, isAuthenticated: false });
      },

      setTwoFactorVerified: () => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, twoFactorEnabled: true } });
        }
      },

      updateUser: (partial) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...partial } });
        }
      },
    }),
    {
      name: "cyberguard-auth",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) persistToken(state.token);
      },
    }
  )
);
