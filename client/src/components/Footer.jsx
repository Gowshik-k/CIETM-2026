import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Mail, Phone, MapPin, 
  Facebook, Twitter, Linkedin, Instagram,
  ChevronRight, Sparkles 
} from 'lucide-react';

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

  const socialLinkClass = "w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 transition-all duration-300 border border-transparent hover:bg-white hover:text-indigo-600 hover:border-indigo-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/10";
  const footerLinkClass = "text-slate-500 font-semibold text-sm flex items-center justify-center lg:justify-start gap-2 transition-colors hover:text-indigo-600 group";

  return (
    <footer className="bg-white pt-20 border-t border-slate-100 relative z-10">
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 text-center lg:text-left">
        {/* Brand & Mission - Spans 4 columns */}
        <div className="lg:col-span-4">
          <Link to="/" className="text-2xl font-extrabold text-slate-900 tracking-tight mb-6 flex items-center justify-center lg:justify-start gap-1" onClick={() => scrollToSection('#hero')}>
            CIETM <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 font-black">2026</span>
          </Link>
          <p className="text-slate-500 leading-relaxed mb-8 text-sm max-w-sm mx-auto lg:mx-0">
            Empowering the next generation of innovators through academic excellence and 
            global collaboration at the intersection of technology and management.
          </p>
          <div className="flex gap-3 justify-center lg:justify-start">
            <a href="#" aria-label="Facebook" className={socialLinkClass}><Facebook size={18} /></a>
            <a href="#" aria-label="Twitter" className={socialLinkClass}><Twitter size={18} /></a>
            <a href="#" aria-label="LinkedIn" className={socialLinkClass}><Linkedin size={18} /></a>
            <a href="#" aria-label="Instagram" className={socialLinkClass}><Instagram size={18} /></a>
          </div>
        </div>

        {/* Quick Links - Spans 2 columns */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-extrabold mb-6 text-slate-900">Conference</h4>
          <ul className="space-y-3">
            <li><a href="#conference" onClick={(e) => { e.preventDefault(); scrollToSection('#conference'); }} className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Registration Info</a></li>
            <li><a href="#speakers" onClick={(e) => { e.preventDefault(); scrollToSection('#speakers'); }} className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Keynote Speakers</a></li>
            <li><a href="#conference" onClick={(e) => { e.preventDefault(); scrollToSection('#conference'); }} className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Call for Papers</a></li>
            <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }} className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Venue & Travel</a></li>
          </ul>
        </div>

        {/* Support - Spans 2 columns */}
        <div className="lg:col-span-2">
          <h4 className="text-lg font-extrabold mb-6 text-slate-900">Support</h4>
          <ul className="space-y-3">
            <li><Link to="/login" className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Author Login</Link></li>
            <li><Link to="/register" className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> New Registration</Link></li>
            <li><a href="#" className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Download Brochure</a></li>
            <li><a href="#" className={footerLinkClass}><ChevronRight size={14} className="text-indigo-400 group-hover:text-indigo-600 transition-colors" /> Privacy Policy</a></li>
          </ul>
        </div>

        {/* Contact Info - Spans 3 columns */}
        <div className="lg:col-span-4">
          <h4 className="text-lg font-extrabold mb-6 text-slate-900">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex flex-col lg:flex-row gap-4 items-center lg:items-start text-sm text-slate-500 font-semibold group">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-100 transition-colors">
                <MapPin size={16} />
              </div>
              <span className="max-w-[200px]">Elite Convention Centre, Innovation Park, City Centre.</span>
            </li>
            <li className="flex flex-col lg:flex-row gap-4 items-center lg:items-start text-sm text-slate-500 font-semibold group">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-100 transition-colors">
                <Mail size={16} />
              </div>
              <a href="mailto:info@cietm2026.com" className="hover:text-indigo-600 transition-colors">info@cietm2026.com</a>
            </li>
            <li className="flex flex-col lg:flex-row gap-4 items-center lg:items-start text-sm text-slate-500 font-semibold group">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0 group-hover:bg-indigo-100 transition-colors">
                <Phone size={16} />
              </div>
              <a href="tel:+1234567890" className="hover:text-indigo-600 transition-colors">+1 (234) 567-890</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="py-8 bg-slate-50 border-t border-slate-100">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 font-medium">
          <p>&copy; 2026 International Conference CIETM. All rights reserved.</p>
          <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border border-slate-200 text-slate-700 text-xs font-bold shadow-sm">
            <Sparkles size={12} className="text-indigo-500" />
            <span>Designed for Innovation</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
