"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginSchema, type LoginFormValues } from "@/lib/validations";
import { useAuthStore } from "@/stores/auth-store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: true },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back! Complete 2FA to continue.");
      router.push("/two-factor");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Login failed. Please try again."
      );
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Sign in</CardTitle>
        <CardDescription>
          Access your CyberGuard AI security console
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-xs text-cyan-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              className="rounded border-border"
              {...register("rememberMe")}
            />
            Remember this device
          </label>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" variant="gradient" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-cyan-400 hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
