import React from 'react';
import { ChevronRight, FileText } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="hero-glow shape-1"></div>
      <div className="hero-glow shape-2"></div>

      <div className="container hero-container animate-fade-in">
        <div className="hero-content">
          <span className="badge glass">Welcome to my portfolio</span>
          <h1 className="heading-xl hero-title">
            Hi, I'm <span className="text-gradient">Himani Agrawal</span>
          </h1>
          <h2 className="heading-lg hero-subtitle">
            I build web apps that solve real problems.
          </h2>
          <p className="hero-description">
            Self-taught Software Developer passionate about React, JavaScript, and MERN stack building frontend and fullstack applications.

          </p>

          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View My Work <ChevronRight size={20} />
            </a>
            <a href="/resume.pdf" target="_blank" rel="noreferrer" className="btn btn-secondary glass">
              View Resume <FileText size={20} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
