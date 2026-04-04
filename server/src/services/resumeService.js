import pdf from "pdf-parse";
import { analyzeResumeText } from "./aiService.js";

export async function extractResumeText(buffer) {
  const result = await pdf(buffer);
  return result.text.replace(/\s+/g, " ").trim();
}

export async function analyzeResume(buffer, jobRole = "") {
  const resumeText = await extractResumeText(buffer);

  if (!resumeText) {
    throw new Error("No readable text was found in the uploaded PDF resume.");
  }

  const analysis = await analyzeResumeText(resumeText, jobRole);

  return {
    resumeText,
    analysis,
  };
}
