"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Bell, Compass, Hash, Home, LogOut, Plus, Settings } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/cn";
import { api } from "@/lib/api";
import { clearAuth, getStoredUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Circle {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  channels: Array<{ id: string; name: string }>;
}

interface Channel {
  id: string;
  name: string;
  type: string;
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="ml-auto bg-brand-600 text-white text-xs font-semibold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter();
  const user = getStoredUser();

  const { data: circlesData } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const { data: notifData } = useQuery<{ unreadCount: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/api/notifications?limit=1"),
    refetchInterval: 30_000,
  });

  async function handleLogout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      clearAuth();
      router.push("/login");
    }
  }

  const pathname = usePathname();
  const activeCircleSlug = pathname.match(/\/circles\/([^/]+)/)?.[1];

  const activeCircle = circlesData?.circles.find(
    (c) => c.slug === activeCircleSlug
  );

  return (
    <aside className="flex h-screen">
      {/* Primary sidebar */}
      <div className="flex flex-col w-16 bg-brand-950 items-center py-4 gap-2 shrink-0">
        <Link href="/" className="mb-2">
          <div className="h-9 w-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
        </Link>

        <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {circlesData?.circles.map((circle) => (
            <Link
              key={circle.id}
              href={`/circles/${circle.slug}`}
              title={circle.name}
              className={cn(
                "h-9 w-9 rounded-xl overflow-hidden transition-all hover:rounded-lg",
                activeCircleSlug === circle.slug
                  ? "ring-2 ring-brand-400 rounded-lg"
                  : ""
              )}
            >
              <Avatar
                src={circle.avatarUrl}
                name={circle.name}
                size="sm"
                className="h-9 w-9 rounded-none"
              />
            </Link>
          ))}

          <Link
            href="/circles/new"
            title="Create a circle"
            className="h-9 w-9 rounded-xl bg-brand-900 hover:bg-brand-500 transition-all hover:rounded-lg flex items-center justify-center text-brand-300 hover:text-white"
          >
            <Plus className="h-4 w-4" />
          </Link>
        </div>

        <button
          onClick={handleLogout}
          title="Log out"
          className="h-9 w-9 rounded-xl flex items-center justify-center text-brand-400 hover:text-white hover:bg-brand-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      {/* Secondary sidebar */}
      <div className="flex flex-col w-56 bg-gray-50 border-r border-gray-200">
        {activeCircle ? (
          <CirclePanel circle={activeCircle} />
        ) : (
          <MainPanel unreadCount={notifData?.unreadCount} user={user} />
        )}
      </div>
    </aside>
  );
}

function MainPanel({
  unreadCount,
  user,
}: {
  unreadCount?: number;
  user: ReturnType<typeof getStoredUser>;
}) {
  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm">Circles</h2>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        <NavItem href="/" icon={Home} label="Home" />
        <NavItem href="/circles" icon={Compass} label="Discover" />
        <NavItem
          href="/notifications"
          icon={Bell}
          label="Notifications"
          badge={unreadCount}
        />
        <NavItem href="/settings" icon={Settings} label="Settings" />
      </nav>

      {user && (
        <div className="p-3 border-t border-gray-200 flex items-center gap-2">
          <Avatar src={user.avatarUrl} name={user.displayName} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          </div>
        </div>
      )}
    </>
  );
}

function CirclePanel({ circle }: { circle: Circle }) {
  const pathname = usePathname();

  const { data } = useQuery<{ circle: { channels: Channel[] } }>({
    queryKey: ["circle", circle.slug],
    queryFn: () => api.get(`/api/circles/${circle.slug}`),
  });

  const channels = data?.circle.channels || circle.channels || [];

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900 text-sm truncate">{circle.name}</h2>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <div className="mb-1">
          <p className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Channels
          </p>
          {channels.map((channel) => {
            const href = `/circles/${circle.slug}/${channel.id}`;
            const active = pathname === href;
            return (
              <Link
                key={channel.id}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Hash className="h-3.5 w-3.5 shrink-0" />
                {channel.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
