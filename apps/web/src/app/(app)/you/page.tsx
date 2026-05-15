"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  ChevronRight,
  Files,
  Image,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { CircleAvatar } from "@/components/ui/circle-avatar";
import { api } from "@/lib/api";
import { clearAuth, getStoredUser } from "@/lib/auth";

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  channels: Array<{ id: string; name: string; type: string }>;
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500 font-medium">{label}</span>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  href,
  danger,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  href?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const className = `flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors active:bg-gray-100 ${
    danger ? "text-red-500" : "text-gray-700"
  }`;

  const inner = (
    <>
      <div
        className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
          danger ? "bg-red-50" : "bg-gray-100"
        }`}
      >
        <Icon size={16} strokeWidth={1.8} className={danger ? "text-red-500" : "text-gray-600"} />
      </div>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {!danger && <ChevronRight size={16} className="text-gray-300" />}
    </>
  );

  if (onClick) {
    return (
      <button className={`w-full ${className}`} onClick={onClick}>
        {inner}
      </button>
    );
  }

  return (
    <Link href={href ?? "#"} className={className}>
      {inner}
    </Link>
  );
}

export default function YouPage() {
  const router = useRouter();
  const user = getStoredUser();

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const circles = data?.circles ?? [];
  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleSignOut() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
    }
  }

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <h1 className="text-xl font-bold text-gray-900">You</h1>
          <Link
            href="/settings"
            className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Settings size={20} />
          </Link>
        </div>
      </header>

      {/* Profile card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.displayName}
              className="h-16 w-16 rounded-2xl object-cover shrink-0"
            />
          ) : (
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-bold text-gray-900 truncate">
              {user?.displayName ?? "Unknown"}
            </p>
            <p className="text-sm text-gray-500 truncate">
              @{user?.username ?? "unknown"}
            </p>
            {user?.bio && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="flex justify-around mt-5 pt-4 border-t border-gray-100">
          <StatBlock label="Circles" value={isLoading ? "…" : circles.length} />
          <div className="w-px bg-gray-100" />
          <StatBlock label="Events" value="0" />
          <div className="w-px bg-gray-100" />
          <StatBlock label="Photos" value="0" />
        </div>
      </div>

      {/* My Circles */}
      {circles.length > 0 && (
        <div className="mx-4 mt-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
            My Circles
          </p>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
            {circles.slice(0, 5).map((circle) => {
              const firstChannel = circle.channels?.[0];
              const href = firstChannel
                ? `/circles/${circle.slug}/${firstChannel.id}`
                : `/circles/${circle.slug}`;
              return (
                <Link
                  key={circle.id}
                  href={href}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  {circle.avatarUrl ? (
                    <img
                      src={circle.avatarUrl}
                      alt={circle.name}
                      className="h-10 w-10 rounded-xl object-cover shrink-0"
                    />
                  ) : (
                    <CircleAvatar name={circle.name} size={40} square />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {circle.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Users size={11} className="text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {circle.memberCount.toLocaleString()} members
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 shrink-0" />
                </Link>
              );
            })}
            {circles.length > 5 && (
              <Link
                href="/circles"
                className="flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#1a9deb] hover:bg-blue-50 transition-colors"
              >
                View all {circles.length} circles
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Saved items */}
      <div className="mx-4 mt-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          Saved
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          <SettingsRow icon={Bookmark} label="Saved Messages" href="#" />
          <SettingsRow icon={Image} label="Photo Albums" href="#" />
          <SettingsRow icon={Files} label="Files &amp; Links" href="#" />
        </div>
      </div>

      {/* Account settings */}
      <div className="mx-4 mt-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
          Account
        </p>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
          <SettingsRow icon={Settings} label="Settings" href="/settings" />
          <SettingsRow
            icon={LogOut}
            label="Sign Out"
            danger
            onClick={handleSignOut}
          />
        </div>
      </div>
    </div>
  );
}
