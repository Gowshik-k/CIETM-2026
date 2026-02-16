import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowRight, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './LoginPage.css'; // Reusing styles

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
            <div className="login-container container fade-in">
                <div className="login-card glass text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle size={64} className="text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Password Reset Successful!</h2>
                    <p className="text-gray-600 mb-6">You can now login with your new password.</p>
                    <button onClick={() => navigate('/login')} className="btn btn-primary w-full justify-center">
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="login-container container fade-in">
            <div className="login-card glass">
                <div className="login-header">
                    <div className="login-logo">
                        <Lock size={32} color="var(--primary-color)" />
                    </div>
                    <h1>Reset Password</h1>
                    <p>Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label><Lock size={16} /> New Password</label>
                        <input 
                            type="password" 
                            placeholder="New password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label><Lock size={16} /> Confirm Password</label>
                        <input 
                            type="password" 
                            placeholder="Confirm new password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn btn btn-primary" disabled={loading}>
                        {loading ? 'Reseting...' : 'Reset Password'} <ArrowRight size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
