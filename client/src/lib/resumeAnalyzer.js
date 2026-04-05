const TECHNICAL_SKILL_LIBRARY = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "MongoDB",
  "PostgreSQL",
  "SQL",
  "Python",
  "Java",
  "C++",
  "REST API",
  "Git",
  "Docker",
  "AWS",
  "Azure",
  "CI/CD",
  "HTML",
  "CSS",
  "Tailwind",
  "Next.js",
  "Redux",
  "Testing",
  "Jest",
  "Cypress",
  "Machine Learning",
  "Data Analysis",
  "Figma",
  "UI/UX",
  "Power BI",
  "Excel",
  "MATLAB",
  "Simulink",
  "SolidWorks",
  "CATIA",
  "ANSYS",
  "AutoCAD",
  "CAD",
  "CFD",
  "FEA",
  "Aerodynamics",
  "Propulsion",
  "Thermodynamics",
  "Flight Mechanics",
  "Finite Element Analysis",
  "Abaqus",
  "Creo",
  "NX",
  "LabVIEW",
];

const SOFT_SKILL_LIBRARY = ["Leadership", "Communication", "Problem Solving", "Agile", "Project Management"];

const SKILL_LIBRARY = [...TECHNICAL_SKILL_LIBRARY, ...SOFT_SKILL_LIBRARY];

const ROLE_SKILLS = {
  "frontend developer": ["JavaScript", "React", "HTML", "CSS", "TypeScript", "Git", "Testing"],
  "full stack developer": [
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "SQL",
    "REST API",
    "Git",
    "Docker",
  ],
  "backend developer": ["Node.js", "Express", "SQL", "REST API", "Docker", "Git", "Testing"],
  "data analyst": ["SQL", "Python", "Excel", "Power BI", "Data Analysis", "Communication"],
  "machine learning engineer": [
    "Python",
    "Machine Learning",
    "Data Analysis",
    "Docker",
    "AWS",
    "Git",
  ],
  "ui ux designer": ["Figma", "UI/UX", "Communication", "Project Management"],
  "aerospace intern": [
    "Python",
    "C++",
    "MATLAB",
    "CAD",
    "SolidWorks",
    "ANSYS",
    "Aerodynamics",
    "Thermodynamics",
  ],
  "aerospace engineer": [
    "Python",
    "MATLAB",
    "CAD",
    "SolidWorks",
    "ANSYS",
    "CFD",
    "Aerodynamics",
    "Propulsion",
  ],
  "mechanical engineer": [
    "CAD",
    "SolidWorks",
    "ANSYS",
    "MATLAB",
    "Thermodynamics",
    "FEA",
    "Python",
  ],
};

const SECTION_HEADERS = {
  summary: ["summary", "profile", "objective", "professional summary"],
  experience: ["experience", "work experience", "employment", "internship", "professional experience"],
  projects: ["projects", "academic projects", "project experience"],
  education: ["education", "academic background"],
  skills: ["skills", "technical skills", "core competencies"],
  certifications: ["certifications", "certificates", "licenses"],
};

function normalizeText(value) {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values)];
}

function extractSkills(text) {
  const normalized = normalizeText(text);
  return SKILL_LIBRARY.filter((skill) => normalized.includes(skill.toLowerCase()));
}

function extractTechnicalSkills(text) {
  const normalized = normalizeText(text);
  return TECHNICAL_SKILL_LIBRARY.filter((skill) => normalized.includes(skill.toLowerCase()));
}

function inferRoleSkills(jobRole, extractedSkills) {
  const normalizedRole = normalizeText(jobRole);
  const matchedRole = Object.keys(ROLE_SKILLS).find((role) => normalizedRole.includes(role));

  if (matchedRole) {
    return ROLE_SKILLS[matchedRole];
  }

  if (!jobRole.trim()) {
    return extractedSkills.slice(0, 8);
  }

  return extractedSkills.slice(0, 6);
}

function extractSections(text) {
  const normalized = normalizeText(text);
  return {
    hasSummary: /summary|profile|objective/.test(normalized),
    hasExperience: /experience|employment|work history/.test(normalized),
    hasProjects: /projects|project/.test(normalized),
    hasEducation: /education|university|college|bachelor|master/.test(normalized),
    hasSkills: /skills|technical skills|core competencies/.test(normalized),
    hasMetrics: /\b\d+%|\b\d+\+|\b\d+\s*(years|months|users|clients|projects)/.test(normalized),
    hasContact: /@|linkedin|github|phone|\+\d/.test(normalized),
  };
}

