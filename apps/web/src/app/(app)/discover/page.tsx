"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { CircleAvatar } from "@/components/ui/circle-avatar";
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
  channels: Array<{ id: string; name: string; type: string }>;
}

const CATEGORIES = [
  "All",
  "Sports",
  "Tech",
  "Music",
  "Art",
  "Food",
  "Gaming",
  "Outdoors",
  "Books",
  "Travel",
];

function CircleCard({ circle }: { circle: Circle }) {
  return (
    <Link
      href={`/circles/${circle.slug}`}
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
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-gray-900 text-[15px] truncate">
            {circle.name}
          </span>
          {circle.isPrivate && (
            <span className="shrink-0 text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
              Private
            </span>
          )}
        </div>
        {circle.description ? (
          <p className="text-sm text-gray-500 truncate">{circle.description}</p>
        ) : (
          <p className="text-sm text-gray-400">
            {circle.memberCount.toLocaleString()} members
          </p>
        )}
      </div>
      {circle.isMember ? (
        <span className="shrink-0 text-xs font-semibold text-[#1a9deb] bg-blue-50 px-3 py-1.5 rounded-full">
          Joined
        </span>
      ) : !circle.inviteOnly ? (
        <span
          className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
          }}
        >
          Join
        </span>
      ) : null}
    </Link>
  );
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const { data, isLoading } = useQuery<{ circles: Circle[] }>({
    queryKey: ["circles", "discover"],
    queryFn: () => api.get("/api/circles"),
  });

  const allCircles = data?.circles ?? [];

  const filtered = allCircles.filter((c) => {
    if (!query) return true;
    return (
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description?.toLowerCase().includes(query.toLowerCase())
    );
  });

  return (
    <div className="max-w-lg mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="px-4 pt-3 pb-2">
          <h1 className="text-xl font-bold text-gray-900 mb-3">Discover</h1>
          {/* Search bar */}
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search circles…"
              className="w-full h-10 pl-9 pr-9 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1a9deb]/30 focus:bg-white transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-sm font-semibold px-3.5 py-1.5 rounded-full transition-all ${
                  activeCategory === cat
                    ? "text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                style={
                  activeCategory === cat
                    ? {
                        background:
                          "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
                      }
                    : {}
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Results */}
      <div className="bg-white mt-2 mx-2 rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="h-[52px] w-[52px] rounded-2xl bg-gray-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
              }}
            >
              <Search size={24} strokeWidth={1.8} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">
              No circles found
            </h3>
            <p className="text-sm text-gray-500">
              {query
                ? `No results for "${query}"`
                : "No circles to discover yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        )}
      </div>

      {/* Create CTA */}
      <div className="mx-4 mt-4 mb-6">
        <Link
          href="/circles/new"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #1a9deb 0%, #1abf7a 100%)",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 5v14M5 12h14"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
          Create a Circle
        </Link>
      </div>
    </div>
  );
}
