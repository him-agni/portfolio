import React from 'react';
import { MapPin } from 'lucide-react';
import { FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-container glass-panel">
          <div className="section-header">
            <h2 className="heading-lg">Get In <span className="text-gradient">Touch</span></h2>
            <p className="section-subtitle">Let's build something amazing together.</p>
          </div>
          
          <div className="contact-links">
            <a href="https://www.linkedin.com/in/himani--agrawal/" target="_blank" rel="noreferrer" className="contact-card glass group">
              <div className="icon-wrapper">
                <FaLinkedin size={28} />
              </div>
              <h3>LinkedIn</h3>
              <p>Connect and be part of my journey.</p>
            </a>
            
            <a href="https://github.com/him-agni" target="_blank" rel="noreferrer" className="contact-card glass group">
              <div className="icon-wrapper">
                <FaGithub size={28} />
              </div>
              <h3>GitHub</h3>
              <p>Explore my code and growth.</p>
            </a>

            <a href="https://www.instagram.com/webdevlearns" target="_blank" rel="noreferrer" className="contact-card glass group">
              <div className="icon-wrapper">
                <FaInstagram size={28} />
              </div>
              <h3>Instagram</h3>
              <p>Educational web dev content.</p>
            </a>
            
            <div className="contact-card glass">
              <div className="icon-wrapper">
                <MapPin size={28} />
              </div>
              <h3>Location</h3>
              <p>Open to roles in Austin and remote.</p>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="footer">
        <p>© {new Date().getFullYear()} Himani Agrawal. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default Contact;
