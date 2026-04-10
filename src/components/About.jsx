import React from 'react';
import { Terminal, Code, Database, Server } from 'lucide-react';
import './About.css';

const About = () => {
  return (
    <section id="about" className="about-section">
      <div className="container">
        <div className="about-grid.glass-panel glass-panel">
          <div className="about-content">
            <h2 className="heading-lg">About <span className="text-gradient">Me</span></h2>
            <p className="about-text">
              I build web applications that are fast, functional, and built to scale. Self-taught and relentless. I figure things out, push through errors, and never stop building — because the learning never stops either.
            </p>
            <p className="about-text">
              Currently leveling up with Next.js, TypeScript, and AI integration — building projects that don't just work, but think. I'm comfortable working with AI workflows — from integrating LLM APIs into apps to building AI-powered features that solve real problems.
            </p>
            <div className="status-badge">
              <span className="pulse-dot"></span>
              Open to work — Junior Developer / Frontend / Full-Stack roles
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
