import { useState } from "react";

const API_URL = "http://localhost:5000/api/analyze";

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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError("Select a PDF resume before submitting.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobRole", jobRole);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Resume analysis failed.");
      }

      setResult(data);
    } catch (submissionError) {
      setResult(null);
      setError(submissionError.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf(path, outputFileName) {
    if (!result) {
      return;
    }

    setDownloading(path);
    setError("");

    try {
      const response = await fetch(`${API_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysis: result,
          fileName: result.fileName,
          jobRole: result.jobRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "PDF generation failed.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = outputFileName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setDownloading("");
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
              match estimate in a single dashboard.
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
                    disabled={downloading === "/report-pdf"}
                    onClick={() =>
                      downloadPdf("/report-pdf", "resume-analysis-report.pdf")
                    }
                  >
                    {downloading === "/report-pdf" ? "Preparing report..." : "Download Report PDF"}
                  </button>
                  <button
                    className="secondary-button secondary-button-blue"
                    type="button"
                    disabled={downloading === "/improved-resume-pdf"}
                    onClick={() =>
                      downloadPdf("/improved-resume-pdf", "improved-resume.pdf")
                    }
                  >
                    {downloading === "/improved-resume-pdf"
                      ? "Preparing resume..."
                      : "Download Improved Resume"}
                  </button>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Job Match">
              <div className="metric-row">
                <div className="metric-pill">
                  <span>Match</span>
                  <strong>{result.jobMatch.matchPercentage}%</strong>
                </div>
                <div className="metric-pill">
                  <span>Role</span>
                  <strong>{result.jobMatch.role || "General"}</strong>
                </div>
              </div>
              <p className="summary-text">{result.jobMatch.rationale}</p>
              <div className="chip-group">
                {result.jobMatch.missingSkills.map((skill) => (
                  <span className="chip chip-warning" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skills">
              <div className="chip-group">
                {result.skills.map((skill) => (
                  <span className="chip" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Skill Analysis">
              <ul className="list">
                {result.skillAnalysis.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Top Improvements" accent="yellow">
              <ul className="list">
                {result.topImprovements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Improved Resume Draft">
              <div className="resume-draft">
                <p className="resume-draft-title">
                  {result.improvedResume.candidateName || "Candidate Name"}
                </p>
                <p className="resume-draft-headline">{result.improvedResume.headline}</p>
                <p className="summary-text">{result.improvedResume.professionalSummary}</p>
                <div className="chip-group">
                  {result.improvedResume.keySkills.map((skill) => (
                    <span className="chip" key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
                <ul className="list">
                  {result.improvedResume.experience.slice(0, 3).map((item) => (
                    <li key={`${item.role}-${item.organization}-${item.dates}`}>
                      <strong>{item.role || "Role"}</strong>
                      {item.organization ? `, ${item.organization}` : ""}
                      {item.bullets[0] ? `: ${item.bullets[0]}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>

            <SectionCard title="Suggestions">
              <ul className="list">
                {result.improvementSuggestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Missing Skills">
              <div className="chip-group">
                {result.missingSkills.map((skill) => (
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
