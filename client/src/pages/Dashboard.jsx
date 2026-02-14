import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  CreditCard, User, Settings, Bell, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const { data } = await axios.get('/api/registrations/my');
        setRegistration(data);
      } catch (error) {
        console.error("Failed to fetch registration", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRegistration();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'gray';
      case 'Submitted': return 'blue';
      case 'Under Review': return 'orange';
      case 'Accepted': return 'green';
      case 'Rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Draft': return <Clock size={20} />;
      case 'Submitted': return <FileText size={20} />;
      case 'Under Review': return <Clock size={20} />;
      case 'Accepted': return <CheckCircle size={20} />;
      case 'Rejected': return <AlertCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  if (loading) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard container fade-in">
      <aside className="sidebar glass">
        <div className="user-info">
          <div className="avatar">{user.name.charAt(0)}</div>
          <h3>{user.name}</h3>
          <p>{user.role}</p>
        </div>
        <nav className="side-nav">
          <button className="active"><User size={20} /> Overview</button>
          <button><FileText size={20} /> My Paper</button>
          <button><CreditCard size={20} /> Payment</button>
          <button><Bell size={20} /> Notifications</button>
          <button><Settings size={20} /> Settings</button>
        </nav>
      </aside>

      <main className="dash-main">
        <header className="dash-header">
          <h1>Author Dashboard</h1>
          <p>Welcome back, {user.name.split(' ')[0]}!</p>
        </header>

        {!registration ? (
          <div className="no-reg card">
            <AlertCircle size={48} color="var(--warning-color)" />
            <h2>Registration Pending</h2>
            <p>You haven't completed your registration yet.</p>
            <button onClick={() => window.location.href='/register'} className="btn btn-primary mt-4">Complete Registration</button>
          </div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary-color)' }}>
                  {getStatusIcon(registration.status)}
                </div>
                <div className="stat-info">
                  <p>Current Status</p>
                  <h3 style={{ color: `var(--${getStatusColor(registration.status)}-color)` }}>{registration.status}</h3>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--success-color)' }}>
                  <CreditCard size={20} />
                </div>
                <div className="stat-info">
                  <p>Payment Status</p>
                  <h3>{registration.paymentStatus || 'Pending'}</h3>
                </div>
              </div>
            </div>

            <div className="main-content-grid">
              <div className="card registration-details">
                <div className="card-header">
                  <h3>Registration Details</h3>
                  <button className="btn-text">Edit</button>
                </div>
                <div className="detail-list">
                  <p><strong>Title:</strong> {registration.paperDetails?.title}</p>
                  <p><strong>Category:</strong> {registration.personalDetails?.category}</p>
                  <p><strong>Co-authors:</strong> {registration.teamMembers?.length || 0}</p>
                </div>
                {registration.paperDetails?.fileUrl && (
                  <a href={registration.paperDetails.fileUrl} target="_blank" rel="noreferrer" className="btn btn-outline mt-4">
                    <Download size={18} /> View Submitted Paper
                  </a>
                )}
              </div>

              <div className="card timeline">
                <h3>Recent Activity</h3>
                <div className="timeline-list">
                  <div className="timeline-item">
                    <div className="dot active"></div>
                    <div className="content">
                      <p><strong>Registration {registration.status}</strong></p>
                      <span>{new Date(registration.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  {registration.status === 'Draft' && (
                    <div className="timeline-item">
                      <div className="dot"></div>
                      <div className="content">
                        <p>Submit Final Version</p>
                        <span>Action Required</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {registration.status === 'Accepted' && registration.paymentStatus !== 'Completed' && (
              <div className="payment-alert fade-in">
                <div className="icon"><CreditCard size={32} /></div>
                <div className="text">
                  <h3>Congratulations! Your paper has been accepted.</h3>
                  <p>Please complete the payment to confirm your registration.</p>
                </div>
                <button className="btn btn-primary">Pay Now</button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
