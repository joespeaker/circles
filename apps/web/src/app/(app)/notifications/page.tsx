"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  MENTION: "Mention",
  NEW_MESSAGE: "New message",
  CIRCLE_INVITE: "Circle invite",
  MEMBER_JOINED: "New member",
  SYSTEM: "System",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{
    notifications: Notification[];
    unreadCount: number;
  }>({
    queryKey: ["notifications"],
    queryFn: () => api.get("/api/notifications"),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/api/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAllMutation = useMutation({
    mutationFn: () => api.post("/api/notifications/read-all"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => readAllMutation.mutate()}
            loading={readAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
            <BellOff className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">All caught up</h3>
          <p className="text-sm text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "flex items-start gap-4 px-4 py-3 rounded-xl border transition-colors cursor-default",
                notif.read
                  ? "bg-white border-gray-200"
                  : "bg-brand-50 border-brand-200"
              )}
              onClick={() => {
                if (!notif.read) markReadMutation.mutate(notif.id);
              }}
            >
              <div
                className={cn(
                  "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                  notif.read ? "bg-gray-100" : "bg-brand-100"
                )}
              >
                <Bell
                  className={cn(
                    "h-4 w-4",
                    notif.read ? "text-gray-400" : "text-brand-600"
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={cn(
                      "text-sm",
                      notif.read ? "text-gray-700" : "text-gray-900 font-medium"
                    )}
                  >
                    {notif.title}
                  </p>
                  <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                {notif.body && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notif.body}
                  </p>
                )}
                <span className="inline-block mt-1 text-xs text-gray-400">
                  {TYPE_LABELS[notif.type] ?? notif.type}
                </span>
              </div>

              {!notif.read && (
                <div className="h-2 w-2 rounded-full bg-brand-500 shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
