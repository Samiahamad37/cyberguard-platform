import { sleep } from "@/lib/utils";

/**
 * Auth service stubs for future FastAPI / OAuth integration.
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  await sleep(1000);
  return {
    message: `If an account exists for ${email}, a reset link has been sent.`,
  };
}

export async function verifyTwoFactorCode(
  code: string
): Promise<{ success: boolean; message: string }> {
  await sleep(800);
  const success = code === "123456" || /^\d{6}$/.test(code);
  return {
    success,
    message: success
      ? "Two-factor authentication verified successfully."
      : "Invalid verification code. Please try again.",
  };
}

export async function refreshSession(): Promise<{ token: string; expiresAt: string }> {
  await sleep(300);
  return {
    token: `cg_mock_${Date.now()}`,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
  };
}
