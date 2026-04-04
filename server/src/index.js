import express from "express";
import cors from "cors";
import { config } from "./config.js";
import analyzeRoutes from "./routes/analyzeRoutes.js";

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analyze", analyzeRoutes);

app.listen(config.port, () => {
  console.log(`Server listening on http://localhost:${config.port}`);
});
