"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { CircleCard } from "@/components/circles/circle-card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  isPrivate: boolean;
  inviteOnly: boolean;
  isMember: boolean;
}

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [joiningSlug, setJoiningSlug] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "discover", search],
    queryFn: () =>
      api.get(`/api/circles${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  });

  const joinMutation = useMutation({
    mutationFn: (slug: string) => api.post(`/api/circles/${slug}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      setJoiningSlug(null);
    },
  });

  function handleJoin(slug: string) {
    setJoiningSlug(slug);
    joinMutation.mutate(slug);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discover Circles</h1>
        <p className="text-gray-500 mt-1">Find communities around your interests</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search circles…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data?.circles.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="font-medium text-gray-900">No circles found</p>
          <p className="text-sm mt-1">Try a different search or create your own</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.circles.map((circle) => (
            <CircleCard
              key={circle.id}
              circle={circle}
              onJoin={handleJoin}
              joining={joiningSlug === circle.slug && joinMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
