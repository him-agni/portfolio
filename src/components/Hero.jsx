import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import profilePhoto from "../assets/himani-profile.jpeg";
import "./Hero.css";

const skills = [
  "React",
  "JavaScript",
  "TypeScript",
  "Next.js",
  "MongoDB",
  "Node.js",
  "Express.js",
  "APIs",
  "Webhooks",
  "LLM Integration",
  "GitHub",
  "GitHub Actions",
  "AWS",
  "Docker",
  "SQL",
  "Python",
  "Firebase",
  "Supabase",
];

const Hero = () => {
  const scrollToProjects = (event) => {
    event.preventDefault();
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="hero-section">
      <div className="grid-overlay"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="heading-xl hero-title">
            Hi, I'm <span>Himani Agrawal</span>
          </h1>
          <div className="role-capsules" aria-label="Professional roles">
            <span>AI-Ready Full-Stack Developer</span>
          </div>
          <p className="hero-description">
            I build customer-focused technical projects that demonstrate API
            integrations, solution design, clear demos, and honest architecture
            trade-offs.
          </p>
          <div className="hero-actions">
            <a
              href="#projects"
              className="btn btn-primary"
              onClick={scrollToProjects}
            >
              View Projects <ArrowRight size={20} />
            </a>
            <a
              href={`${import.meta.env.BASE_URL}resume.pdf`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
            >
              View Resume <FileText size={20} />
            </a>
          </div>

          <div className="hero-stats" aria-label="Portfolio highlights">
            <div>
              <strong>6+</strong>
              <span>deployed apps</span>
            </div>
            <div>
              <strong>MERN</strong>
              <span>stack focus</span>
            </div>
            <div>
              <strong>AI</strong>
              <span>workflow ready</span>
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-label="Himani Agrawal portrait">
          <div className="portrait-blob"></div>
          <div className="photo-frame">
            <img
              src={profilePhoto}
              alt="Himani Agrawal"
              className="hero-photo"
            />
          </div>
          <span className="floating-label label-code">React UI</span>
          <span className="floating-label label-product">
            Solution oriented
          </span>
          <span className="orbit-ring"></span>
        </div>
      </div>

      <div
        className="skill-ribbon"
        aria-label={`Core skills: ${skills.join(", ")}`}
      >
        <div className="skill-track">
          <div className="skill-set">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <div className="skill-set" aria-hidden="true">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
