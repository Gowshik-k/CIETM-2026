import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="login-container container fade-in">
      <div className="login-card glass">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={32} color="var(--primary-color)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to manage your conference submissions</p>
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
  );
};

export default LoginPage;
