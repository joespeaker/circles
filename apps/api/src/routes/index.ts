import { Router } from "express";
import { authRouter } from "./auth";
import { usersRouter } from "./users";
import { circlesRouter } from "./circles";
import { notificationsRouter } from "./notifications";

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/circles", circlesRouter);
router.use("/notifications", notificationsRouter);
