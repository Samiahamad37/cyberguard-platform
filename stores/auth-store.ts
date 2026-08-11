"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

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

const mockUser: User = {
  id: "usr-001",
  name: "Alex Morgan",
  email: "alex.morgan@cyberguard.ai",
  role: "admin",
  twoFactorEnabled: true,
  createdAt: "2025-01-15T10:00:00.000Z",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 900));
        const token = `cg_mock_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("cg_token", token);
        }
        set({
          user: { ...mockUser, email },
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      register: async (name: string, email: string, _password: string) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1100));
        const token = `cg_mock_${Date.now()}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("cg_token", token);
        }
        set({
          user: {
            ...mockUser,
            id: `usr-${Date.now()}`,
            name,
            email,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
          },
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("cg_token");
        }
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
    }
  )
);
