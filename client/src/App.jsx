import { useState } from "react";
import { extractTextFromPdf } from "./lib/pdfText";
import { analyzeResumeText } from "./lib/resumeAnalyzer";
import { downloadAnalysisReportPdf, downloadImprovedResumePdf } from "./lib/pdfDownload";

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function ProgressBar({ value }) {
  return (
    <div className="progress-track" aria-hidden="true">
      <div className="progress-fill" style={{ width: `${value}%` }} />
    </div>
  );
}

function SectionCard({ title, children, accent = "blue" }) {
  return (
    <section className={`card card-${accent}`}>
      <div className="card-header">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const skills = toArray(result?.skills);
  const missingSkills = toArray(result?.missingSkills);
  const jobMatchMissingSkills = toArray(result?.jobMatch?.missingSkills);
  const skillAnalysis = toArray(result?.skillAnalysis);
  const topImprovements = toArray(result?.topImprovements);
  const suggestions = toArray(result?.improvementSuggestions);
  const improvedResume = result?.improvedResume ?? {};
  const resumeSkills = toArray(improvedResume.keySkills);
  const resumeExperience = toArray(improvedResume.experience);
  const resumeProjects = toArray(improvedResume.projects);
  const resumeEducation = toArray(improvedResume.education);
  const resumeCertifications = toArray(improvedResume.certifications);

  function handleDownload(action) {
    if (!result) {
      return;
    }

    setDownloading(action);
    setError("");

    try {
      if (action === "report") {
        downloadAnalysisReportPdf(result);
      } else {
        downloadImprovedResumePdf(result);
      }
    } catch (downloadError) {
      setError(downloadError.message || "Failed to create the PDF.");
    } finally {
      setDownloading("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError("Select a PDF resume before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const resumeText = await extractTextFromPdf(file);

      if (!resumeText) {
        throw new Error("No readable text was found in the uploaded PDF.");
      }

      const analysis = analyzeResumeText(resumeText, jobRole);
      setResult({
        ...analysis,
        fileName: file.name,
        jobRole,
      });
    } catch (submissionError) {
      setResult(null);
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <main className="container">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">AI Resume Analyzer</p>
            <h1>Upload your resume and measure how well it fits the role.</h1>
            <p className="hero-text">
              Get a resume score, extracted skills, top improvements, and a job
              match estimate directly in your browser with no API key or login.
            </p>
          </div>

          <form className="upload-panel" onSubmit={handleSubmit}>
            <label className="field">
              <span>Target job role</span>
              <input
                type="text"
                placeholder="Aerospace Engineer"
                value={jobRole}
                onChange={(event) => setJobRole(event.target.value)}
              />
            </label>

            <label className="field file-field">
              <span>Resume PDF</span>
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </label>

            <button className="primary-button" type="submit" disabled={loading}>
              {loading ? (
                <span className="button-loader">
                  <span className="spinner" />
                  Analyzing...
                </span>
              ) : (
                "Analyze Resume"
              )}
            </button>

            {error ? <p className="error-message">{error}</p> : null}
          </form>
        </section>

        {result ? (
          <section className="dashboard-grid">
            <SectionCard title="Resume Score" accent="yellow">
              <div className="score-block">
                <div>
                  <p className="muted-label">Overall score</p>
                  <p className="score-value">{result.score}/100</p>
                </div>
                <ProgressBar value={result.score} />
                <p className="summary-text">{result.summary}</p>
                <div className="action-row">
                  <button
                    className="secondary-button"
                    type="button"
                    disabled={downloading === "report"}
                    onClick={() => handleDownload("report")}
                  >
                    {downloading === "report" ? "Preparing report..." : "Download Report PDF"}
                  </button>
                  <button
                    className="secondary-button secondary-button-blue"
                    type="button"
                    disabled={downloading === "resume"}
                    onClick={() => handleDownload("resume")}
                  >
                    {downloading === "resume" ? "Preparing resume..." : "Download Improved Resume"}
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Job Match">
              <div className="metric-row">
                <div className="metric-pill">
                  <span>Match</span>
                  <strong>{result.jobMatch?.matchPercentage ?? 0}%</strong>
                </div>
                <div className="metric-pill">
                  <span>Role</span>
                  <strong>{result.jobMatch?.role || "General"}</strong>
                </div>
              </div>
              <p className="summary-text">{result.jobMatch?.rationale || "No role match rationale available yet."}</p>
              <div className="chip-group">
                {jobMatchMissingSkills.map((skill) => (
                  <span className="chip chip-warning" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skills">
              <div className="chip-group">
                {skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skill Analysis">
              <ul className="list">
                {skillAnalysis.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Top Improvements" accent="yellow">
              <ul className="list">
                {topImprovements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Improved Resume Draft">
              <div className="resume-draft">
                <p className="resume-draft-title">
                  {improvedResume.candidateName || "Candidate Name"}
                </p>
                <p className="resume-draft-headline">
                  {improvedResume.headline || "Role-focused resume draft"}
                </p>
                <p className="resume-draft-meta">
                  {improvedResume.contactLine || "Contact details will appear here when detected from the resume."}
                </p>
                <p className="summary-text">
                  {improvedResume.professionalSummary || "No professional summary generated yet."}
                </p>
                <div className="chip-group">
                  {resumeSkills.map((skill) => (
                    <span className="chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="resume-preview-grid">
                  <div className="resume-preview-block">
                    <p className="resume-preview-label">Experience</p>
                    <ul className="list compact-list">
                      {resumeExperience.slice(0, 3).map((item) => (
                        <li key={`${item.role}-${item.organization}-${item.dates}`}>
                          <strong>{item.role || "Role"}</strong>
                          {item.organization ? `, ${item.organization}` : ""}
                          {item.dates ? ` (${item.dates})` : ""}
                          {item.bullets?.[0] ? `: ${item.bullets[0]}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="resume-preview-block">
                    <p className="resume-preview-label">Projects</p>
                    <ul className="list compact-list">
                      {resumeProjects.slice(0, 2).map((item) => (
                        <li key={`${item.name}-${item.techStack}`}>
                          <strong>{item.name || "Project"}</strong>
                          {item.techStack ? `, ${item.techStack}` : ""}
                          {item.bullets?.[0] ? `: ${item.bullets[0]}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="resume-preview-grid">
                  <div className="resume-preview-block">
                    <p className="resume-preview-label">Education</p>
                    <ul className="list compact-list">
                      {resumeEducation.slice(0, 2).map((item) => (
                        <li key={`${item.institution}-${item.credential}-${item.dates}`}>
                          <strong>{item.credential || "Credential"}</strong>
                          {item.institution ? `, ${item.institution}` : ""}
                          {item.dates ? ` (${item.dates})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="resume-preview-block">
                    <p className="resume-preview-label">Certifications</p>
                    <ul className="list compact-list">
                      {resumeCertifications.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Suggestions">
              <ul className="list">
                {suggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Missing Skills">
              <div className="chip-group">
                {missingSkills.map((skill) => (
                  <span className="chip chip-warning" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          </section>
        ) : null}
      </main>
    </div>
  );
}
