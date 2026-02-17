import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

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

  const inputClass = "input-field text-sm bg-slate-50 focus:bg-white";
  const labelClass = "flex items-center gap-2 mb-1.5 font-bold text-slate-700 text-xs uppercase tracking-wide";

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex w-[35%] bg-gradient-to-br from-indigo-500 to-purple-500 relative overflow-hidden text-white p-12 flex-col justify-center">
        <div className="absolute -top-[10%] -right-[20%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8 font-extrabold text-2xl tracking-tight">
            <div className="bg-white text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle size={32} />
            </div>
            <span>CIETM 2026</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight mb-6 tracking-tight">Welcome Back to<br />Innovation</h1>
          <p className="text-lg opacity-90 leading-relaxed mb-10">Sign in to access your dashboard, manage submissions, and stay updated with conference news.</p>
          
          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Track Your Paper</span>
            </div>
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Manage Registration</span>
            </div>
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Access Resources</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-[65%] p-6 flex flex-col items-center justify-center bg-white h-full overflow-y-auto">
        <div className="w-full max-w-sm">
            <div className="mb-6 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1 tracking-tight">Sign In</h1>
            <p className="text-slate-500 text-sm">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-4">
                <label className={labelClass}><Mail size={16} /> Email Address</label>
                <input 
                type="email" 
                placeholder="name@institution.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
                />
            </div>
            <div className="mb-4">
                <label className={labelClass}><Lock size={16} /> Password</label>
                <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                />
            </div>
            
            <div className="text-right mb-6 -mt-2">
                <button 
                    type="button" 
                    onClick={() => setShowForgotModal(true)}
                    className="bg-transparent border-none text-indigo-600 text-sm font-semibold cursor-pointer p-0 hover:text-indigo-700 hover:underline transition-colors"
                >
                    Forgot Password?
                </button>
            </div>

            <button type="submit" className="btn btn-primary w-full py-3.5 mt-2 justify-center shadow-indigo-500/20" disabled={loading}>
                {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
            </button>
            </form>

            <div className="mt-6 flex flex-col gap-2 text-sm text-center text-slate-500">
            <p>Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">Register Now</Link></p>
            <Link to="/admin/login" className="text-xs uppercase tracking-wider opacity-60 hover:opacity-100 transition-opacity">Admin Login</Link>
            </div>
        </div>
      </div>

        {showForgotModal && (
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                    <h3 className="mb-2 text-slate-900 text-2xl font-bold">Reset Password</h3>
                    <p className="text-slate-500 text-sm mb-6 leading-relaxed">Enter your email address and we'll send you a link to reset your password.</p>
                    <form onSubmit={handleForgotPassword}>
                        <div className="mb-6">
                            <label className="block mb-2 font-bold text-slate-800 text-sm">Email Address</label>
                            <input 
                                type="email" 
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="name@institution.edu"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-6">
                            <button 
                                type="button" 
                                onClick={() => setShowForgotModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={forgotLoading}
                                className="btn btn-primary px-6 py-2.5 rounded-xl text-sm"
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
