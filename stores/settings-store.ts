"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ApiKey, NotificationPreferences, SecurityPreferences } from "@/types";
import { generateId } from "@/lib/utils";

interface SettingsState {
  notifications: NotificationPreferences;
  security: SecurityPreferences;
  apiKeys: ApiKey[];
  updateNotifications: (partial: Partial<NotificationPreferences>) => void;
  updateSecurity: (partial: Partial<SecurityPreferences>) => void;
  createApiKey: (name: string) => ApiKey;
  revokeApiKey: (id: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      notifications: {
        emailAlerts: true,
        pushNotifications: true,
        criticalOnly: false,
        weeklyDigest: true,
        threatIntelUpdates: true,
      },
      security: {
        autoScan: true,
        realTimeProtection: true,
        quarantineSuspicious: true,
        shareAnonymousTelemetry: false,
      },
      apiKeys: [
        {
          id: "key-001",
          name: "Production Integration",
          key: "cg_live_a8f3k2m9x7q1p4w6",
          createdAt: "2025-06-01T12:00:00.000Z",
          lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
          permissions: ["scan", "alerts", "reports"],
        },
      ],

      updateNotifications: (partial) =>
        set({ notifications: { ...get().notifications, ...partial } }),

      updateSecurity: (partial) =>
        set({ security: { ...get().security, ...partial } }),

      createApiKey: (name) => {
        const key: ApiKey = {
          id: generateId(),
          name,
          key: `cg_live_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`,
          createdAt: new Date().toISOString(),
          permissions: ["scan", "alerts"],
        };
        set({ apiKeys: [...get().apiKeys, key] });
        return key;
      },

      revokeApiKey: (id) =>
        set({ apiKeys: get().apiKeys.filter((k) => k.id !== id) }),
    }),
    { name: "cyberguard-settings" }
  )
);
