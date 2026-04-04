import OpenAI from "openai";
import { config } from "../config.js";
import { analysisSchema } from "../schemas/analysisSchema.js";

const openai = new OpenAI({
  apiKey: config.openAiApiKey,
});

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

  if (!config.openAiApiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to server/.env before analyzing resumes.");
  }

  const response = await openai.responses.create({
    model: config.openAiModel,
    instructions: "You evaluate resumes and return structured JSON that matches the supplied schema.",
    input: buildPrompt(resumeText, jobRole),
    text: {
      format: {
        type: "json_schema",
        name: "resume_analysis",
        strict: true,
        schema: analysisSchema,
      },
    },
  });

  const output = response.output_text;

  if (!output) {
    throw new Error("OpenAI response did not contain structured output.");
  }

  try {
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`OpenAI returned invalid JSON output: ${error.message}`);
  }
}
