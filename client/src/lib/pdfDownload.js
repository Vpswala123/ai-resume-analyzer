import { jsPDF } from "jspdf/dist/jspdf.es.min.js";

function drawSectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(29, 78, 216);
  doc.text(title, 16, y);
  doc.setDrawColor(203, 213, 225);
  doc.line(16, y + 2, 194, y + 2);
  return y + 8;
}

function addWrappedText(doc, text, y, options = {}) {
  const {
    fontSize = 11,
    color = [51, 65, 85],
    x = 16,
    width = 178,
    lineHeight = 6,
    fontStyle = "normal",
  } = options;

  doc.setFont("helvetica", fontStyle);
  doc.setFontSize(fontSize);
  doc.setTextColor(...color);
  const lines = doc.splitTextToSize(text || "Not available.", width);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addBulletList(doc, items, y, color = [51, 65, 85]) {
  const safeItems = items?.length ? items : ["Not available."];
  let currentY = y;

  safeItems.forEach((item) => {
    const lines = doc.splitTextToSize(`- ${item}`, 172);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(...color);
    doc.text(lines, 18, currentY);
    currentY += lines.length * 6 + 1;
  });

  return currentY;
}

function ensurePage(doc, y, needed = 20) {
  if (y + needed <= 280) {
    return y;
  }

  doc.addPage();
  return 20;
}

function savePdf(doc, fileName) {
  doc.save(fileName);
}

export function downloadAnalysisReportPdf(result) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("AI Resume Analysis Report", 16, y);
  y += 10;

  y = addWrappedText(doc, `Source file: ${result.fileName || "resume.pdf"}`, y, {
    fontSize: 10,
    color: [71, 85, 105],
  });
  y = addWrappedText(doc, `Target role: ${result.jobMatch?.role || result.jobRole || "General"}`, y, {
    fontSize: 10,
    color: [71, 85, 105],
  });
  y += 4;

  doc.setFillColor(239, 246, 255);
  doc.roundedRect(16, y, 82, 24, 4, 4, "F");
  doc.roundedRect(108, y, 86, 24, 4, 4, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 58, 138);
  doc.text("Overall Score", 22, y + 8);
  doc.text("Job Match", 114, y + 8);
  doc.setFontSize(20);
  doc.text(`${result.score}/100`, 22, y + 19);
  doc.text(`${result.jobMatch?.matchPercentage ?? 0}%`, 114, y + 19);
  y += 34;

  y = drawSectionTitle(doc, "Summary", y);
  y = addWrappedText(doc, result.summary, y);
  y += 4;

  y = ensurePage(doc, y, 32);
  y = drawSectionTitle(doc, "Skill Analysis", y);
  y = addBulletList(doc, result.skillAnalysis, y);
  y += 2;

  y = ensurePage(doc, y, 32);
  y = drawSectionTitle(doc, "Top Improvements", y);
  y = addBulletList(doc, result.topImprovements, y, [146, 64, 14]);
  y += 2;

  y = ensurePage(doc, y, 40);
  y = drawSectionTitle(doc, "Suggestions", y);
  y = addBulletList(doc, result.improvementSuggestions, y);
  y += 2;

  y = ensurePage(doc, y, 24);
  y = drawSectionTitle(doc, "Skills", y);
  y = addWrappedText(doc, (result.skills || []).join(", ") || "Not available.", y);
  y += 2;

  y = ensurePage(doc, y, 24);
  y = drawSectionTitle(doc, "Missing Skills", y);
  y = addWrappedText(doc, (result.missingSkills || []).join(", ") || "None detected.", y, {
    color: [146, 64, 14],
  });

  savePdf(doc, "resume-analysis-report.pdf");
}

export function downloadImprovedResumePdf(result) {
  const resume = result.improvedResume || {};
  const doc = new jsPDF();
  let y = 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text((resume.candidateName || "Candidate Name").toUpperCase(), 105, y, { align: "center" });
  y += 8;

  doc.setFontSize(12);
  doc.setTextColor(29, 78, 216);
  doc.text(resume.headline || (result.jobRole || "Professional Resume"), 105, y, { align: "center" });
  y += 7;

  y = addWrappedText(doc, resume.contactLine || "", y, {
    x: 20,
    width: 170,
    fontSize: 10,
    color: [71, 85, 105],
  });
  y += 2;

  y = drawSectionTitle(doc, "Professional Summary", y);
  y = addWrappedText(doc, resume.professionalSummary, y);
  y += 2;

  y = ensurePage(doc, y, 24);
  y = drawSectionTitle(doc, "Core Skills", y);
  y = addWrappedText(doc, (resume.keySkills || []).join(" | "), y);
  y += 2;

  y = ensurePage(doc, y, 40);
  y = drawSectionTitle(doc, "Experience", y);
  (resume.experience || []).forEach((entry) => {
    y = ensurePage(doc, y, 30);
    y = addWrappedText(
      doc,
      `${entry.role || "Role"}${entry.organization ? `, ${entry.organization}` : ""}${entry.dates ? ` (${entry.dates})` : ""}`,
      y,
      { fontStyle: "bold", color: [15, 23, 42] }
    );
    if (entry.location) {
      y = addWrappedText(doc, entry.location, y, { fontSize: 10, color: [71, 85, 105] });
    }
    y = addBulletList(doc, entry.bullets, y);
    y += 1;
  });

  y = ensurePage(doc, y, 34);
  y = drawSectionTitle(doc, "Projects", y);
  (resume.projects || []).forEach((project) => {
    y = ensurePage(doc, y, 26);
    y = addWrappedText(
      doc,
      `${project.name || "Project"}${project.techStack ? ` | ${project.techStack}` : ""}`,
      y,
      { fontStyle: "bold", color: [15, 23, 42] }
    );
    y = addBulletList(doc, project.bullets, y);
    y += 1;
  });

  y = ensurePage(doc, y, 28);
  y = drawSectionTitle(doc, "Education", y);
  (resume.education || []).forEach((entry) => {
    y = ensurePage(doc, y, 18);
    y = addWrappedText(
      doc,
      `${entry.credential || "Credential"}${entry.institution ? `, ${entry.institution}` : ""}${entry.dates ? ` (${entry.dates})` : ""}`,
      y,
      { fontStyle: "bold", color: [15, 23, 42] }
    );
    if (entry.details) {
      y = addWrappedText(doc, entry.details, y, { fontSize: 10, color: [71, 85, 105] });
    }
    y += 1;
  });

  y = ensurePage(doc, y, 24);
  y = drawSectionTitle(doc, "Certifications", y);
  y = addBulletList(doc, resume.certifications, y);

  savePdf(doc, "improved-resume.pdf");
}
