import { config } from "../config.js";
import { analysisSchema } from "../schemas/analysisSchema.js";

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

  const response = await fetch(`${config.ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: config.ollamaModel,
      stream: false,
      format: analysisSchema,
      prompt: [
        "You evaluate resumes and return JSON only that matches the provided schema.",
        buildPrompt(resumeText, jobRole),
      ].join("\n\n"),
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error || "Local Ollama request failed.";
    if (message.includes("requires more system memory")) {
      throw new Error(
        `The local model ${config.ollamaModel} cannot start because Ollama reported insufficient RAM. Free memory or switch to a smaller model in server/.env.`
      );
    }
    throw new Error(message);
  }

  const output = payload.response;

  if (!output) {
    throw new Error("Local model response did not contain structured output.");
  }

  try {
    return JSON.parse(output);
  } catch {
    throw new Error("Local model returned invalid JSON. Try again or switch to a smaller local model.");
  }
}
