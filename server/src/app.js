import express from "express";
import cors from "cors";
import { config } from "./config.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.clientUrl,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/analyze", analyzeRoutes);

  return app;
}
