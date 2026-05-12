"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hash, Users } from "lucide-react";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useState } from "react";

interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: string;
}

interface CircleDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  memberCount: number;
  isPrivate: boolean;
  inviteOnly: boolean;
  isMember: boolean;
  role: string | null;
  channels: Channel[];
}

export default function CirclePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ circle: CircleDetail }>({
    queryKey: ["circle", slug],
    queryFn: () => api.get(`/api/circles/${slug}`),
  });

  const joinMutation = useMutation({
    mutationFn: () => api.post(`/api/circles/${slug}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      queryClient.invalidateQueries({ queryKey: ["circle", slug] });
    },
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.delete(`/api/circles/${slug}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["circles"] });
      router.push("/");
    },
    onError: (err) => {
      if (err instanceof ApiError) setError(err.message);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-8 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const circle = data?.circle;
  if (!circle) return null;

  const textChannels = circle.channels.filter((c) => c.type !== "VOICE");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        {circle.bannerUrl && (
          <div
            className="h-32 bg-cover bg-center"
            style={{ backgroundImage: `url(${circle.bannerUrl})` }}
          />
        )}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Avatar src={circle.avatarUrl} name={circle.name} size="xl" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{circle.name}</h1>
                {circle.isPrivate && <Badge variant="warning">Private</Badge>}
                {circle.inviteOnly && <Badge variant="info">Invite Only</Badge>}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Users className="h-4 w-4" />
                <span>{circle.memberCount.toLocaleString()} members</span>
              </div>
              {circle.description && (
                <p className="text-sm text-gray-600 mt-2">{circle.description}</p>
              )}
            </div>
            <div className="shrink-0">
              {circle.isMember ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => leaveMutation.mutate()}
                  loading={leaveMutation.isPending}
                >
                  Leave
                </Button>
              ) : (
                !circle.inviteOnly && (
                  <Button
                    size="sm"
                    onClick={() => joinMutation.mutate()}
                    loading={joinMutation.isPending}
                  >
                    Join
                  </Button>
                )
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Channels
        </h2>
        {textChannels.length === 0 ? (
          <p className="text-sm text-gray-500">No channels yet.</p>
        ) : (
          <div className="space-y-1">
            {textChannels.map((channel) => (
              <Link
                key={channel.id}
                href={`/circles/${circle.slug}/${channel.id}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-gray-200 hover:border-brand-300 hover:shadow-sm transition-all group"
              >
                <Hash className="h-4 w-4 text-gray-400 group-hover:text-brand-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{channel.name}</p>
                  {channel.description && (
                    <p className="text-xs text-gray-500">{channel.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
