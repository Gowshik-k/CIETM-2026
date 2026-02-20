import React, { Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));

const AppContent = () => {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin/dashboard');
  const hideFooter = hideNavbar || location.pathname === '/register' || location.pathname === '/login' || location.pathname === '/admin/login';

  return (
    <div className="min-h-screen flex flex-col">
      {!hideNavbar && <Navbar />}
      <main className="flex-1 relative">
        <Suspense fallback={<div className="flex justify-center items-center h-[60vh] text-2xl font-bold text-primary">Loading CIETM...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/admin/login" element={<LoginPage />} />

            {/* Author Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute role="author">
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </main>
      {!hideFooter && <Footer />}
      <Toaster position="bottom-right" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
