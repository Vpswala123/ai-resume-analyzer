import { GoogleGenAI } from "@google/genai";
import { config } from "../config.js";
import { analysisSchema } from "../schemas/analysisSchema.js";

let aiClient = null;

function getAiClient() {
  if (!config.geminiApiKey) {
    throw new Error("GEMINI_API_KEY is missing. Add it to server/.env before analyzing resumes.");
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: config.geminiApiKey,
    });
  }

  return aiClient;
}

function buildPrompt(resumeText, jobRole) {
  const roleBlock = jobRole
    ? `Target job role: ${jobRole}`
    : "Target job role: Not provided. Infer missing skills using the resume context only.";

  return [
    "You are an expert resume reviewer and career coach.",
    "Analyze the resume and return JSON only.",
    "Keep the response practical, specific, and concise.",
    "Score the resume from 0 to 100.",
    "List strengths in skillAnalysis.",
    "List extracted hard and soft skills in skills.",
    "List gaps in missingSkills.",
    "List actionable resume edits in improvementSuggestions.",
    "List the three highest-priority actions in topImprovements.",
    "If a target role is provided, estimate matchPercentage for that role and list role-specific missing skills.",
    "Create an improvedResume section as a clean ATS-friendly one-column resume draft.",
    "Use standard headings and reverse-chronological ordering where dates are available.",
    "Set candidateName and contactLine from the resume if present, otherwise use empty strings.",
    "Set headline to a concise role-focused title.",
    "Rewrite experience and projects into structured entries with strong bullet points and quantified impact only when supported by the resume.",
    "Do not invent facts. If data is missing, use empty strings or empty arrays.",
    roleBlock,
    "",
    "Resume text:",
    resumeText,
  ].join("\n");
}

export async function analyzeResumeText(resumeText, jobRole = "") {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Resume text is empty.");
  }

  const ai = getAiClient();
  const response = await ai.models.generateContent({
    model: config.geminiModel,
    contents: [
      {
        role: "user",
        parts: [
          {
            text: [
              "You evaluate resumes and return JSON only that matches the provided schema.",
              buildPrompt(resumeText, jobRole),
            ].join("\n\n"),
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
    },
  });

  const output = response.text;

  if (!output) {
    throw new Error("Gemini response did not contain structured output.");
  }

  return JSON.parse(output);
}
