import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            await axios.put(`/api/auth/reset-password/${token}`, { password });
            setSuccess(true);
            toast.success("Password reset successful!");
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password. Link may have expired.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-white/50 animate-[fadeIn_0.5s_ease-out] text-center">
                    <div className="flex justify-center mb-6">
                        <CheckCircle size={64} className="text-blue-500 drop-shadow-md" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-slate-800 mb-2">Password Reset Successful!</h2>
                    <p className="text-slate-500 font-medium mb-8">You can now login with your new password.</p>
                    <button onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] border border-white/50 animate-[fadeIn_0.5s_ease-out]">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200 rotate-3 hover:rotate-6 transition-transform">
                        <Lock size={32} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-800 mb-2 tracking-tight">Reset Password</h1>
                    <p className="text-slate-500 font-medium text-sm">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
                           <Lock size={12} /> New Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="New password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
                        />
                    </div>
                    <div className="flex flex-col gap-2 group">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
                           <Lock size={12} /> Confirm Password
                        </label>
                        <input 
                            type="password" 
                            placeholder="Confirm new password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-slate-400 text-slate-800"
                        />
                    </div>
                    <button type="submit" className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed" disabled={loading}>
                        {loading ? 'Reseting...' : 'Reset Password'} <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
