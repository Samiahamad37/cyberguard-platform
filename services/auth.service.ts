import type { User } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/login", {
    email,
    password,
  });
  return data;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const { data } = await apiClient.get<User>("/auth/me");
  return data;
}

export async function requestPasswordReset(
  email: string
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    "/auth/forgot-password",
    { email }
  );
  return data;
}

export async function verifyTwoFactorCode(
  code: string
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.post<{ success: boolean; message: string }>(
    "/auth/2fa/verify",
    { code }
  );
  return data;
}

export async function refreshSession(): Promise<{
  token: string;
  expiresAt: string;
}> {
  await fetchCurrentUser();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cg_token") || "" : "";
  return {
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };
}
