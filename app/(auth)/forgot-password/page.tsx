"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/lib/validations";
import { requestPasswordReset } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const res = await requestPasswordReset(data.email);
      setSent(true);
      toast.success(res.message);
    } catch {
      toast.error("Unable to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          We&apos;ll email you a secure reset link
        </CardDescription>
      </CardHeader>
      {sent ? (
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Check your inbox for reset instructions. The link expires in 30
            minutes.
          </p>
          <Button asChild variant="gradient" className="w-full">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" variant="gradient" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <Link
              href="/login"
              className="text-center text-sm text-cyan-400 hover:underline"
            >
              Back to login
            </Link>
          </CardFooter>
        </form>
      )}
    </Card>
  );
}
