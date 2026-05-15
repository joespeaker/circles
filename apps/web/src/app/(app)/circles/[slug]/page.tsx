"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Hash, Lock, Users } from "lucide-react";
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

const ANNOUNCEMENT_TABS = ["Posts", "Events", "Members", "About"] as const;
const NORMAL_TABS = ["Chat", "Events", "Media", "Members"] as const;

export default function CirclePage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentUser = getStoredUser();
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

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

  const isAnnouncementOnly =
    circle.channels.length > 0 &&
    circle.channels.every((c) => c.type === "ANNOUNCEMENT");

  const tabs = isAnnouncementOnly ? ANNOUNCEMENT_TABS : NORMAL_TABS;
  const textChannels = circle.channels.filter((c) => c.type !== "VOICE");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Circle info card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
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
                <h1 className="text-xl font-bold text-gray-900">
                  {circle.name}
                </h1>
                {isAnnouncementOnly && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Lock size={10} />
                    Announcements
                  </span>
                )}
                {circle.isPrivate && <Badge variant="warning">Private</Badge>}
                {circle.inviteOnly && (
                  <Badge variant="info">Invite Only</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <Users className="h-4 w-4" />
                <span>{circle.memberCount.toLocaleString()} members</span>
              </div>
              {circle.description && (
                <p className="text-sm text-gray-600 mt-2">
                  {circle.description}
                </p>
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

      {/* Tab bar */}
      <div className="flex bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === i
                ? "text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            style={
              activeTab === i
                ? {
                    background:
                      "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                  }
                : {}
            }
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {isAnnouncementOnly ? "Announcement Channels" : "Channels"}
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
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {channel.name}
                    </p>
                    {channel.description && (
                      <p className="text-xs text-gray-500">
                        {channel.description}
                      </p>
                    )}
                  </div>
                  {isAnnouncementOnly && (
                    <Lock size={12} className="text-gray-300 shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          )}

          {/* Locked composer for announcement-only circles */}
          {isAnnouncementOnly && (
            <div className="mt-6 flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-2xl border border-gray-200">
              <Lock size={16} className="text-gray-400 shrink-0" />
              <p className="text-sm text-gray-400 flex-1">
                Only admins can post here
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 1 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-gray-400"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No events yet</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Events created in this circle will appear here
          </p>
        </div>
      )}

      {activeTab === 2 && !isAnnouncementOnly && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-gray-400"
            >
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">No media yet</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Photos and videos shared in this circle will appear here
          </p>
        </div>
      )}

      {(activeTab === 3 || (isAnnouncementOnly && activeTab === 2)) && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <Users size={22} className="text-gray-400" />
          </div>
          <p className="text-sm font-semibold text-gray-700">
            {circle.memberCount.toLocaleString()} members
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Member list is managed by admins
          </p>
        </div>
      )}

      {isAnnouncementOnly && activeTab === 3 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="text-gray-400"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l2 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">About this circle</p>
          {circle.description ? (
            <p className="text-sm text-gray-600 mt-2 max-w-sm">
              {circle.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">
              No description provided
            </p>
          )}
        </div>
      )}
    </div>
  );
}
