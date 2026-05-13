import { Router } from "express";
import { prisma } from "@circles/database";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const messagesRouter = Router();

messagesRouter.get("/:channelId/messages", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const before = req.query.before as string | undefined;

  const channel = await prisma.channel.findUnique({
    where: { id: req.params.channelId },
    include: { circle: { include: { memberships: { where: { userId } } } } },
  });

  if (!channel) {
    res.status(404).json({ error: "Channel not found" });
    return;
  }

  if (channel.circle.isPrivate && channel.circle.memberships.length === 0) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const messages = await prisma.message.findMany({
    where: {
      channelId: req.params.channelId,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
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

  res.json({ messages: messages.reverse() });
});
