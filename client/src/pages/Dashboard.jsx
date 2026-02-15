import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  CreditCard, User, Settings, Bell, Download,
  Menu, X, Search, ChevronRight, LogOut, LayoutDashboard,
  Calendar, MapPin, ShieldCheck, Award, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleDownload = () => {
    if (!registration) return;
    // Open the download route with token in query for authentication
    window.open(`/api/registrations/download/${registration._id}?token=${user.token}`, '_blank');
  };

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const { data } = await axios.get('/api/registrations/my', {
          headers: {
            Authorization: `Bearer ${user?.token}`
          }
        });
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

  if (loading) return (
    <div className="loading-container">
      <div className="loader"></div>
      <p>Loading Dashboard...</p>
    </div>
  );

  const renderOverview = () => (
    <div className="overview-premium fade-in">
      <div className="stats-grid">
        <div className="stat-card-premium primary">
          <div className="stat-icon-glass"><FileText size={24} /></div>
          <div className="stat-info">
            <span className="stat-label-translucent">Submission Status</span>
            <span className="stat-value-large">{registration?.paperDetails?.reviewStatus || 'Awaiting'}</span>
          </div>
        </div>
        <div className="stat-card-premium accent">
          <div className="stat-icon-glass"><Award size={24} /></div>
          <div className="stat-info">
            <span className="stat-label-translucent">Global Track</span>
            <span className="stat-value-large">{registration?.paperDetails?.track || 'General Intelligence'}</span>
          </div>
        </div>
        <div className="stat-card-premium dark">
          <div className="stat-icon-glass"><CheckCircle size={24} className="text-emerald-400" /></div>
          <div className="stat-info">
            <span className="stat-label-translucent">Profile Verification</span>
            <span className="stat-value-large">Verified {user.role?.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="overview-layout-grid">
        {/* Left Column: Dates & Guidelines */}
        <div className="overview-main-col">
          <div className="content-card date-timeline-card">
            <div className="card-header-premium">
              <Calendar size={20} className="text-blue-500" />
              <h3>Important Deadlines</h3>
            </div>
            <div className="vertical-timeline-premium">
              <div className="timeline-item-p">
                <div className="t-node-p completed"></div>
                <div className="t-content-p">
                  <span className="t-label-p">Abstract Submission</span>
                  <span className="t-date-p">March 8, 2026</span>
                </div>
              </div>
              <div className="timeline-item-p active">
                <div className="t-node-p pulse"></div>
                <div className="t-content-p">
                  <span className="t-label-p">Full Paper Submission</span>
                  <span className="t-date-p highlight">March 16, 2026</span>
                </div>
              </div>
              <div className="timeline-item-p">
                <div className="t-node-p"></div>
                <div className="t-content-p">
                  <span className="t-label-p">Acceptance Notification</span>
                  <span className="t-date-p">March 24, 2026</span>
                </div>
              </div>
              <div className="timeline-item-p">
                <div className="t-node-p"></div>
                <div className="t-content-p">
                  <span className="t-label-p">Conference Date</span>
                  <span className="t-date-p">April 29, 2026</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card guidelines-card-premium">
            <div className="card-header-premium">
              <ShieldCheck size={20} className="text-emerald-500" />
              <h3>Submission Guidelines</h3>
            </div>
            <ul className="guidelines-list-premium">
              <li>
                <div className="g-icon-p"><Layers size={14} /></div>
                <span>Must follow IEEE double-column template.</span>
              </li>
              <li>
                <div className="g-icon-p"><FileText size={14} /></div>
                <span>Maximum 6 pages including references.</span>
              </li>
              <li>
                <div className="g-icon-p"><AlertCircle size={14} /></div>
                <span>Plagiarism must be below 15% (Turnitin).</span>
              </li>
            </ul>
            <div className="card-footer-p">
              <a 
                href="https://www.ieee.org/conferences/publishing/templates.html" 
                target="_blank" 
                rel="noreferrer" 
                className="btn-text-p"
              >
                <Download size={14} /> Get IEEE Template
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Host & Participation */}
        <div className="overview-side-col">
          <div className="content-card host-institution-card">
            <div className="institution-image-p">
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400&auto=format&fit=crop" alt="Campus" />
              <div className="img-tag-p">CIET, Coimbatore</div>
            </div>
            <div className="institution-details-p">
              <h4>Host Institution</h4>
              <p>Coimbatore Institute of Engineering and Technology</p>
              <div className="location-p">
                <MapPin size={14} /> <span>An Autonomous Institute, NAAC 'A'</span>
              </div>
            </div>
          </div>

          <div className="content-card quick-stats-premium">
            <div className="q-stat-row">
              <div className="q-stat-item">
                <span className="q-val">20+</span>
                <span className="q-lab">Countries</span>
              </div>
              <div className="q-stat-item">
                <span className="q-val">150+</span>
                <span className="q-lab">Papers</span>
              </div>
            </div>
            <div className="mt-6">
              <button 
                onClick={() => toast.success('ID Card will be available after registration verification')}
                className="btn-p-full"
              >
                Download ID Card
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMyPaper = () => (
    <div className="paper-ultra-view fade-in">
      <div className="paper-main-grid compact">
        <div className="paper-details-panel">
          <div className="paper-title-compact">
            <h2>{registration?.paperDetails?.title || 'Untitled Research Submission'}</h2>
          </div>
          <div className="panel-section compact">
            <h3 className="section-title-premium-small">Abstract</h3>
            <div className="abstract-card-premium compact">
              <p>{registration?.paperDetails?.abstract || 'No abstract content available at this moment.'}</p>
            </div>
          </div>

          <div className="panel-section compact">
            <h3 className="section-title-premium-small">PDF Preview</h3>
            <div className="pdf-preview-container-premium mini">
              {registration?.paperDetails?.fileUrl ? (
                <iframe 
                  src={`${registration.paperDetails.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                  width="100%" 
                  height="450px" 
                  title="Paper Preview"
                  className="preview-iframe"
                />
              ) : (
                <div className="preview-placeholder-premium compact">
                   <div className="placeholder-icon-small"><FileText size={32} /></div>
                   <p>No document attached</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="paper-sidebar-panel compact">
          <div className="sidebar-group compact">
            <h4 className="group-label">Category & Track</h4>
            <div className="info-pills compact">
              <div className="p-pill">
                <span className="p-label">Conference Track</span>
                <span className="p-value-small">{registration?.paperDetails?.track || 'General Intelligence'}</span>
              </div>
              <div className="p-pill">
                <span className="p-label">Author Category</span>
                <span className="p-value-small">{registration?.personalDetails?.category || 'Professional'}</span>
              </div>
            </div>
          </div>

          <div className="sidebar-group compact">
            <h4 className="group-label">Research Team</h4>
            <div className="team-stack-premium compact">
              <div className="team-member-premium main compact">
                <div className="tm-avatar-mini">{user.name?.charAt(0)}</div>
                <div className="tm-info">
                  <span className="tm-name-small">{user.name}</span>
                  <span className="tm-role-mini">Principal Author</span>
                </div>
              </div>
              {registration?.teamMembers?.map((member, idx) => (
                <div key={idx} className="team-member-premium compact">
                  <div className="tm-avatar-mini secondary">{member.name?.charAt(0)}</div>
                  <div className="tm-info">
                    <span className="tm-name-mini">{member.name}</span>
                    <span className="tm-role-mini">Co-Author</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="sidebar-group compact">
            <h4 className="group-label">Paper Actions</h4>
            <div className="mt-4">
              <button 
                onClick={handleDownload}
                className="btn-p-full"
              >
                <Download size={16} style={{ marginRight: '8px' }} />
                Download Paper
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
  const renderStatus = () => (
    <div className="status-dedicated-view fade-in">
       <div className="status-grid-detailed compact">
          <div className="content-card status-panel">
            <h3 className="section-title-premium-small">Timeline</h3>
            <div className="submission-progress-vertical compact">
              <div className="v-step completed">
                <div className="v-line"></div>
                <div className="v-node"><CheckCircle size={14} /></div>
                <div className="v-info">
                  <span className="v-label">Paper Submitted</span>
                  <span className="v-time">{new Date(registration?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              <div className={`v-step ${registration?.paperDetails?.reviewStatus ? 'completed' : 'active'}`}>
                <div className="v-line"></div>
                <div className="v-node">{registration?.paperDetails?.reviewStatus ? <CheckCircle size={14} /> : <div className="pulse-dot"></div>}</div>
                <div className="v-info">
                  <span className="v-label">Review Process</span>
                  <span className="v-time">Technical Committee</span>
                </div>
              </div>
              <div className={`v-step ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'completed' : ''}`}>
                <div className="v-node">{registration?.paperDetails?.reviewStatus === 'Accepted' ? <CheckCircle size={14} /> : <div className="hollow-dot"></div>}</div>
                <div className="v-info">
                  <span className="v-label">Final Decision</span>
                  <span className="v-time">Final Notification</span>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card remarks-panel">
            <h3 className="section-title-premium-small">Committee Remarks</h3>
            {registration?.paperDetails?.reviewerComments ? (
              <div className="review-box-premium static compact">
                <div className="box-header">
                  <AlertCircle size={14} />
                  <span>Peer Review Feedback</span>
                </div>
                <p>{registration.paperDetails.reviewerComments}</p>
              </div>
            ) : (
              <div className="no-remarks-placeholder compact">
                 <div className="placeholder-content">
                    <Clock size={24} />
                    <p>Awaiting feedback</p>
                 </div>
              </div>
            )}
          </div>
       </div>
    </div>
  );

  const renderPayment = () => (
    <div className="content-card fade-in">
      <div className="mb-8">
        <h3><CreditCard size={24} className="text-primary" /> Billing Dashboard</h3>
      </div>
      
      <div className="payment-grid">
        <div className="payment-status-box">
          <div>
            <p className="status-label">Payment Balance</p>
            <p className="status-value">₹ {registration?.paymentStatus === 'Completed' ? '0' : (registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000')}</p>
          </div>
          <div className="text-right">
            <p className="status-label">Verification</p>
            <div className={`status-badge ${registration?.paymentStatus === 'Completed' ? 'completed' : 'pending'}`}>
               {registration?.paymentStatus || 'Awaiting'}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <div className="fee-breakdown rounded-3xl p-8 bg-white shadow-sm border border-slate-50">
            <h4 className="font-extrabold text-slate-800 mb-6">Fee Breakdown</h4>
            <div className="fee-row">
              <span className="text-slate-500 font-medium">Conference Registration</span>
              <span className="font-extrabold text-slate-700">₹ {registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000'}</span>
            </div>
            <div className="fee-row">
              <span className="text-slate-500 font-medium">Processing Fee (0%)</span>
              <span className="font-extrabold text-slate-700">₹ 0</span>
            </div>
            <div className="fee-total">
               <span className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">Total Amount</span>
               <p className="total-amount">₹ {registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000'}</p>
            </div>
          </div>

          <div className="payment-action-card rounded-3xl p-8 bg-indigo-50/50 border border-indigo-100 flex flex-col items-center justify-center text-center">
            {registration?.paymentStatus === 'Completed' ? (
              <div className="success">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Paid in Full</h4>
                <p className="text-slate-500">Your registration is confirmed. We look forward to seeing you!</p>
              </div>
            ) : registration?.status === 'Accepted' ? (
              <div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Checkout Ready</h4>
                <p className="text-slate-500 mb-6 text-sm">Securely pay using UPI, Card or Internet Banking.</p>
                <button className="btn btn-primary px-10 py-3 rounded-full shadow-lg shadow-indigo-200">Continue to Payment</button>
              </div>
            ) : registration?.status === 'Draft' ? (
              <div>
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Registration in Draft</h4>
                <p className="text-slate-500 text-sm mb-6">You haven't completed your application yet.</p>
                <Link to="/register" className="btn btn-primary px-8 py-2 rounded-full">Resume Registration</Link>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800">Verification in Progress</h4>
                <p className="text-slate-500 text-sm">Reviewing your paper. Payment will be enabled once accepted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-wrapper fade-in">
      {/* Background Orbs */}
      <div className="dash-bg-blob blob-1"></div>
      <div className="dash-bg-blob blob-2"></div>

      <div className={`dashboard ${isSidebarOpen ? 'open' : ''}`}>
        <aside className="sidebar">
          <div className="sidebar-header-card">
            <div className="user-avatar">
              <span>{user?.name?.charAt(0)}</span>
            </div>
            <div className="user-meta">
              <h3>{user?.name}</h3>
              <span className="role-tag">{user?.role === 'author' ? 'AUTHOR' : 'ATTENDEE'}</span>
            </div>
          </div>
          
          <nav className="side-nav">
            <div 
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }}
            >
              <LayoutDashboard size={18} /> Overview
            </div>
            <div 
              className={`nav-item ${activeTab === 'paper' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('paper'); setIsSidebarOpen(false); }}
            >
              <FileText size={18} /> My Paper
            </div>
            <div 
              className={`nav-item ${activeTab === 'status' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('status'); setIsSidebarOpen(false); }}
            >
              <Clock size={18} /> Status
            </div>
            <div 
              className={`nav-item ${activeTab === 'payment' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('payment'); setIsSidebarOpen(false); }}
            >
              <CreditCard size={18} /> Payment
            </div>
            <div 
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
            >
              <Bell size={18} /> Notifications
            </div>
            <div 
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }}
            >
              <Settings size={18} /> Settings
            </div>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-btn" onClick={logout}>
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>

        <main className="dash-main">
          <header className="dash-header">
            <div className="header-text-flex">
              <div className="header-title-group">
                <h1>{activeTab === 'paper' ? 'Submission details' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}</h1>
                {activeTab === 'paper' && (
                  <div className="header-id-badge">
                    #CMP-26-{(registration?._id || 'XXX').slice(-4).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="header-actions-slot">
                {activeTab === 'status' && (
                  <div className={`header-status-badge ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'accepted' : 'pending'}`}>
                    {registration?.paperDetails?.reviewStatus || 'Awaiting Review'}
                  </div>
                )}
                {activeTab === 'paper' && registration?.paperDetails?.fileUrl && (
                  <a href={registration.paperDetails.fileUrl} target="_blank" rel="noreferrer" className="btn-mini-download">
                    <Download size={14} /> Manuscript
                  </a>
                )}
              </div>
            </div>
          </header>

          <div className="tab-content">
            {!registration && activeTab === 'overview' ? (
              <div className="content-card text-center p-12 bg-white rounded-3xl shadow-sm">
                <div className="stat-icon bg-orange-50 text-orange-500 mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center">
                  <AlertCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold mb-4">Registration Pending</h2>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">You haven't completed your registration yet. Complete it to unlock all author features.</p>
                <button onClick={() => window.location.href='/register'} className="btn btn-primary px-10 py-3 rounded-full">Complete Registration</button>
              </div>
            ) : (
              <>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'paper' && renderMyPaper()}
                {activeTab === 'status' && renderStatus()}
                {activeTab === 'payment' && renderPayment()}
                {activeTab === 'notifications' && (
                  <div className="content-card p-12 text-center bg-white rounded-3xl shadow-sm">
                    <div className="stat-icon bg-blue-50 text-blue-500 mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center">
                      <Bell size={40} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Notifications</h3>
                    <p className="text-slate-500">You have no new notifications.</p>
                  </div>
                )}
                {activeTab === 'settings' && (
                  <div className="content-card p-10 bg-white rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                      <Settings size={28} className="text-primary" /> Account Settings
                    </h3>
                    <div className="settings-grid grid gap-8">
                      <div className="settings-section">
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Profile Information</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                            <span className="font-bold text-slate-700">{user.name}</span>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl">
                            <label className="text-xs text-slate-400 block mb-1">Email Address</label>
                            <span className="font-bold text-slate-700">{user.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-slate-100 w-full"></div>
                      <div className="settings-section">
                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 tracking-widest">Security</h4>
                        <button className="btn btn-outline border-slate-200 hover:border-primary px-6 py-2 rounded-xl text-sm transition-all">Change Account Password</button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Sidebar Backdrop Mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default Dashboard;
