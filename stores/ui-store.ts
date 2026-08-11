"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (value: boolean) => void;
  setSidebarMobileOpen: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      darkMode: true,

      toggleSidebar: () =>
        set({ sidebarCollapsed: !get().sidebarCollapsed }),

      setSidebarCollapsed: (value) => set({ sidebarCollapsed: value }),

      setSidebarMobileOpen: (value) => set({ sidebarMobileOpen: value }),

      setDarkMode: (value) => {
        set({ darkMode: value });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", value);
        }
      },

      toggleDarkMode: () => {
        const next = !get().darkMode;
        get().setDarkMode(next);
      },
    }),
    {
      name: "cyberguard-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        darkMode: state.darkMode,
      }),
    }
  )
);
