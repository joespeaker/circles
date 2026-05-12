import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@circles/database";
import { signToken } from "../lib/jwt";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_-]+$/i, "Username may only contain letters, numbers, underscores, and hyphens"),
  displayName: z.string().min(1).max(64),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/register", async (req, res) => {
  const body = registerSchema.parse(req.body);

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: body.email.toLowerCase() },
        { username: body.username.toLowerCase() },
      ],
    },
  });

  if (existing) {
    const field = existing.email === body.email.toLowerCase() ? "email" : "username";
    res.status(409).json({ error: `That ${field} is already taken` });
    return;
  }

  const passwordHash = await bcrypt.hash(body.password, 12);

  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      username: body.username.toLowerCase(),
      displayName: body.displayName,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      bio: true,
      statusMessage: true,
      createdAt: true,
    },
  });

  const token = signToken({ userId: user.id, email: user.email });
  res.status(201).json({ user, token });
});

authRouter.post("/login", async (req, res) => {
  const body = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
  });

  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true, lastSeenAt: new Date() },
  });

  const token = signToken({ userId: user.id, email: user.email });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser, token });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

authRouter.post("/logout", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeenAt: new Date() },
  });
  res.json({ message: "Logged out successfully" });
});
