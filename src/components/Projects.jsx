import React from 'react';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import './Projects.css';

const Projects = () => {
  const projectsData = [
    {
      title: 'SaaS Integration Hub',
      description: 'A multi-API integration hub designed to connect SaaS workflows, centralize external services, and make operational data easier to manage.',
      image: 'https://opengraph.githubassets.com/portfolio-saas-integration/him-agni/MutliAPI_integration_hub',
      tags: ['React', 'APIs', 'SaaS', 'Integration'],
      liveLink: 'https://multi-api-integration-hub-frontend.vercel.app/dashboard',
      repoLink: 'https://github.com/him-agni/MutliAPI_integration_hub'
    },
    {
      title: 'Release Intelligence Dashboard',
      description: 'A dashboard for tracking release activity, surfacing engineering signals, and turning changelog noise into useful product intelligence.',
      image: `${import.meta.env.BASE_URL}release-intelligence-dashboard.svg`,
      tags: ['React', 'Dashboard', 'Analytics', 'Automation'],
      liveLink: 'https://release-intelligence-dashboard.vercel.app/',
      repoLink: 'https://github.com/him-agni/release-intelligence-dashboard'
    },
    {
      title: 'Lead Form Automation Hub',
      description: 'An automation-focused lead capture hub built to streamline form submissions, routing, and follow-up workflows for business teams.',
      image: 'https://opengraph.githubassets.com/portfolio-lead-automation/him-agni/lead-form-automation-hub',
      tags: ['React', 'Automation', 'Forms', 'Workflow'],
      repoLink: 'https://github.com/him-agni/lead-form-automation-hub'
    },
    {
      title: 'GitHub Stats Tracker',
      description: 'A dynamic developer dashboard that visualizes GitHub profile statistics. Built with modern UI patterns and seamless API integrations.',
      image: `${import.meta.env.BASE_URL}github-stats.png`,
      tags: ['React', 'JavaScript', 'CSS', 'GitHub API'],
      liveLink: 'https://github-stats-tracker-three.vercel.app/',
      repoLink: 'https://github.com/him-agni/github-stats-tracker'
    },
    {
      title: 'Personal Finance Tracker',
      description: 'A full-stack application to track expenses and manage personal finances. Features a sleek dark-mode glassmorphic UI and intuitive data visualization.',
      image: `${import.meta.env.BASE_URL}finance-tracker.png`,
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
                  {project.liveLink ? (
                    <a href={project.liveLink} target="_blank" rel="noreferrer" className="overlay-btn">
                      <ExternalLink size={20} /> Live Demo
                    </a>
                  ) : (
                    <span className="overlay-btn overlay-btn-disabled">
                      <ExternalLink size={20} /> Deploy soon
                    </span>
                  )}
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
