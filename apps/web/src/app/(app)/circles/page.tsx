"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Edit, Search } from "lucide-react";
import { CircleAvatar } from "@/components/ui/circle-avatar";
import { api } from "@/lib/api";

interface Circle {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  memberCount: number;
  channels: Array<{ id: string; name: string; type: string }>;
}

const FILTER_PILLS = ["All", "Unread", "Live", "Events"] as const;
type Filter = (typeof FILTER_PILLS)[number];

function StoriesRibbon({ circles }: { circles: Circle[] }) {
  return (
    <div className="px-4 pt-2 pb-3">
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
        {circles.slice(0, 6).map((circle, i) => {
          const isActive = i < 2;
          const firstChannel = circle.channels?.[0];
          const href = firstChannel
            ? `/circles/${circle.slug}/${firstChannel.id}`
            : `/circles/${circle.slug}`;
          return (
            <Link
              key={circle.id}
              href={href}
              className="flex flex-col items-center gap-1 shrink-0"
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
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <CircleAvatar name={circle.name} size={40} />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-gray-600 font-medium max-w-[48px] truncate text-center">
                {circle.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

const PLACEHOLDER_TIMES = ["2m", "15m", "1h", "3h", "Yesterday", "Mon"];
const PLACEHOLDER_PREVIEWS = [
  "Looking forward to seeing everyone!",
  "Did anyone catch the game last night?",
  "New photos just added to the album",
  "Meeting is confirmed for Saturday",
  "Thanks for organizing this!",
  "Great discussion, see you all soon",
];

function CircleRow({
  circle,
  index,
}: {
  circle: Circle;
  index: number;
}) {
  const firstChannel = circle.channels?.[0];
  const href = firstChannel
    ? `/circles/${circle.slug}/${firstChannel.id}`
    : `/circles/${circle.slug}`;
  const time = PLACEHOLDER_TIMES[index % PLACEHOLDER_TIMES.length];
  const preview = PLACEHOLDER_PREVIEWS[index % PLACEHOLDER_PREVIEWS.length];
  const unread = index % 3 === 0 ? index + 1 : 0;

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      {circle.avatarUrl ? (
        <img
          src={circle.avatarUrl}
          alt={circle.name}
          className="h-[52px] w-[52px] rounded-2xl object-cover shrink-0"
        />
      ) : (
        <CircleAvatar name={circle.name} size={52} square />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="font-semibold text-gray-900 text-[15px] truncate">
            {circle.name}
          </span>
          <span className="text-xs text-gray-400 shrink-0 ml-2">{time}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 truncate">{preview}</span>
          {unread > 0 && (
            <span
              className="ml-2 shrink-0 h-5 min-w-[20px] flex items-center justify-center text-[11px] font-bold text-white rounded-full px-1.5"
              style={{
                background:
                  "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              {unread}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function CirclesPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const circles = data?.circles ?? [];

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <h1 className="text-xl font-bold text-gray-900">Circles</h1>
          <div className="flex items-center gap-1">
            <button className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors">
              <Search size={20} />
            </button>
            <Link
              href="/circles/new"
              className="h-9 w-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Edit size={20} />
            </Link>
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
          {FILTER_PILLS.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`shrink-0 text-sm font-semibold px-4 py-1.5 rounded-full transition-all ${
                activeFilter === pill
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={
                activeFilter === pill
                  ? {
                      background:
                        "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                    }
                  : {}
              }
            >
              {pill}
            </button>
          ))}
        </div>
      </header>

      {isLoading ? (
        <div className="space-y-0 divide-y divide-gray-100">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-[52px] w-[52px] rounded-2xl bg-gray-100 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : circles.length === 0 ? (
        <>
          <div className="px-4 pt-3">
            <StoriesRibbon circles={[]} />
          </div>
          <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background:
                  "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
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
              Join a circle to start chatting
            </p>
            <Link
              href="/discover"
              className="text-sm font-semibold text-white px-6 py-2.5 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              Discover Circles
            </Link>
          </div>
        </>
      ) : (
        <>
          <StoriesRibbon circles={circles} />
          <div className="divide-y divide-gray-100">
            {circles.map((circle, i) => (
              <CircleRow key={circle.id} circle={circle} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
