import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const scrollToSection = (id) => {
    setIsOpen(false);
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
    <nav className="navbar glass">
      <div className="container nav-content">
        <Link to="/" className="logo" onClick={() => scrollToSection('#hero')}>
          CIETM <span className="logo-accent">2026</span>
        </Link>

        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}>Home</a>
          <a href="#about-conference" onClick={(e) => { e.preventDefault(); scrollToSection('#about-conference'); }}>Conference</a>
          <a href="#speakers" onClick={(e) => { e.preventDefault(); scrollToSection('#speakers'); }}>Speakers</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('#about'); }}>About College</a>
          
          <div className="mobile-auth-actions">
            {user ? (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                  className="btn btn-outline"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary nav-btn-mobile">
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>

        <div className="mobile-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
