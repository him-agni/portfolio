import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <a href="#home" className="logo">
          <span className="text-gradient">&lt;Himani /&gt;</span>
        </a>

        {/* Desktop Menu */}
        <div className="desktop-menu">
          <a href="#about" className="nav-link">About</a>
          <a href="#projects" className="nav-link">Projects</a>
          <a href="#contact" className="nav-link">Contact</a>
          <div className="social-links-nav">
            <a href="https://github.com/him-agni" target="_blank" rel="noreferrer" className="social-icon">
              <FaGithub size={20} />
            </a>
            <a href="https://www.linkedin.com/in/himani--agrawal/" target="_blank" rel="noreferrer" className="social-icon">
              <FaLinkedin size={20} />
            </a>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} color="#f8fafc" /> : <Menu size={24} color="#f8fafc" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="mobile-menu glass">
          <a href="#about" onClick={toggleMenu}>About</a>
          <a href="#projects" onClick={toggleMenu}>Projects</a>
          <a href="#contact" onClick={toggleMenu}>Contact</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
