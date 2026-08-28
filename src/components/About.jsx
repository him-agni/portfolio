import React from 'react';
import { Terminal, Code, Database, Server } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid glass-panel">
          <div className="about-content">
            <h2 className="heading-lg">About <span className="text-gradient">Me</span></h2>
            <p className="about-text">
              I'm an AI-ready full-stack developer with a foundation in building practical, customer-focused applications. I built this portfolio to demonstrate how I approach realistic problems, API integrations, technical demos, architecture decisions, and implementation trade-offs.
            </p>
            <p className="about-text">
              My experience comes from hands-on portfolio projects and self-directed learning across APIs, webhooks, authentication, data flows, observability, and technical documentation. I'm ready to bring that foundation, curiosity, and communication-first mindset to a collaborative development team.
            </p>
            <div className="status-badge">
              <span className="pulse-dot"></span>
              Open to AI-ready full-stack developer roles — Austin or remote
            </div>
          </div>
          
          <div className="skills-content">
            <h3 className="heading-md" style={{ marginBottom: '1.5rem' }}>Tech Stack</h3>
            <div className="skills-grid">
              <div className="skill-item glass">
                <Code size={24} color="var(--accent-primary)" />
                <span>React / Next.js</span>
              </div>
              <div className="skill-item glass">
                <Terminal size={24} color="var(--accent-secondary)" />
                <span>JavaScript / TS</span>
              </div>
              <div className="skill-item glass">
                <Database size={24} color="var(--accent-tertiary)" />
                <span>MongoDB / SQL</span>
              </div>
              <div className="skill-item glass">
                <Server size={24} color="#f59e0b" />
                <span>Node.js / Express</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
