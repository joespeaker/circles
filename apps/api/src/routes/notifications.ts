import { Router } from "express";
import { prisma } from "@circles/database";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const notificationsRouter = Router();

notificationsRouter.get("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const onlyUnread = req.query.unread === "true";

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(onlyUnread ? { read: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  res.json({ notifications, unreadCount });
});

notificationsRouter.patch("/:id/read", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const notification = await prisma.notification.findUnique({
    where: { id: req.params.id },
  });

  if (!notification || notification.userId !== userId) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  const updated = await prisma.notification.update({
    where: { id: req.params.id },
    data: { read: true },
  });

  res.json({ notification: updated });
});

notificationsRouter.post("/read-all", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });

  res.json({ message: "All notifications marked as read" });
});
