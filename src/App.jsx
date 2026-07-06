import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import ProjectDetail from './components/ProjectDetail';
import ScrollToTop from './components/ScrollToTop';
import './App.css';

const Home = () => (
  <>
    <Navbar />
    <Hero />
    <Projects />
    <About />
    <Contact />
  </>
);

function App() {
  return (
    <div className="App">
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects/:slug" element={<ProjectDetail />} />
      </Routes>
    </div>
  );
}

export default App;
