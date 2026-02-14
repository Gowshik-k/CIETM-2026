import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, 
  Facebook, Twitter, Linkedin, Instagram,
  ChevronRight, Sparkles 
} from 'lucide-react';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate('/' + id);
      return;
    }
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="footer-root">
      <div className="container footer-grid">
        {/* Brand & Mission */}
        <div className="footer-section brand-info">
          <Link to="/" className="footer-logo" onClick={() => scrollToSection('#hero')}>
            CIETM <span className="logo-accent">2026</span>
          </Link>
          <p className="brand-desc">
            Empowering the next generation of innovators through academic excellence and 
            global collaboration at the intersection of technology and management.
          </p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h4>Conference</h4>
          <ul className="footer-links">
            <li><a href="#conference" onClick={(e) => { e.preventDefault(); scrollToSection('#conference'); }}><ChevronRight size={14} /> Registration Info</a></li>
            <li><a href="#speakers" onClick={(e) => { e.preventDefault(); scrollToSection('#speakers'); }}><ChevronRight size={14} /> Keynote Speakers</a></li>
            <li><a href="#conference" onClick={(e) => { e.preventDefault(); scrollToSection('#conference'); }}><ChevronRight size={14} /> Call for Papers</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}><ChevronRight size={14} /> Venue & Travel</a></li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4>Support</h4>
          <ul className="footer-links">
            <li><Link to="/login"><ChevronRight size={14} /> Author Login</Link></li>
            <li><Link to="/register"><ChevronRight size={14} /> New Registration</Link></li>
            <li><a href="#"><ChevronRight size={14} /> Download Brochure</a></li>
            <li><a href="#"><ChevronRight size={14} /> Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section contact-info">
          <h4>Contact Us</h4>
          <ul className="contact-list">
            <li>
              <MapPin size={18} className="icon-primary" />
              <span>Elite Convention Centre, Innovation Park, City Centre.</span>
            </li>
            <li>
              <Mail size={18} className="icon-primary" />
              <a href="mailto:info@cietm2026.com">info@cietm2026.com</a>
            </li>
            <li>
              <Phone size={18} className="icon-primary" />
              <a href="tel:+1234567890">+1 (234) 567-890</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container bottom-content">
          <p>&copy; 2026 International Conference CIETM. All rights reserved.</p>
          <div className="badge-spark">
            <Sparkles size={14} />
            <span>Designed for Innovation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
