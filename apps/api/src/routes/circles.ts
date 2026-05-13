import { Router } from "express";
import { z } from "zod";
import { prisma, MemberRole } from "@circles/database";
import { requireAuth, AuthRequest } from "../middleware/auth";

export const circlesRouter = Router();

const createCircleSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Slug may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional().default(false),
  inviteOnly: z.boolean().optional().default(false),
});

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "Channel name may only contain lowercase letters, numbers, and hyphens"),
  description: z.string().max(256).optional(),
  type: z.enum(["TEXT", "ANNOUNCEMENT", "VOICE"]).optional().default("TEXT"),
});

circlesRouter.get("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const { search, joined } = req.query;

  if (joined === "true") {
    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        circle: {
          include: {
            channels: {
              where: { isArchived: false },
              orderBy: { position: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });

    const circles = memberships.map((m) => ({
      ...m.circle,
      role: m.role,
    }));
    res.json({ circles });
    return;
  }

  const circles = await prisma.circle.findMany({
    where: {
      isPrivate: false,
      ...(search
        ? {
            OR: [
              { name: { contains: String(search), mode: "insensitive" } },
              { description: { contains: String(search), mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { memberCount: "desc" },
    take: 50,
  });

  const membershipMap = await prisma.membership.findMany({
    where: { userId, circleId: { in: circles.map((c) => c.id) } },
    select: { circleId: true, role: true },
  });

  const membershipByCircle = Object.fromEntries(
    membershipMap.map((m) => [m.circleId, m.role])
  );

  res.json({
    circles: circles.map((c) => ({
      ...c,
      isMember: !!membershipByCircle[c.id],
      role: membershipByCircle[c.id] || null,
    })),
  });
});

circlesRouter.post("/", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const body = createCircleSchema.parse(req.body);

  const existing = await prisma.circle.findUnique({ where: { slug: body.slug } });
  if (existing) {
    res.status(409).json({ error: "A circle with that slug already exists" });
    return;
  }

  const circle = await prisma.$transaction(async (tx) => {
    const newCircle = await tx.circle.create({
      data: { ...body, memberCount: 1 },
    });

    await tx.membership.create({
      data: { userId, circleId: newCircle.id, role: MemberRole.OWNER },
    });

    await tx.channel.create({
      data: {
        circleId: newCircle.id,
        name: "general",
        description: "General discussion",
        position: 0,
      },
    });

    return newCircle;
  });

  res.status(201).json({ circle });
});

circlesRouter.get("/:slug", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const circle = await prisma.circle.findUnique({
    where: { slug: req.params.slug },
    include: {
      channels: {
        where: { isArchived: false },
        orderBy: { position: "asc" },
      },
    },
  });

  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  if (circle.isPrivate || circle.inviteOnly) {
    const membership = await prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: circle.id } },
    });
    if (!membership) {
      res.status(403).json({ error: "This circle is private" });
      return;
    }
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: circle.id } },
  });

  res.json({
    circle: {
      ...circle,
      isMember: !!membership,
      role: membership?.role || null,
    },
  });
});

circlesRouter.post("/:slug/join", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const circle = await prisma.circle.findUnique({
    where: { slug: req.params.slug },
  });

  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  if (circle.inviteOnly) {
    res.status(403).json({ error: "This circle is invite-only" });
    return;
  }

  const existing = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: circle.id } },
  });

  if (existing) {
    res.status(409).json({ error: "Already a member" });
    return;
  }

  await prisma.$transaction([
    prisma.membership.create({
      data: { userId, circleId: circle.id, role: MemberRole.MEMBER },
    }),
    prisma.circle.update({
      where: { id: circle.id },
      data: { memberCount: { increment: 1 } },
    }),
  ]);

  res.json({ message: "Joined successfully" });
});

circlesRouter.delete("/:slug/leave", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const circle = await prisma.circle.findUnique({
    where: { slug: req.params.slug },
  });

  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: circle.id } },
  });

  if (!membership) {
    res.status(404).json({ error: "Not a member" });
    return;
  }

  if (membership.role === MemberRole.OWNER) {
    res.status(400).json({ error: "Owners cannot leave. Transfer ownership first." });
    return;
  }

  await prisma.$transaction([
    prisma.membership.delete({
      where: { userId_circleId: { userId, circleId: circle.id } },
    }),
    prisma.circle.update({
      where: { id: circle.id },
      data: { memberCount: { decrement: 1 } },
    }),
  ]);

  res.json({ message: "Left circle successfully" });
});

circlesRouter.get("/:slug/members", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;

  const circle = await prisma.circle.findUnique({
    where: { slug: req.params.slug },
  });

  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  if (circle.isPrivate) {
    const membership = await prisma.membership.findUnique({
      where: { userId_circleId: { userId, circleId: circle.id } },
    });
    if (!membership) {
      res.status(403).json({ error: "Access denied" });
      return;
    }
  }

  const memberships = await prisma.membership.findMany({
    where: { circleId: circle.id },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
  });

  res.json({
    members: memberships.map((m) => ({
      ...m.user,
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  });
});

circlesRouter.post("/:slug/channels", requireAuth, async (req, res) => {
  const { userId } = req as AuthRequest;
  const body = createChannelSchema.parse(req.body);

  const circle = await prisma.circle.findUnique({
    where: { slug: req.params.slug },
  });

  if (!circle) {
    res.status(404).json({ error: "Circle not found" });
    return;
  }

  const membership = await prisma.membership.findUnique({
    where: { userId_circleId: { userId, circleId: circle.id } },
  });

  if (
    !membership ||
    (membership.role !== MemberRole.OWNER && membership.role !== MemberRole.ADMIN)
  ) {
    res.status(403).json({ error: "Only admins can create channels" });
    return;
  }

  const maxPosition = await prisma.channel.aggregate({
    where: { circleId: circle.id },
    _max: { position: true },
  });

  const channel = await prisma.channel.create({
    data: {
      ...body,
      circleId: circle.id,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  res.status(201).json({ channel });
});
