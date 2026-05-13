"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight, Compass, Plus } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  channels: Array<{ id: string; name: string }>;
}

export default function HomePage() {
  const user = getStoredUser();

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const circles = data?.circles ?? [];
  const firstName = user?.displayName.split(" ")[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h1>
        <p className="text-gray-500 mt-1">Pick up where you left off</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : circles.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 mb-4">
            <Compass className="h-6 w-6 text-brand-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">No circles yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
            Join an existing circle or create your own to get started.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/circles">
              <Button variant="secondary">
                <Compass className="h-4 w-4 mr-2" />
                Discover
              </Button>
            </Link>
            <Link href="/circles/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Circle
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {circles.map((circle) => {
            const firstChannel = circle.channels?.[0];
            return (
              <Link
                key={circle.id}
                href={
                  firstChannel
                    ? `/circles/${circle.slug}/${firstChannel.id}`
                    : `/circles/${circle.slug}`
                }
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <Avatar src={circle.avatarUrl} name={circle.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{circle.name}</p>
                  {circle.description && (
                    <p className="text-sm text-gray-500 truncate">
                      {circle.description}
                    </p>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
