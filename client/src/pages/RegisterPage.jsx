import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const RegisterPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = window.location;

  useEffect(() => {
    // Only redirect if the user visits /register directly. 
    // If they are in the middle of registration (just verified email), don't redirect.
    // We can check if they just registered by looking for a flag in sessionStorage or checking if we're inside the registration flow.
    const isRegistering = sessionStorage.getItem('isRegistering');

    if (!authLoading && user) {
      if (!isRegistering) {
        navigate(user.role === 'admin' ? '/admin/dashboard' : '/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await axios.get('/api/settings');
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  if (loading || authLoading || (user && !sessionStorage.getItem('isRegistering'))) {
    return <div className="h-[calc(100vh-80px)] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="flex h-[calc(100vh-80px)] w-full bg-white relative overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden md:flex w-[35%] bg-gradient-to-br from-indigo-500 to-purple-500 relative overflow-hidden text-white p-12 flex-col justify-center">
        <div className="absolute -top-[10%] -right-[20%] w-[50vw] h-[50vw] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_70%)] rounded-full pointer-events-none"></div>
        <div className="relative z-10 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-8 font-extrabold text-2xl tracking-tight">
            <div className="bg-white text-indigo-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transform transition-transform duration-500 hover:rotate-12">
              <CheckCircle size={32} />
            </div>
            <span>CIETM 2026</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 tracking-tight">Join the Future of<br />Engineering & Technology</h1>
          <p className="text-lg opacity-90 leading-relaxed mb-10">Register now to participate in the International Conference on Contemporary Innovations in Engineering, Technology & Management.</p>

          <div className="flex flex-col gap-5">
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Global Networking</span>
            </div>
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Expert Keynotes</span>
            </div>
            <div className="inline-flex items-center gap-4 text-base font-medium bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm w-fit max-w-full">
              <div className="w-6 h-6 bg-white text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle size={14} />
              </div>
              <span>Research Publication</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-[65%] p-6 md:p-10 flex flex-col h-full overflow-hidden relative bg-white">
        {settings && settings.registrationOpen === false ? (
          <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
              <AlertCircle size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Registrations Closed</h2>
              <p className="text-slate-500 leading-relaxed text-lg">We are no longer accepting new registrations for CIETM 2026 at this time. Thank you for your interest!</p>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all">
              <ArrowLeft size={18} /> Return Home
            </Link>
            <p className="text-sm font-medium text-slate-400 mt-4">Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log In</Link></p>
          </div>
        ) : (
          <RegistrationForm
            startStep={1}
            showAccountCreation={!user}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
