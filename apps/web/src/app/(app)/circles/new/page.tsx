"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "At least 2 characters").max(64),
  slug: z
    .string()
    .min(2, "At least 2 characters")
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewCirclePage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const name = watch("name", "");

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    register("name").onChange(e);
    const slug = val
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 64);
    setValue("slug", slug, { shouldValidate: true });
  }

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      const res = await api.post<{ circle: { slug: string } }>("/api/circles", data);
      router.push(`/circles/${res.circle.slug}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError("Something went wrong. Please try again.");
      }
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create a Circle</h1>
        <p className="text-gray-500 mt-1">
          Build a community around a shared interest, project, or team
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Input
            label="Circle name"
            placeholder="My Awesome Circle"
            error={errors.name?.message}
            {...register("name")}
            onChange={handleNameChange}
          />

          <Input
            label="URL slug"
            placeholder="my-awesome-circle"
            hint={`circles.app/${watch("slug", "") || "…"}`}
            error={errors.slug?.message}
            {...register("slug")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="What is this circle about?"
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              {...register("isPrivate")}
            />
            <div>
              <p className="text-sm font-medium text-gray-700">Private circle</p>
              <p className="text-xs text-gray-500">
                Only members can see this circle and its content
              </p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting} className="flex-1">
              Create Circle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
