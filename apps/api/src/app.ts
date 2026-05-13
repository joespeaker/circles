import express from "express";
import cors from "cors";
import helmet from "helmet";
import { router } from "./routes";
import { errorHandler } from "./middleware/error";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", router);

app.use(errorHandler);
