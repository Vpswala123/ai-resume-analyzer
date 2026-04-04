import { Router } from "express";
import multer from "multer";
import { analyzeResume } from "../services/resumeService.js";
import { buildAnalysisReportPdf, buildImprovedResumePdf } from "../services/pdfService.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function validatePdfUpload(req, res) {
  if (!req.file) {
    res.status(400).json({ error: "Please upload a PDF resume." });
    return false;
  }

  if (req.file.mimetype !== "application/pdf") {
    res.status(400).json({ error: "Only PDF files are supported." });
    return false;
  }

  return true;
}

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    if (!validatePdfUpload(req, res)) {
      return;
    }

    const jobRole = req.body.jobRole?.trim() || "";
    const { analysis } = await analyzeResume(req.file.buffer, jobRole);

    return res.json({
      ...analysis,
      fileName: req.file.originalname,
      jobRole,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to analyze the resume.",
    });
  }
});

router.post("/report-pdf", async (req, res) => {
  try {
    const { analysis, fileName, jobRole } = req.body;

    if (!analysis) {
      return res.status(400).json({ error: "Analysis payload is required." });
    }

    const pdfBuffer = await buildAnalysisReportPdf({ analysis, fileName, jobRole });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume-analysis-report.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to generate report PDF.",
    });
  }
});

router.post("/improved-resume-pdf", async (req, res) => {
  try {
    const { analysis, jobRole } = req.body;

    if (!analysis?.improvedResume) {
      return res.status(400).json({ error: "Improved resume data is required." });
    }

    const pdfBuffer = await buildImprovedResumePdf({ analysis, jobRole });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="improved-resume.pdf"');
    return res.send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Failed to generate improved resume PDF.",
    });
  }
});

export default router;
