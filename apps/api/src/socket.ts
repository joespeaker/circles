import { Server, type Socket } from "socket.io";
import type { IncomingMessage, ServerResponse, Server as HttpServer } from "http";
import { prisma } from "@circles/database";
import { verifyToken } from "./lib/jwt";

interface AuthenticatedSocket extends Socket {
  data: {
    userId: string;
    displayName: string;
    username: string;
    avatarUrl: string | null;
  };
}

export function initSocket(
  httpServer: HttpServer<typeof IncomingMessage, typeof ServerResponse>
) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error("Unauthorized"));
    }
    try {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, displayName: true, username: true, avatarUrl: true },
      });
      if (!user) return next(new Error("Unauthorized"));
      (socket as AuthenticatedSocket).data = user;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const s = socket as AuthenticatedSocket;

    s.on("channel:join", (channelId: string) => {
      s.join(channelId);
    });

    s.on("channel:leave", (channelId: string) => {
      s.leave(channelId);
    });

    s.on(
      "message:send",
      async (
        { channelId, content }: { channelId: string; content: string },
        ack?: (err: string | null, message?: object) => void
      ) => {
        if (!content?.trim()) return;

        try {
          const membership = await prisma.membership.findFirst({
            where: { userId: s.data.userId, circle: { channels: { some: { id: channelId } } } },
          });

          if (!membership) {
            ack?.("Not a member of this circle");
            return;
          }

          const message = await prisma.message.create({
            data: {
              channelId,
              authorId: s.data.userId,
              content: content.trim().slice(0, 4000),
            },
            select: {
              id: true,
              content: true,
              createdAt: true,
              editedAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                },
              },
            },
          });

          io.to(channelId).emit("message:new", message);
          ack?.(null, message);
        } catch (err) {
          console.error("message:send error", err);
          ack?.("Failed to send message");
        }
      }
    );
  });

  return io;
}
