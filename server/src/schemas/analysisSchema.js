export const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description: "Overall resume quality score from 0 to 100.",
    },
    skillAnalysis: {
      type: "array",
      description: "Concise strengths and observations about the candidate's skills.",
      items: {
        type: "string",
      },
    },
    skills: {
      type: "array",
      description: "Extracted hard and soft skills from the resume.",
      items: {
        type: "string",
      },
    },
    missingSkills: {
      type: "array",
      description: "Important skills that appear absent or underrepresented.",
      items: {
        type: "string",
      },
    },
    improvementSuggestions: {
      type: "array",
      description: "Actionable resume improvements.",
      items: {
        type: "string",
      },
    },
    topImprovements: {
      type: "array",
      description: "Top three priority improvements.",
      items: {
        type: "string",
      },
    },
    summary: {
      type: "string",
      description: "Short executive summary of the resume quality.",
    },
    jobMatch: {
      type: "object",
      additionalProperties: false,
      properties: {
        role: {
          type: "string",
          description: "The target role used for matching.",
        },
        matchPercentage: {
          type: "integer",
          minimum: 0,
          maximum: 100,
          description: "Estimated fit for the target role from 0 to 100.",
        },
        missingSkills: {
          type: "array",
          description: "Role-specific missing skills.",
          items: {
            type: "string",
          },
        },
        rationale: {
          type: "string",
          description: "Short explanation for the match estimate.",
        },
      },
      required: ["role", "matchPercentage", "missingSkills", "rationale"],
    },
    improvedResume: {
      type: "object",
      additionalProperties: false,
      properties: {
        candidateName: {
          type: "string",
        },
        headline: {
          type: "string",
        },
        contactLine: {
          type: "string",
        },
        professionalSummary: {
          type: "string",
        },
        keySkills: {
          type: "array",
          items: {
            type: "string",
          },
        },
        experience: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              role: {
                type: "string",
              },
              organization: {
                type: "string",
              },
              location: {
                type: "string",
              },
              dates: {
                type: "string",
              },
              bullets: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["role", "organization", "location", "dates", "bullets"],
          },
        },
        projects: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              name: {
                type: "string",
              },
              techStack: {
                type: "string",
              },
              bullets: {
                type: "array",
                items: {
                  type: "string",
                },
              },
            },
            required: ["name", "techStack", "bullets"],
          },
        },
        education: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              institution: {
                type: "string",
              },
              credential: {
                type: "string",
              },
              dates: {
                type: "string",
              },
              details: {
                type: "string",
              },
            },
            required: ["institution", "credential", "dates", "details"],
          },
        },
        certifications: {
          type: "array",
          items: {
            type: "string",
          },
        },
        topKeywords: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
      required: [
        "candidateName",
        "headline",
        "contactLine",
        "professionalSummary",
        "keySkills",
        "experience",
        "projects",
        "education",
        "certifications",
        "topKeywords",
      ],
    },
  },
  required: [
    "score",
    "skillAnalysis",
    "skills",
    "missingSkills",
    "improvementSuggestions",
    "topImprovements",
    "summary",
    "jobMatch",
    "improvedResume",
  ],
};
