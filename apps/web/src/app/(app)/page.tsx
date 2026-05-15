"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Bell, Edit, MapPin, Users, Radio } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { CircleAvatar } from "@/components/ui/circle-avatar";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  channels: Array<{ id: string; name: string; type: string }>;
}

function StoriesRibbon({ circles }: { circles: Circle[] }) {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-4 overflow-x-auto scrollbar-none pb-1">
        {circles.slice(0, 8).map((circle, i) => {
          const firstChannel = circle.channels?.[0];
          const href = firstChannel
            ? `/circles/${circle.slug}/${firstChannel.id}`
            : `/circles/${circle.slug}`;
          const isActive = i < 3;
          return (
            <Link
              key={circle.id}
              href={href}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div
                className="p-[2px] rounded-full"
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                      }
                    : { background: "transparent", border: "2px solid #e5e7eb" }
                }
              >
                <div className="bg-white rounded-full p-[2px]">
                  {circle.avatarUrl ? (
                    <img
                      src={circle.avatarUrl}
                      alt={circle.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <CircleAvatar name={circle.name} size={48} />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-600 font-medium max-w-[56px] truncate text-center">
                {circle.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function LiveCard({ circle }: { circle: Circle }) {
  const firstChannel = circle.channels?.[0];
  const href = firstChannel
    ? `/circles/${circle.slug}/${firstChannel.id}`
    : `/circles/${circle.slug}`;

  return (
    <div className="mx-4 mb-3 rounded-[18px] bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div
        className="h-24 flex items-end p-4"
        style={{
          background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            <Radio size={10} className="fill-white" />
            LIVE
          </span>
          <span className="text-white font-semibold text-sm">{circle.name}</span>
        </div>
      </div>
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            Active discussion going on
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <Users size={12} className="text-gray-400" />
            <span className="text-xs text-gray-500">
              {circle.memberCount.toLocaleString()} members
            </span>
          </div>
        </div>
        <Link
          href={href}
          className="text-xs font-semibold text-white px-4 py-2 rounded-full"
          style={{
            background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
          }}
        >
          Join
        </Link>
      </div>
    </div>
  );
}

function ActivityCard({ circle, index }: { circle: Circle; index: number }) {
  const firstChannel = circle.channels?.[0];
  const href = firstChannel
    ? `/circles/${circle.slug}/${firstChannel.id}`
    : `/circles/${circle.slug}`;

  const patterns = [
    {
      type: "event",
      render: () => (
        <div className="mx-4 mb-3 rounded-[18px] bg-white border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-3">
            {circle.avatarUrl ? (
              <img
                src={circle.avatarUrl}
                alt={circle.name}
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <CircleAvatar name={circle.name} size={28} />
            )}
            <span className="text-sm font-semibold text-gray-900">
              {circle.name}
            </span>
            <span className="ml-auto text-xs text-gray-400">2h ago</span>
          </div>
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-[#1a9deb]" />
              <span className="text-sm font-semibold text-gray-900">
                Weekend Meetup
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Saturday · 3:00 PM · Local Park
            </p>
            <div className="flex gap-2">
              <button
                className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-white"
                style={{
                  background:
                    "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                }}
              >
                Going
              </button>
              <button className="flex-1 text-xs font-semibold py-1.5 rounded-lg text-gray-600 bg-gray-100">
                Can&apos;t make it
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      type: "message",
      render: () => (
        <Link href={href}>
          <div className="mx-4 mb-3 rounded-[18px] bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              {circle.avatarUrl ? (
                <img
                  src={circle.avatarUrl}
                  alt={circle.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <CircleAvatar name={circle.name} size={28} />
              )}
              <span className="text-sm font-semibold text-gray-900">
                {circle.name}
              </span>
              <span className="ml-auto text-xs text-gray-400">5h ago</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 shrink-0">
                {circle.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-0.5">New message in #{firstChannel?.name ?? "general"}</p>
                <p className="text-sm text-gray-800 line-clamp-2">
                  Hey everyone! Quick reminder about our upcoming meetup. Really
                  excited to see you all there!
                </p>
              </div>
            </div>
          </div>
        </Link>
      ),
    },
  ];

  const pattern = patterns[index % patterns.length];
  return <>{pattern.render()}</>;
}

export default function HomePage() {
  const user = getStoredUser();

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const circles = data?.circles ?? [];

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M19 8a8 8 0 1 0 0 8"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">Circles</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell size={20} />
            </button>
            <button className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <Edit size={20} />
            </button>
            {user && (
              <Avatar
                src={user.avatarUrl}
                name={user.displayName}
                size="sm"
              />
            )}
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="p-4 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-white rounded-[18px] animate-pulse"
            />
          ))}
        </div>
      ) : circles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 8a8 8 0 1 0 0 8"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">
            No circles yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Join a circle to see activity here
          </p>
          <Link
            href="/discover"
            className="text-sm font-semibold text-white px-6 py-2.5 rounded-full"
            style={{
              background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
            }}
          >
            Discover Circles
          </Link>
        </div>
      ) : (
        <>
          {/* Stories ribbon */}
          <StoriesRibbon circles={circles} />

          {/* Divider */}
          <div className="mx-4 border-t border-gray-100 mb-3" />

          {/* Feed */}
          {circles.length > 0 && <LiveCard circle={circles[0]} />}
          {circles.slice(1).map((circle, i) => (
            <ActivityCard key={circle.id} circle={circle} index={i} />
          ))}
          {circles.length === 1 && (
            <ActivityCard circle={circles[0]} index={1} />
          )}
        </>
      )}
    </div>
  );
}
