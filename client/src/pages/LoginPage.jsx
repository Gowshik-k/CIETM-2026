import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await login(email, password);
      toast.success("Login Successful!");
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error("Please enter your email");
    
    setForgotLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      toast.success("Password reset link sent to your email");
      setShowForgotModal(false);
      setForgotEmail('');
    } catch (error) {
        toast.error(error.response?.data?.message || "Failed to send reset link");
    } finally {
        setForgotLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Branding */}
      <div className="login-brand">
        <div className="brand-content">
          <div className="brand-logo">
            <div className="logo-icon">
              <CheckCircle size={32} />
            </div>
            <span>CIETM 2026</span>
          </div>
          <h1>Welcome Back to<br />Innovation</h1>
          <p>Sign in to access your dashboard, manage submissions, and stay updated with conference news.</p>
          
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Track Your Paper</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Manage Registration</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon"><CheckCircle size={20} /></div>
              <span>Access Resources</span>
            </div>
          </div>
        </div>
        <div className="brand-decoration"></div>
      </div>

      {/* Right Side - Form */}
      <div className="login-form-wrapper">
        <div className="login-content">
            <div className="login-header">
            <div className="login-icon-header">
                <LogIn size={32} color="var(--primary-color)" />
            </div>
            <h1>Sign In</h1>
            <p>Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
                <label><Mail size={16} /> Email Address</label>
                <input 
                type="email" 
                placeholder="name@institution.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                />
            </div>
            <div className="form-group">
                <label><Lock size={16} /> Password</label>
                <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />
            </div>
            
            <div className="forgot-password-wrapper">
                <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="forgot-password-btn"
                >
                    Forgot Password?
                </button>
            </div>

            <button type="submit" className="login-btn btn btn-primary" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            </form>

            <div className="login-footer">
            <p>Don't have an account? <Link to="/register">Register Now</Link></p>
            <Link to="/admin/login" className="admin-link">Admin Login</Link>
            </div>
        </div>
      </div>

        {showForgotModal && (
            <div className="modal-overlay fade-in">
                <div className="modal-content glass">
                    <h3>Reset Password</h3>
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <form onSubmit={handleForgotPassword}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input 
                                type="email" 
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="name@institution.edu"
                                required
                            />
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                onClick={() => setShowForgotModal(false)}
                                className="btn btn-secondary"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={forgotLoading}
                                className="btn btn-primary"
                            >
                                {forgotLoading ? 'Sending...' : 'Send Link'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default LoginPage;
