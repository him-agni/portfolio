import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ExternalLink, Play } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { slug } = useParams();
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    return <Navigate to="/" replace />;
  }

  const hasSolutionSteps = project.solutionSteps && project.solutionSteps.length > 0;
  const hasCapabilities = project.capabilities && project.capabilities.length > 0;

  return (
    <div className="project-detail-page">
      <div className="container project-detail-container">
        <Link to="/" className="detail-logo">&lt;Himani /&gt;</Link>

        <div className="detail-meta-row">
          <span className="detail-category">{project.category}</span>
          {project.verified && (
            <span className="detail-verified-badge">
              <span className="verified-dot" /> Verified
            </span>
          )}
        </div>

        <h1 className="detail-title">{project.title}</h1>
        <p className="detail-summary">{project.longDescription}</p>

        <div className="detail-tags">
          {project.tags.map((tag, i) => (
            <span key={i} className="tag">{tag}</span>
          ))}
        </div>

        <div className="detail-actions">
          {project.demoVideo ? (
            <a href="#project-demo" className="detail-btn detail-btn-demo">
              <Play size={16} /> Watch the demo
            </a>
          ) : (
            <span className="detail-btn detail-btn-disabled">
              <Play size={16} /> Demo coming soon
            </span>
          )}
          <a href={project.repoLink} target="_blank" rel="noreferrer" className="detail-btn detail-btn-outline">
            <FaGithub size={16} /> View code on GitHub
          </a>
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noreferrer" className="detail-btn detail-btn-primary">
              <ExternalLink size={16} /> Live app
            </a>
          )}
        </div>

        <hr className="detail-divider" />

        <section id="project-demo" className="detail-section">
          <span className="section-label">// DEMO</span>
          {project.demoVideo ? (
            <video className="demo-video" controls preload="metadata">
              <source src={project.demoVideo} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : (
            <div className="demo-placeholder">
              [ 2-3 min walkthrough video coming soon ]
            </div>
          )}
        </section>

        <hr className="detail-divider" />

        <section className="detail-section">
          <span className="section-label">// THE PROBLEM</span>
          <p className="detail-text">{project.problem}</p>
        </section>

        <hr className="detail-divider" />

        <section className="detail-section">
          <span className="section-label">// THE SOLUTION</span>
          <p className="detail-text">{project.solutionIntro}</p>
          {hasSolutionSteps && (
            <div className="solution-flow-box">
              {project.solutionSteps.map((step, i) => (
                <div key={i} className={`flow-line ${i === 0 ? 'flow-line-root' : ''}`}>
                  {i > 0 && <span className="flow-arrow">→</span>}
                  {step}
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="detail-divider" />

        <section className="detail-section">
          <span className="section-label">// KEY CAPABILITIES</span>
          {hasCapabilities ? (
            <ul className="capabilities-list">
              {project.capabilities.map((cap, i) => (
                <li key={i}><span className="capability-arrow">▸</span> {cap}</li>
              ))}
            </ul>
          ) : (
            <p className="detail-text">Content coming soon.</p>
          )}
        </section>

        <hr className="detail-divider" />

        <section className="detail-section">
          <span className="section-label">// BUSINESS OUTCOME</span>
          <div className="business-outcome-box">
            {project.businessOutcome}
          </div>
        </section>

        <hr className="detail-divider" />

        <section className="detail-section">
          <span className="section-label">// SOLUTIONS ENGINEERING ARTIFACTS</span>
          <p className="detail-text-muted">
            Practice exercises in the artifacts an SE produces during a technical sales cycle — written from this project's actual architecture.
          </p>
          <div className="artifacts-grid">
            {project.artifacts.map((artifact, i) => (
              artifact.file ? (
                <a
                  key={i}
                  href={artifact.file}
                  target="_blank"
                  rel="noreferrer"
                  className="artifact-card artifact-card-link"
                >
                  <span className="artifact-type">PDF</span>
                  <h4>{artifact.title}</h4>
                  <p>{artifact.description}</p>
                  <span className="artifact-status artifact-status-ready">View PDF →</span>
                </a>
              ) : (
                <div key={i} className="artifact-card artifact-card-disabled">
                  <span className="artifact-type">PDF</span>
                  <h4>{artifact.title}</h4>
                  <p>{artifact.description}</p>
                  <span className="artifact-status">Coming soon</span>
                </div>
              )
            ))}
          </div>
        </section>

        <Link to="/" className="back-link">← Back to portfolio</Link>
      </div>
    </div>
  );
};

export default ProjectDetail;
