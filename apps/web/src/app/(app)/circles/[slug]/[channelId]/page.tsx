"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Hash } from "lucide-react";
import { api } from "@/lib/api";

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
  channels: Channel[];
}

export default function ChannelPage() {
  const { slug, channelId } = useParams<{ slug: string; channelId: string }>();

  const { data } = useQuery<{ circle: CircleDetail }>({
    queryKey: ["circle", slug],
    queryFn: () => api.get(`/api/circles/${slug}`),
  });

  const channel = data?.circle.channels.find((c) => c.id === channelId);

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 bg-white shrink-0">
        <Hash className="h-5 w-5 text-gray-400" />
        <div>
          <h1 className="font-semibold text-gray-900">{channel?.name ?? "…"}</h1>
          {channel?.description && (
            <p className="text-xs text-gray-500">{channel.description}</p>
          )}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center text-center p-8">
        <div className="max-w-sm">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 mb-4">
            <Hash className="h-7 w-7 text-brand-500" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">
            Welcome to #{channel?.name ?? "this channel"}
          </h2>
          <p className="text-sm text-gray-500">
            This is the beginning of the{" "}
            <strong>#{channel?.name ?? "channel"}</strong> channel.
            Real-time messaging is coming in the next release.
          </p>
        </div>
      </div>
    </div>
  );
}
