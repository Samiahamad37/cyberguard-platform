"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  passwordChangeSchema,
  profileSchema,
} from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";
import { useSettingsStore } from "@/stores/settings-store";
import { maskApiKey, formatDate } from "@/lib/utils";
import { z } from "zod";
import { mockDevices } from "@/lib/mock-data/dashboard";

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordChangeSchema>;

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const {
    notifications,
    security,
    apiKeys,
    updateNotifications,
    updateSecurity,
    createApiKey,
    revokeApiKey,
  } = useSettingsStore();
  const { theme, setTheme } = useTheme();
  const [newKeyName, setNewKeyName] = useState("");

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: {
      name: user?.name || "Alex Morgan",
      email: user?.email || "alex.morgan@cyberguard.ai",
    },
  });

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordChangeSchema),
  });

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage profile, security, notifications, and API access"
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="appearance">Dark Mode</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your account identity</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="max-w-lg space-y-4"
                onSubmit={profileForm.handleSubmit((data) => {
                  updateUser(data);
                  toast.success("Profile updated");
                })}
              >
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...profileForm.register("name")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...profileForm.register("email")} />
                </div>
                <Button type="submit" variant="gradient">
                  Save profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                className="max-w-lg space-y-4"
                onSubmit={passwordForm.handleSubmit(() => {
                  toast.success("Password updated (mock)");
                  passwordForm.reset();
                })}
              >
                <div className="space-y-2">
                  <Label>Current password</Label>
                  <PasswordInput
                    {...passwordForm.register("currentPassword")}
                  />
                </div>
                <div className="space-y-2">
                  <Label>New password</Label>
                  <PasswordInput
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-xs text-red-400">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Confirm password</Label>
                  <PasswordInput
                    {...passwordForm.register("confirmPassword")}
                  />
                </div>
                <Button type="submit" variant="gradient">
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(
                [
                  ["emailAlerts", "Email alerts"],
                  ["pushNotifications", "Push notifications"],
                  ["criticalOnly", "Critical alerts only"],
                  ["weeklyDigest", "Weekly security digest"],
                  ["threatIntelUpdates", "Threat intelligence updates"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={notifications[key]}
                    onCheckedChange={(checked) => {
                      updateNotifications({ [key]: checked });
                      toast.success("Preferences saved");
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Keys for future FastAPI / SOC integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  placeholder="Key name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
                <Button
                  variant="gradient"
                  onClick={() => {
                    if (!newKeyName.trim()) {
                      toast.error("Enter a key name");
                      return;
                    }
                    const key = createApiKey(newKeyName.trim());
                    setNewKeyName("");
                    toast.success(`Created key: ${key.key}`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  Create key
                </Button>
              </div>

              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <KeyRound className="h-4 w-4 text-cyan-400" />
                        <p className="font-medium">{key.name}</p>
                      </div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {maskApiKey(key.key)}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Created {formatDate(key.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(key.key);
                          toast.success("API key copied");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          revokeApiKey(key.id);
                          toast.success("API key revoked");
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>
                Devices associated with your account session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockDevices.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.os} · {d.ipAddress}
                    </p>
                  </div>
                  <span className="capitalize text-muted-foreground">
                    {d.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Dark mode is recommended for SOC workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <Label>Dark mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Currently: {theme === "dark" ? "Dark" : "Light"}
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {(
                [
                  ["autoScan", "Automatic device scanning"],
                  ["realTimeProtection", "Real-time protection"],
                  ["quarantineSuspicious", "Auto-quarantine suspicious files"],
                  ["shareAnonymousTelemetry", "Share anonymous telemetry"],
                ] as const
              ).map(([key, label]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <Label htmlFor={key}>{label}</Label>
                  <Switch
                    id={key}
                    checked={security[key]}
                    onCheckedChange={(checked) => {
                      updateSecurity({ [key]: checked });
                      toast.success("Security preference updated");
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
