import React from 'react';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import profilePhoto from '../assets/himani-profile.jpeg';
import './Hero.css';

const Hero = () => {
  return (
    <section id="home" className="hero-section">
      <div className="grid-overlay"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <span className="badge">
            <Sparkles size={16} />
            Open to junior developer roles
          </span>
          <h1 className="heading-xl hero-title">
            Hi, I'm <span>Himani Agrawal</span>
          </h1>
          <div className="role-capsules" aria-label="Professional roles">
            <span>Frontend Developer</span>
            <span>Full Stack Developer</span>
            <span>Solutions Engineer</span>
          </div>
          <p className="hero-description">
            I turn ideas into apps, create solutions for businesses that work and scale.
          </p>
          <div className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View Projects <ArrowRight size={20} />
            </a>
            <a href={`${import.meta.env.BASE_URL}resume.pdf`} target="_blank" rel="noreferrer" className="btn btn-secondary">
              View Resume <FileText size={20} />
            </a>
          </div>

          <div className="hero-stats" aria-label="Portfolio highlights">
            <div><strong>6+</strong><span>deployed apps</span></div>
            <div><strong>MERN</strong><span>stack focus</span></div>
            <div><strong>AI</strong><span>workflow ready</span></div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Himani Agrawal portrait">
          <div className="portrait-blob"></div>
          <div className="photo-frame">
            <img src={profilePhoto} alt="Himani Agrawal" className="hero-photo" />
          </div>
          <span className="floating-label label-code">React UI</span>
          <span className="floating-label label-product">Product thinking</span>
          <span className="orbit-ring"></span>
        </div>
      </div>

      <div className="skill-ribbon" aria-label="Core skills">
        {['React', 'JavaScript', 'MERN', 'Responsive UI', 'APIs', 'GitHub', 'Problem Solving'].map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
};

export default Hero;
