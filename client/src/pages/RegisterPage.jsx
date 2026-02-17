import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircle } from 'lucide-react';
import RegistrationForm from '../components/RegistrationForm';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

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