function scoreResume(sections, technicalSkills, roleSkillCoverage, text) {
  let score = 18;

  if (sections.hasSummary) score += 8;
  if (sections.hasExperience) score += 14;
  if (sections.hasProjects) score += 8;
  if (sections.hasEducation) score += 8;
  if (sections.hasSkills) score += 10;
  if (sections.hasMetrics) score += 10;
  if (sections.hasContact) score += 6;

  score += Math.min(technicalSkills.length * 2, 18);
  score += Math.round(roleSkillCoverage * 18);

  if (text.length < 900) score -= 8;
  if (text.length > 5000) score -= 4;

  return Math.max(0, Math.min(100, score));
}

function buildSuggestions(sections, missingSkills, score) {
  const suggestions = [];

  if (!sections.hasSummary) {
    suggestions.push("Add a short professional summary near the top to clarify your value proposition.");
  }

  if (!sections.hasSkills) {
    suggestions.push("Create a dedicated skills section so recruiters and ATS systems can scan your strengths quickly.");
  }

  if (!sections.hasMetrics) {
    suggestions.push("Rewrite experience bullets with measurable outcomes, such as percentages, counts, or delivery timelines.");
  }

  if (missingSkills.length) {
    suggestions.push(`Add evidence for role-relevant technical skills such as ${missingSkills.slice(0, 4).join(", ")}.`);
  }

  if (score < 70) {
    suggestions.push("Tighten formatting and section order so the resume is easier to scan in under 10 seconds.");
  }

  if (!sections.hasProjects) {
    suggestions.push("Include 1 to 2 strong projects if your work experience is limited or not role-specific.");
  }

  return unique(suggestions).slice(0, 6);
}

function buildSkillAnalysis(skills, sections) {
  const notes = [];

  if (skills.length >= 6) {
    notes.push("The resume shows a reasonably broad technical skill set.");
  } else if (skills.length > 0) {
    notes.push("Some relevant skills are present, but the breadth looks limited.");
  } else {
    notes.push("The resume does not clearly expose skills in a way that is easy to detect.");
  }

  if (sections.hasMetrics) {
    notes.push("There is evidence of quantified impact, which strengthens credibility.");
  } else {
    notes.push("Impact is not quantified enough, which weakens the resume.");
  }

  if (sections.hasProjects) {
    notes.push("Projects help demonstrate practical application of skills.");
  }

  return notes;
}

function buildSummary(score, skills, missingSkills) {
  if (score >= 80) {
    return `Strong resume foundation with ${skills.length} detectable skills and a mostly competitive profile.`;
  }

  if (score >= 60) {
    return `Solid starting point, but the resume still has visible gaps in positioning and role alignment.`;
  }

  return `The resume needs clearer structure, stronger keyword coverage, and better evidence of impact. Missing skills detected: ${missingSkills.slice(0, 3).join(", ") || "multiple areas"}.`;
}

function findSectionKey(line) {
  const normalizedLine = normalizeText(line).replace(/[:|]/g, "");

  return Object.entries(SECTION_HEADERS).find(([, headers]) =>
    headers.some((header) => normalizedLine === header || normalizedLine.includes(header))
  )?.[0];
}

function splitResumeIntoSections(rawText) {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const sections = {
    header: [],
    summary: [],
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    other: [],
  };

  let currentSection = "header";

  lines.forEach((line) => {
    const foundSection = findSectionKey(line);

    if (foundSection) {
      currentSection = foundSection;
      return;
    }

    sections[currentSection].push(line);
  });

  return sections;
}

function inferCandidateName(rawText) {
  const lines = rawText
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6);

  const candidate = lines.find((line) => {
    if (line.length > 40) {
      return false;
    }

    if (/@|linkedin|github|\+?\d/.test(line)) {
      return false;
    }

    const words = line.split(/\s+/);
    return words.length >= 2 && words.length <= 4 && /^[A-Za-z.\s-]+$/.test(line);
  });

  return candidate || "Candidate Name";
}

function inferContactLine(text) {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/(\+?\d[\d\s()-]{7,}\d)/)?.[0]?.trim() || "";
  const github = text.match(/github\.com\/[^\s|,]+/i)?.[0] || "";
  const linkedin = text.match(/linkedin\.com\/[^\s|,]+/i)?.[0] || "";

  return [phone, email, linkedin, github].filter(Boolean).join(" | ");
}

function extractDate(line) {
  return (
    line.match(
      /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,.-]+\d{4}\s*(?:-|to|–)\s*(?:present|current|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[\s,.-]+\d{4})/i
    )?.[0] ||
    line.match(/\b\d{4}\s*(?:-|to|–)\s*(?:present|current|\d{4})/i)?.[0] ||
    ""
  );
}

function sanitizeBullet(line) {
  return line
    .replace(/^[•\-–]+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\.$/, "");
}

function buildEntryBullets(lines, fallbackBullets) {
  const bullets = lines
    .map(sanitizeBullet)
    .filter((line) => line.length > 25)
    .slice(0, 3);

  return bullets.length ? bullets : fallbackBullets;
}

