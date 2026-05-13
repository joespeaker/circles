import { useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/avatar";

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  editedAt: string | null;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function isSameAuthorAndClose(a: ChatMessage, b: ChatMessage) {
  return (
    a.author.id === b.author.id &&
    Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) < 5 * 60_000
  );
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        No messages yet. Say hello!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
      {messages.map((msg, i) => {
        const prev = messages[i - 1];
        const grouped = prev && isSameAuthorAndClose(prev, msg);
        const showDateDivider = !prev || !isSameDay(prev.createdAt, msg.createdAt);
        const isOwn = msg.author.id === currentUserId;

        return (
          <div key={msg.id}>
            {showDateDivider && (
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">
                  {formatDate(msg.createdAt)}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            )}

            <div className="flex items-start gap-3 group hover:bg-gray-50 rounded-lg px-2 py-0.5 -mx-2">
              <div className="w-8 shrink-0 mt-0.5">
                {!grouped ? (
                  <Avatar
                    src={msg.author.avatarUrl}
                    name={msg.author.displayName}
                    size="sm"
                  />
                ) : null}
              </div>

              <div className="flex-1 min-w-0">
                {!grouped && (
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span
                      className={`text-sm font-semibold ${isOwn ? "text-brand-700" : "text-gray-900"}`}
                    >
                      {msg.author.displayName}
                    </span>
                    <span className="text-xs text-gray-400">{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <p className="text-sm text-gray-800 break-words leading-relaxed">
                  {msg.content}
                </p>
              </div>

              {grouped && (
                <span className="text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1">
                  {formatTime(msg.createdAt)}
                </span>
              )}
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
