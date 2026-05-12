"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { setAuth, AuthUser } from "@/lib/auth";

const schema = z.object({
  displayName: z.string().min(1, "Name is required").max(64),
  username: z
    .string()
    .min(3, "At least 3 characters")
    .max(32)
    .regex(/^[a-z0-9_-]+$/i, "Letters, numbers, underscores, and hyphens only"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const res = await api.post<{ user: AuthUser; token: string }>(
        "/api/auth/register",
        data
      );
      setAuth(res.token, res.user);
      router.push("/");
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-sm text-gray-500 mb-6">Join your first circle today</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Input
          label="Display name"
          placeholder="Jane Smith"
          error={errors.displayName?.message}
          {...register("displayName")}
        />

        <Input
          label="Username"
          placeholder="janesmith"
          hint="Lowercase letters, numbers, underscores, hyphens"
          error={errors.username?.message}
          {...register("username")}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          hint="At least 8 characters"
          error={errors.password?.message}
          {...register("password")}
        />

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
