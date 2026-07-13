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
              I'm a solutions-focused engineer who bridges customer problems and technical implementation. I design integrations, build working demos, and explain architecture clearly so technical and business stakeholders can evaluate a solution with confidence.
            </p>
            <p className="about-text">
              My strongest areas are APIs, webhooks, authentication, data flows, observability, and technical documentation. I enjoy turning ambiguous requirements into practical solution designs, while communicating trade-offs honestly and keeping the customer outcome in focus.
            </p>
            <div className="status-badge">
              <span className="pulse-dot"></span>
              Open to Solutions Engineer and Sales Engineer opportunities — Austin or remote
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
