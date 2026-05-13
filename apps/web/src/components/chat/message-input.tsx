"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/cn";

interface MessageInputProps {
  channelName: string;
  onSend: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ channelName, onSend, disabled }: MessageInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  return (
    <div className="px-4 pb-4 pt-2 shrink-0">
      <div
        className={cn(
          "flex items-end gap-2 rounded-xl border bg-white px-3 py-2 shadow-sm",
          "focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500",
          disabled ? "border-gray-200 opacity-50" : "border-gray-300"
        )}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={disabled ? "Join to send messages" : `Message #${channelName}`}
          disabled={disabled}
          className="flex-1 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none leading-relaxed max-h-[200px]"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || disabled}
          className={cn(
            "shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
            value.trim() && !disabled
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          )}
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="text-[11px] text-gray-400 mt-1 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