function extractExperienceEntries(lines) {
  if (!lines.length) {
    return [];
  }

  const primaryLine = lines[0];
  const dates = lines.map(extractDate).find(Boolean) || "";
  const parts = primaryLine.split(/[-|,]/).map((part) => part.trim()).filter(Boolean);

  return [
    {
      role: parts[0] || "Experience",
      organization: parts[1] || "",
      location: "",
      dates,
      bullets: buildEntryBullets(lines.slice(1), [
        "Rewrite this experience with action verbs, technical context, and measurable outcomes.",
      ]),
    },
  ];
}

function extractProjectEntries(lines, technicalSkills) {
  if (!lines.length) {
    return [];
  }

  const primaryLine = lines[0];

  return [
    {
      name: primaryLine.length <= 80 ? primaryLine : "Project Experience",
      techStack: technicalSkills.slice(0, 5).join(", "),
      bullets: buildEntryBullets(lines.slice(1), [
        "Clarify the project objective, tools used, and measurable outcome.",
      ]),
    },
  ];
}

function extractEducationEntries(lines) {
  if (!lines.length) {
    return [];
  }

  const primaryLine = lines[0];
  const dates = lines.map(extractDate).find(Boolean) || "";

  return [
    {
      institution: lines[1] || "",
      credential: primaryLine,
      dates,
      details: lines.slice(2, 4).join(" | "),
    },
  ];
}

function extractCertificationEntries(lines) {
  return lines.map(sanitizeBullet).filter(Boolean).slice(0, 4);
}

function buildProfessionalSummary(jobRole, technicalSkills, sections) {
  const roleTitle = jobRole.trim() || "Professional";
  const topSkills = technicalSkills.slice(0, 5);
  const sectionSignals = [];

  if (sections.experience.length) sectionSignals.push("hands-on experience");
  if (sections.projects.length) sectionSignals.push("project work");
  if (sections.education.length) sectionSignals.push("academic foundation");

  return `${roleTitle} candidate with exposure to ${topSkills.join(", ") || "relevant technical tools"}. Position the resume around ${sectionSignals.join(", ") || "technical strengths"}, using concise action-led bullets and quantified outcomes where supported by the original resume.`;
}

function buildImprovedResume(rawText, jobRole, technicalSkills, suggestions) {
  const sections = splitResumeIntoSections(rawText);
  const roleTitle = jobRole.trim() || "Professional";

  return {
    candidateName: inferCandidateName(rawText),
    headline: `${roleTitle} Resume`,
    contactLine: inferContactLine(rawText),
    professionalSummary: buildProfessionalSummary(jobRole, technicalSkills, sections),
    keySkills: technicalSkills.slice(0, 10),
    experience: extractExperienceEntries(sections.experience),
    projects: extractProjectEntries(sections.projects, technicalSkills),
    education: extractEducationEntries(sections.education),
    certifications: extractCertificationEntries(sections.certifications),
    topKeywords: technicalSkills.slice(0, 12),
  };
}

export function analyzeResumeText(resumeText, jobRole) {
  const rawText = resumeText.trim();
  const cleanedText = rawText.replace(/\s+/g, " ").trim();
  const sections = extractSections(cleanedText);
  const skills = extractSkills(cleanedText);
  const technicalSkills = extractTechnicalSkills(cleanedText);
  const targetSkills = inferRoleSkills(jobRole, technicalSkills);
  const missingSkills = targetSkills.filter((skill) => !technicalSkills.includes(skill));
  const roleSkillCoverage = targetSkills.length
    ? (targetSkills.length - missingSkills.length) / targetSkills.length
    : 0;
  const score = scoreResume(sections, technicalSkills, roleSkillCoverage, cleanedText);
  const improvementSuggestions = buildSuggestions(sections, missingSkills, score);

  return {
    score,
    skills,
    missingSkills,
    improvementSuggestions,
    skillAnalysis: buildSkillAnalysis(skills, sections),
    topImprovements: improvementSuggestions.slice(0, 3),
    summary: buildSummary(score, skills, missingSkills),
    jobMatch: {
      role: jobRole.trim() || "General",
      matchPercentage: Math.max(0, Math.min(100, Math.round(roleSkillCoverage * 70 + (sections.hasExperience ? 10 : 0) + (sections.hasProjects ? 8 : 0) + (sections.hasMetrics ? 7 : 0)))),
      missingSkills,
      rationale: jobRole.trim()
        ? `Estimated against the target role "${jobRole}" using technical keyword coverage, project evidence, and resume structure matching.`
        : "Estimated using general resume strength and visible skill coverage.",
    },
    improvedResume: buildImprovedResume(rawText, jobRole, technicalSkills, improvementSuggestions),
  };
}
