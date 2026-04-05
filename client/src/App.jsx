import { useState } from "react";
import { extractTextFromPdf } from "./lib/pdfText";
import { analyzeResumeText } from "./lib/resumeAnalyzer";

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
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const skills = toArray(result?.skills);
  const missingSkills = toArray(result?.missingSkills);
  const jobMatchMissingSkills = toArray(result?.jobMatch?.missingSkills);
  const skillAnalysis = toArray(result?.skillAnalysis);
  const topImprovements = toArray(result?.topImprovements);
  const suggestions = toArray(result?.improvementSuggestions);

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
