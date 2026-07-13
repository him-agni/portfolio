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
              I'm an entry-level Solutions Engineer candidate with a full-stack engineering foundation. I built this portfolio to demonstrate how I approach realistic customer problems, API integrations, technical demos, architecture decisions, and implementation trade-offs.
            </p>
            <p className="about-text">
              I haven't held a professional Solutions Engineer role yet. My experience comes from hands-on portfolio projects and self-directed learning across APIs, webhooks, authentication, data flows, observability, and technical documentation. I'm ready to bring that foundation, curiosity, and communication-first mindset to an entry-level team.
            </p>
            <div className="status-badge">
              <span className="pulse-dot"></span>
              Open to entry-level Solutions Engineer and Sales Engineer opportunities — Austin or remote
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
