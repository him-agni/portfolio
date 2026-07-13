import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';
import { projectsData } from '../data/projectsData';
import './Projects.css';

const FeaturedProjectCard = ({ project }) => (
  <article className="project-card glass-panel group">
    <div className="project-image-wrapper">
      <img src={project.image} alt={project.title} className="project-image" />
      <div className="project-overlay">
        <Link to={`/projects/${project.slug}`} className="overlay-btn">
          <ExternalLink size={20} /> View Engineering Notes
        </Link>
        {project.liveLink && (
          <a href={project.liveLink} target="_blank" rel="noreferrer" className="overlay-btn">
            <ExternalLink size={20} /> Live Demo
          </a>
        )}
      </div>
    </div>
    <div className="project-info">
      <h3 className="heading-md">{project.title}</h3>
      <p className="project-desc">{project.description}</p>
      <div className="project-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  </article>
);

const OtherBuildCard = ({ project }) => (
  <article className="other-build-card glass">
    <div>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
    </div>
    <div className="project-tags">
      {project.tags.map((tag) => (
        <span key={tag} className="tag">{tag}</span>
      ))}
    </div>
    <div className="other-build-actions">
      {project.liveLink && (
        <a href={project.liveLink} target="_blank" rel="noreferrer">
          <ExternalLink size={17} /> Live Demo
        </a>
      )}
      <a href={project.repoLink} target="_blank" rel="noreferrer">
        <FaGithub size={17} /> Source Code
      </a>
    </div>
  </article>
);

const Projects = () => {
  const featuredProjects = projectsData.filter((project) => project.slug);
  const otherProjects = projectsData.filter((project) => !project.slug);

  return (
    <section id="projects" className="projects-section">
      <div className="container">
        <div className="section-header">
          <h2 className="heading-lg">Featured <span className="text-gradient">Projects</span></h2>
          <p className="section-subtitle">Customer problems translated into integrations, technical demos, and implementation-ready solutions.</p>
        </div>

        <div className="projects-grid">
          {featuredProjects.map((project) => (
            <FeaturedProjectCard key={project.slug} project={project} />
          ))}
        </div>

        <div className="other-builds">
          <div className="other-builds-header">
            <span className="other-builds-label">// OTHER BUILDS</span>
            <h3 className="heading-md">Additional Development Projects</h3>
            <p>Smaller applications that demonstrate additional frontend and full-stack range.</p>
          </div>
          <div className="other-builds-grid">
            {otherProjects.map((project) => (
              <OtherBuildCard key={project.title} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
