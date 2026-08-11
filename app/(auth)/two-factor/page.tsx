"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
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
import { twoFactorSchema, type TwoFactorFormValues } from "@/lib/validations";
import { verifyTwoFactorCode } from "@/services/auth.service";
import { useAuthStore } from "@/stores/auth-store";

export default function TwoFactorPage() {
  const router = useRouter();
  const setTwoFactorVerified = useAuthStore((s) => s.setTwoFactorVerified);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorSchema),
  });

  const onSubmit = async (data: TwoFactorFormValues) => {
    const res = await verifyTwoFactorCode(data.code);
    if (res.success) {
      setTwoFactorVerified();
      toast.success(res.message);
      router.push("/dashboard");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/15">
          <ShieldCheck className="h-6 w-6 text-cyan-400" />
        </div>
        <CardTitle>Two-factor authentication</CardTitle>
        <CardDescription>
          Enter the 6-digit code from your authenticator app
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="text-center text-2xl tracking-[0.4em]"
              maxLength={6}
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-red-400">{errors.code.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Demo tip: any 6-digit code works (e.g. 123456).
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            className="w-full"
            variant="gradient"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify & continue"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
