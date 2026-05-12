import { Router } from "express";
import { z } from "zod";
import { prisma } from "@circles/database";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const usersRouter = Router();

const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(64).optional(),
  bio: z.string().max(500).optional(),
  statusMessage: z.string().max(128).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

usersRouter.get("/:id", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      statusMessage: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

usersRouter.patch("/:id", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  if (req.params.id !== userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const body = updateProfileSchema.parse(req.body);

  const user = await prisma.user.update({
    where: { id: userId },
    data: body,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      statusMessage: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json({ user });
});
