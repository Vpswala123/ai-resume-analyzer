import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
};
