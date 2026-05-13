"use client";

import { useEffect, useRef } from "react";
import { io, type Socket } from "socket.io-client";
import { getToken } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

let sharedSocket: Socket | null = null;
let refCount = 0;

function getSocket(): Socket {
  if (!sharedSocket || !sharedSocket.connected) {
    sharedSocket = io(API_URL, {
      auth: { token: getToken() },
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  }
  return sharedSocket;
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    refCount++;
    const socket = getSocket();
    socketRef.current = socket;

    return () => {
      refCount--;
      if (refCount === 0 && sharedSocket) {
        sharedSocket.disconnect();
        sharedSocket = null;
      }
    };
  }, []);

  return socketRef;
}
