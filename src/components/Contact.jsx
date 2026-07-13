import React from 'react';
import { Mail, MapPin } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <div className="contact-container glass-panel">
          <div className="section-header">
            <h2 className="heading-lg">Get In <span className="text-gradient">Touch</span></h2>
            <p className="section-subtitle">Open to entry-level Solutions Engineer and Sales Engineer opportunities.</p>
          </div>
          
          <div className="contact-links">
            <a href="mailto:himani.agrawal.us@gmail.com" className="contact-card glass group">
              <div className="icon-wrapper">
                <Mail size={28} />
              </div>
              <h3>Email</h3>
              <p className="contact-email">himani.agrawal.us@gmail.com</p>
            </a>

            <a href="https://www.linkedin.com/in/himani--agrawal/" target="_blank" rel="noreferrer" className="contact-card glass group">
              <div className="icon-wrapper">
                <FaLinkedin size={28} />
              </div>
              <h3>LinkedIn</h3>
              <p>Connect about entry-level Solutions Engineering opportunities.</p>
            </a>
            
            <a href="https://github.com/him-agni" target="_blank" rel="noreferrer" className="contact-card glass group">
              <div className="icon-wrapper">
                <FaGithub size={28} />
              </div>
              <h3>GitHub</h3>
              <p>Review the code behind my technical projects.</p>
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
