import PDFDocument from "pdfkit";

function createDocumentBuffer(drawDocument) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawDocument(doc);
    doc.end();
  });
}

function ensureSpace(doc, neededHeight = 90) {
  if (doc.y + neededHeight > doc.page.height - doc.page.margins.bottom) {
    doc.addPage();
  }
}

function drawSectionTitle(doc, title) {
  doc.moveDown(0.7);
  doc.fontSize(12.5).fillColor("#1d4ed8").text(title);
  const lineY = doc.y + 4;
  doc
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .strokeColor("#cbd5e1")
    .lineWidth(1)
    .stroke();
  doc.moveDown(0.45);
}

function drawBulletList(doc, items, color = "#334155") {
  if (!items?.length) {
    doc.fontSize(10.5).fillColor("#64748b").text("Not available.");
    return;
  }

  items.forEach((item) => {
    doc.fontSize(10.5).fillColor(color).text(`- ${item}`, {
      paragraphGap: 4,
      indent: 10,
    });
  });
}

function drawInlineList(doc, items, color = "#334155") {
  const text = items?.filter(Boolean).join(" | ");
  doc.fontSize(10.5).fillColor(color).text(text || "Not available.");
}

function drawRightAlignedMeta(doc, text, y) {
  if (!text) {
    return;
  }

  doc.fontSize(10).fillColor("#64748b").text(
    text,
    doc.page.width - doc.page.margins.right - 170,
    y,
    {
      width: 170,
      align: "right",
    }
  );
}

export function buildAnalysisReportPdf({ analysis, fileName = "resume.pdf", jobRole = "" }) {
  return createDocumentBuffer((doc) => {
    doc.fontSize(22).fillColor("#0f172a").text("AI Resume Analysis Report");

    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#475569").text(`Source file: ${fileName}`);
    doc.fontSize(11).fillColor("#475569").text(
      `Target role: ${jobRole || analysis.jobMatch.role || "General"}`
    );
    doc.moveDown(0.8);

    doc.roundedRect(doc.x, doc.y, 240, 78, 16).fillAndStroke("#eff6ff", "#bfdbfe");
    doc.fillColor("#1e3a8a").fontSize(11).text("Overall Score", 70, 122).fontSize(28).text(
      `${analysis.score}/100`,
      70,
      142
    );
    doc.fontSize(11).fillColor("#92400e").text("Job Match", 280, 122).fontSize(28).text(
      `${analysis.jobMatch.matchPercentage}%`,
      280,
      142
    );
    doc.moveDown(4.2);

    drawSectionTitle(doc, "Summary");
    doc.fontSize(11).fillColor("#334155").text(analysis.summary);

    drawSectionTitle(doc, "Skill Analysis");
    drawBulletList(doc, analysis.skillAnalysis);

    drawSectionTitle(doc, "Top Improvements");
    drawBulletList(doc, analysis.topImprovements, "#92400e");

    drawSectionTitle(doc, "Improvement Suggestions");
    drawBulletList(doc, analysis.improvementSuggestions);

    drawSectionTitle(doc, "Skills");
    doc.fontSize(10.5).fillColor("#334155").text(analysis.skills.join(", "));

    drawSectionTitle(doc, "Missing Skills");
    doc.fontSize(10.5).fillColor("#92400e").text(analysis.missingSkills.join(", ") || "None detected");

    drawSectionTitle(doc, "Role Match Details");
    doc.fontSize(11).fillColor("#334155").text(analysis.jobMatch.rationale);
    doc.moveDown(0.4);
    drawBulletList(doc, analysis.jobMatch.missingSkills, "#92400e");
  });
}

export function buildImprovedResumePdf({ analysis, jobRole = "" }) {
  const resume = analysis.improvedResume;
  const name = resume.candidateName || "Candidate Name";
  const headline = resume.headline || (jobRole ? `${jobRole} Resume` : "Professional Resume");
  const headerMeta = [resume.contactLine, jobRole ? `Target role: ${jobRole}` : ""]
    .filter(Boolean)
    .join(" | ");

  return createDocumentBuffer((doc) => {
    doc.fontSize(22).fillColor("#0f172a").text(name.toUpperCase(), {
      align: "center",
    });
    doc.moveDown(0.15);
    doc.fontSize(12).fillColor("#1d4ed8").text(headline, {
      align: "center",
    });
    if (headerMeta) {
      doc.moveDown(0.15);
      doc.fontSize(10.2).fillColor("#475569").text(headerMeta, {
        align: "center",
      });
    }

    drawSectionTitle(doc, "Professional Summary");
    doc.fontSize(10.8).fillColor("#334155").text(resume.professionalSummary, {
      align: "justify",
    });

    drawSectionTitle(doc, "Core Skills");
    drawInlineList(doc, resume.keySkills);

    drawSectionTitle(doc, "Professional Experience");
    if (!resume.experience?.length) {
      doc.fontSize(10.5).fillColor("#64748b").text("No experience entries available.");
    } else {
      resume.experience.forEach((entry) => {
        ensureSpace(doc, 85);
        const startY = doc.y;
        doc.fontSize(11.3).fillColor("#0f172a").text(entry.role || "Role");
        drawRightAlignedMeta(doc, entry.dates, startY);

        const orgLine = [entry.organization, entry.location].filter(Boolean).join(" | ");
        doc.fontSize(10.1).fillColor("#475569").text(orgLine);
        doc.moveDown(0.15);
        drawBulletList(doc, entry.bullets);
        doc.moveDown(0.2);
      });
    }

    drawSectionTitle(doc, "Projects");
    if (!resume.projects?.length) {
      doc.fontSize(10.5).fillColor("#64748b").text("No project entries available.");
    } else {
      resume.projects.forEach((project) => {
        ensureSpace(doc, 70);
        doc.fontSize(11.2).fillColor("#0f172a").text(project.name || "Project");
        if (project.techStack) {
          doc.fontSize(10).fillColor("#475569").text(project.techStack);
        }
        doc.moveDown(0.1);
        drawBulletList(doc, project.bullets);
        doc.moveDown(0.2);
      });
    }

    drawSectionTitle(doc, "Education");
    if (!resume.education?.length) {
      doc.fontSize(10.5).fillColor("#64748b").text("No education entries available.");
    } else {
      resume.education.forEach((entry) => {
        ensureSpace(doc, 45);
        const startY = doc.y;
        doc.fontSize(11.1).fillColor("#0f172a").text(entry.credential || "Credential");
        drawRightAlignedMeta(doc, entry.dates, startY);
        doc.fontSize(10.1).fillColor("#475569").text(entry.institution || "");
        if (entry.details) {
          doc.fontSize(10).fillColor("#64748b").text(entry.details);
        }
        doc.moveDown(0.35);
      });
    }

    drawSectionTitle(doc, "Certifications");
    drawBulletList(doc, resume.certifications);

    drawSectionTitle(doc, "Suggested ATS Keywords");
    drawInlineList(doc, resume.topKeywords);
  });
}
