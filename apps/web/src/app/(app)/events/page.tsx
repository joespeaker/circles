"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Calendar, MapPin, Plus, Users } from "lucide-react";
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

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function buildDayStrip(): Array<{ date: Date; dayName: string; dayNum: number; isToday: boolean }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }
  return days;
}

export default function EventsPage() {
  const today = new Date();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const days = buildDayStrip();
  const selectedDay = days[selectedIdx];

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "joined"],
    queryFn: () => api.get("/api/circles?joined=true"),
  });

  const circles = data?.circles ?? [];

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 pt-3 pb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Events</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {MONTH_NAMES[today.getMonth()]} {today.getFullYear()}
            </p>
          </div>
          <Link
            href="/circles/new"
            className="h-9 w-9 flex items-center justify-center rounded-full text-white"
            style={{
              background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
            }}
          >
            <Plus size={18} strokeWidth={2.2} />
          </Link>
        </div>

        {/* Day strip */}
        <div className="flex gap-1 px-3 pb-3 overflow-x-auto scrollbar-none">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`shrink-0 flex flex-col items-center gap-0.5 w-10 py-1.5 rounded-xl transition-all ${
                selectedIdx === i
                  ? "text-white"
                  : day.isToday
                  ? "text-[#1a9deb] bg-blue-50"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
              style={
                selectedIdx === i
                  ? {
                      background:
                        "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                    }
                  : {}
              }
            >
              <span className="text-[10px] font-medium">{day.dayName}</span>
              <span className="text-sm font-bold">{day.dayNum}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Selected date label */}
      <div className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-700">
          {selectedDay.isToday
            ? "Today"
            : selectedDay.date.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
        </p>
      </div>

      {/* Empty state / content */}
      {isLoading ? (
        <div className="px-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : circles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div
            className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
            }}
          >
            <Calendar size={28} strokeWidth={1.6} className="text-white" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">No events yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            Join circles to see their events here, or create your own events
            within a circle.
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
        <div className="px-4 space-y-3 pb-6">
          {/* No-events-on-day card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
            <Calendar size={24} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-500">
              No events scheduled
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Events from your circles will appear here
            </p>
          </div>

          {/* Circles that could have events */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">
              Your circles
            </p>
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              {circles.map((circle) => {
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
                    <MapPin size={14} className="text-gray-300 shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Create event CTA */}
          <Link
            href="/circles/new"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white mt-4"
            style={{
              background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
            }}
          >
            <Plus size={16} strokeWidth={2.2} />
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}
