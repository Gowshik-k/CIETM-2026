import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="register-container">
      {/* Left Side - Branding */}
      <div className="register-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon">
              <CheckCircle size={32} />
            </div>
            <span>CIETM 2026</span>
          </div>
          <h1>Join the Future of<br />Engineering & Technology</h1>
          <p>Register now to participate in the International Conference on Contemporary Innovations in Engineering, Technology & Management.</p>
          
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Global Networking</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Expert Keynotes</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Research Publication</span>
            </div>
          </div>
        </div>
        <div className="brand-decoration"></div>
      </div>

      {/* Right Side - Form */}
      <div className="register-form">
        <RegistrationForm 
          startStep={1} 
          showAccountCreation={!user} 
          onSuccess={handleSuccess} 
        />
      </div>
    </div>
  );
};

export default RegisterPage;
