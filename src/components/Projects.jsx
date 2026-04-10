import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import './Projects.css';

const Projects = () => {
  const projectsData = [
    {
      title: 'GitHub Stats Tracker',
      description: 'A dynamic developer dashboard that visualizes GitHub profile statistics. Built with modern UI patterns and seamless API integrations.',
      image: '/github-stats.png',
      tags: ['React', 'JavaScript', 'CSS', 'GitHub API'],
      liveLink: 'https://github-stats-tracker-three.vercel.app/',
      repoLink: 'https://github.com/him-agni/github-stats-tracker'
    },
    {
      title: 'Personal Finance Tracker',
      description: 'A full-stack application to track expenses and manage personal finances. Features a sleek dark-mode glassmorphic UI and intuitive data visualization.',
      image: '/finance-tracker.png',
      tags: ['MERN', 'React', 'MongoDB', 'Express', 'Vite'],
      liveLink: 'https://personal-finance-tracker-tkfm.vercel.app/login',
      repoLink: 'https://github.com/him-agni/personal-finance-tracker'
    }
  ];

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Featured <span className="text-gradient">Projects</span></h2>
          <p className="section-subtitle">A selection of my recent full-stack work</p>
        </div>

        <div className="projects-grid">
          {projectsData.map((project, index) => (
            <div key={index} className="project-card glass-panel group">
              <div className="project-image-wrapper">
                <img src={project.image} alt={project.title} className="project-image" />
                <div className="project-overlay">
                  <a href={project.liveLink} target="_blank" rel="noreferrer" className="overlay-btn">
                    <ExternalLink size={20} /> Live Demo
                  </a>
                  <a href={project.repoLink} target="_blank" rel="noreferrer" className="overlay-btn">
                    <FaGithub size={20} /> Source Code
                  </a>
                </div>
              </div>
              <div className="project-info">
                <h3 className="heading-md">{project.title}</h3>
                <p className="project-desc">{project.description}</p>
                <div className="project-tags">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
