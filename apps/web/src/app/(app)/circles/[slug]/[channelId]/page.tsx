"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState, useCallback } from "react";
import { Hash, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useSocket } from "@/hooks/use-socket";
import { MessageList, type ChatMessage } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";

interface Channel {
  id: string;
  name: string;
  description: string | null;
}

interface CircleDetail {
  id: string;
  name: string;
  slug: string;
  isMember: boolean;
  channels: Channel[];
}

export default function ChannelPage() {
  const { slug, channelId } = useParams<{ slug: string; channelId: string }>();
  const currentUser = getStoredUser();
  const socketRef = useSocket();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);

  const { data: circleData } = useQuery<{ circle: CircleDetail }>({
    queryKey: ["circle", slug],
    queryFn: () => api.get(`/api/circles/${slug}`),
  });

  const { data: historyData, isLoading } = useQuery<{ messages: ChatMessage[] }>({
    queryKey: ["messages", channelId],
    queryFn: () => api.get(`/api/channels/${channelId}/messages`),
    enabled: !!channelId,
  });

  useEffect(() => {
    if (historyData?.messages) {
      setMessages(historyData.messages);
    }
  }, [historyData]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    function onConnect() {
      setConnected(true);
      socket!.emit("channel:join", channelId);
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onMessage(msg: ChatMessage) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    }

    if (socket.connected) {
      setConnected(true);
      socket.emit("channel:join", channelId);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message:new", onMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message:new", onMessage);
      socket.emit("channel:leave", channelId);
    };
  }, [channelId, socketRef]);

  const handleSend = useCallback(
    (content: string) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;
      socket.emit("message:send", { channelId, content });
    },
    [channelId, socketRef]
  );

  const circle = circleData?.circle;
  const channel = circle?.channels.find((c) => c.id === channelId);
  const isMember = circle?.isMember ?? false;

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <h1 className="font-semibold text-gray-900 text-sm leading-none">
              {channel?.name ?? "…"}
            </h1>
            {channel?.description && (
              <p className="text-xs text-gray-500 mt-0.5">{channel.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          {connected ? (
            <>
              <Wifi className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-600 hidden sm:inline">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-gray-400 hidden sm:inline">Connecting…</span>
            </>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-gray-400">Loading messages…</div>
        </div>
      ) : (
        <MessageList messages={messages} currentUserId={currentUser?.id} />
      )}

      <MessageInput
        channelName={channel?.name ?? "channel"}
        onSend={handleSend}
        disabled={!isMember || !connected}
      />
    </div>
  );
}
