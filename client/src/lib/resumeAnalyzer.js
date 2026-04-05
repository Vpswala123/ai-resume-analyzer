const SKILL_LIBRARY = [
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
  "Leadership",
  "Communication",
  "Problem Solving",
  "Agile",
  "Project Management",
  "Figma",
  "UI/UX",
  "Power BI",
  "Excel",
];

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

function inferRoleSkills(jobRole, extractedSkills) {
  const normalizedRole = normalizeText(jobRole);
  const matchedRole = Object.keys(ROLE_SKILLS).find((role) => normalizedRole.includes(role));

  if (matchedRole) {
    return ROLE_SKILLS[matchedRole];
  }

  if (!jobRole.trim()) {
    return extractedSkills.slice(0, 8);
  }

  return ["Communication", "Problem Solving", "Project Management", "Git"];
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

function scoreResume(sections, skills, missingSkills, text) {
  let score = 35;

  if (sections.hasSummary) score += 8;
  if (sections.hasExperience) score += 12;
  if (sections.hasProjects) score += 8;
  if (sections.hasEducation) score += 8;
  if (sections.hasSkills) score += 10;
  if (sections.hasMetrics) score += 10;
  if (sections.hasContact) score += 6;

  score += Math.min(skills.length * 2, 16);
  score -= Math.min(missingSkills.length * 4, 20);

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
    suggestions.push(`Add evidence for role-relevant skills such as ${missingSkills.slice(0, 4).join(", ")}.`);
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

export function analyzeResumeText(resumeText, jobRole) {
  const cleanedText = resumeText.replace(/\s+/g, " ").trim();
  const sections = extractSections(cleanedText);
  const skills = extractSkills(cleanedText);
  const targetSkills = inferRoleSkills(jobRole, skills);
  const missingSkills = targetSkills.filter((skill) => !skills.includes(skill));
  const score = scoreResume(sections, skills, missingSkills, cleanedText);
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
      matchPercentage: Math.max(0, Math.min(100, score - missingSkills.length * 3)),
      missingSkills,
      rationale: jobRole.trim()
        ? `Estimated against the target role "${jobRole}" using keyword and resume-structure matching.`
        : "Estimated using general resume strength and visible skill coverage.",
    },
  };
}
