import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';
import './Projects.css';

const Projects = () => {
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
                  {project.slug ? (
                    <>
                      <Link to={`/projects/${project.slug}`} className="overlay-btn">
                        <ExternalLink size={20} /> View Engineering Notes
                      </Link>
                      {project.liveLink && (
                        <a href={project.liveLink} target="_blank" rel="noreferrer" className="overlay-btn">
                          <ExternalLink size={20} /> Live Demo
                        </a>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
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
