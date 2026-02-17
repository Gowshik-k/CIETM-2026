import React, { useState, useEffect, useCallback } from 'react';
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
import RegistrationForm from '../components/RegistrationForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Moved fetchRegistration outside useEffect to allow refreshing
  const fetchRegistration = useCallback(async () => {
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
  }, [user]);

  useEffect(() => {
    fetchRegistration();
  }, [fetchRegistration]);

  const handleDownload = () => {
    if (!registration) return;
    // Open the download route with token in query for authentication
    window.open(`/api/registrations/download/${registration._id}?token=${user.token}`, '_blank');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'Submitted': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Under Review': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'Accepted': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'Rejected': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-500 bg-slate-100 border-slate-200';
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading Dashboard...</p>
    </div>
  );

  const renderOverview = () => (
    <div className="animate-[fadeIn_0.6s_ease-out]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-white">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-7 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-white/10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white shadow-inner"><FileText size={24} /></div>
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-100 opacity-80 block mb-1">Submission Status</span>
            <span className="text-3xl lg:text-4xl font-black tracking-tight">{registration?.status || 'Not Started'}</span>
          </div>
           {/* Decor */}
           <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-7 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-white/10">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white shadow-inner"><Award size={24} /></div>
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-100 opacity-80 block mb-1">Global Track</span>
            <span className="text-xl lg:text-2xl font-black tracking-tight leading-tight line-clamp-2">{registration?.paperDetails?.track || 'N/A'}</span>
          </div>
           <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>
        <div className="bg-slate-800 p-7 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300 border border-slate-700">
          <div className="w-12 h-12 bg-emerald-500/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-emerald-400 shadow-inner border border-emerald-500/20"><CheckCircle size={24} /></div>
          <div className="relative z-10">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 opacity-80 block mb-1">Profile Verification</span>
            <span className="text-xl lg:text-2xl font-black tracking-tight text-white">Verified {user.role?.toUpperCase()}</span>
          </div>
           <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Left Column: Dates & Guidelines */}
        <div className="flex flex-col gap-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20} /></div>
              <h3 className="text-lg font-bold text-slate-800">Important Deadlines</h3>
            </div>
            <div className="flex flex-col gap-0 relative pl-4">
               {/* Vertical Line */}
               <div className="absolute left-[29px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
              {[
                { label: 'Abstract Submission', date: 'March 8, 2026', status: 'completed' },
                { label: 'Full Paper Submission', date: 'March 16, 2026', status: 'active' },
                { label: 'Acceptance Notification', date: 'March 24, 2026', status: 'pending' },
                { label: 'Conference Date', date: 'April 29, 2026', status: 'pending' }
              ].map((item, idx) => (
                <div key={idx} className={`relative flex gap-6 pb-8 last:pb-0 group ${item.status === 'active' ? 'opacity-100' : 'opacity-70 hover:opacity-100 transition-opacity'}`}>
                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 shrink-0 bg-white transition-all duration-300 ${item.status === 'completed' ? 'border-indigo-500 bg-indigo-500' : item.status === 'active' ? 'border-indigo-500 text-indigo-600 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]' : 'border-slate-200'}`}>
                        {item.status === 'completed' && <CheckCircle size={14} className="text-white" />}
                        {item.status === 'active' && <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>}
                    </div>
                    <div className="flex flex-col pt-1">
                        <span className={`text-base font-bold ${item.status === 'active' ? 'text-indigo-900' : 'text-slate-700'}`}>{item.label}</span>
                        <span className={`text-sm font-semibold ${item.status === 'active' ? 'text-indigo-600' : 'text-slate-400'}`}>{item.date}</span>
                    </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-0"></div>
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-50 relative z-10">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
              <h3 className="text-lg font-bold text-slate-800">Submission Guidelines</h3>
            </div>
            <ul className="flex flex-col gap-5 relative z-10">
              {[
                { icon: Layers, text: 'Must follow IEEE double-column template.'},
                { icon: FileText, text: 'Maximum 6 pages including references.'},
                { icon: AlertCircle, text: 'Plagiarism must be below 15% (Turnitin).'}
              ].map((g, i) => (
                <li key={i} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm shrink-0 border border-emerald-100"><g.icon size={14} /></div>
                    <span className="text-slate-600 font-medium text-sm">{g.text}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-4 border-t border-slate-50 relative z-10">
              <a 
                href="https://www.ieee.org/conferences/publishing/templates.html" 
                target="_blank" 
                rel="noreferrer" 
                className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                <Download size={16} /> Get IEEE Template
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Host & Participation */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group hover:shadow-md transition-shadow">
            <div className="relative h-40 rounded-2xl overflow-hidden mb-5">
              <img src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=400&auto=format&fit=crop" alt="Campus" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm">CIET, Coimbatore</div>
            </div>
            <div className="px-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-500 mb-2">Host Institution</h4>
              <p className="font-bold text-slate-800 text-lg leading-tight mb-2">Coimbatore Institute of Engineering and Technology</p>
              <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                <MapPin size={14} /> <span>An Autonomous Institute, NAAC 'A'</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
             <div className="relative z-10">
                <div className="flex justify-between gap-4 mb-8">
                    <div className="flex flex-col">
                        <span className="text-3xl font-black text-white leading-none mb-1">20+</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Countries</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-3xl font-black text-white leading-none mb-1">150+</span>
                        <span className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">Papers</span>
                    </div>
                </div>
                <button 
                    onClick={() => toast.success('ID Card will be available after registration verification')}
                    className="w-full bg-white text-slate-900 py-4 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-lg"
                >
                    Download ID Card
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubmissionTab = () => {
    // If no registration field or status is Draft, show form
    if (!registration || registration.status === 'Draft' || !registration.status) {
        return (
            <div className="animate-[fadeIn_0.6s_ease-out]">
                 <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-slate-800 border-b border-slate-100 pb-6">
                        {registration && registration.status === 'Draft' ? 'Continue Submission' : 'Start Submission'}
                    </h2>
                    <RegistrationForm 
                        startStep={2} 
                        showAccountCreation={false} 
                        onSuccess={() => {
                            fetchRegistration();
                            toast.success("Submission Completed!");
                        }} 
                    />
                 </div>
            </div>
        );
    }
    // Otherwise show the details view
    return renderMyPaper();
  };

  const renderMyPaper = () => (
    <div className="animate-[fadeIn_0.6s_ease-out]">
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1.2fr] gap-8">
        {/* Left Column: Paper Details */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight">{registration?.paperDetails?.title || 'Untitled Research Submission'}</h2>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Abstract</h3>
            <div className="text-slate-600 text-lg leading-relaxed font-serif italic text-justify">
              <p>{registration?.paperDetails?.abstract || 'No abstract content available at this moment.'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conference Track</span>
              <span className="text-lg font-bold text-slate-800">{registration?.paperDetails?.track || 'General Intelligence'}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Author Category</span>
              <span className="text-lg font-bold text-slate-800">{registration?.personalDetails?.category || 'Professional'}</span>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Research Team</h3>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl">
                <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-indigo-200">{user.name?.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-lg">{user.name}</span>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Principal Author</span>
                </div>
              </div>
              {registration?.teamMembers?.map((member, idx) => (
                <div key={idx} className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-10 h-10 bg-white text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center font-bold shrink-0">{member.name?.charAt(0)}</div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">{member.name}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Co-Author</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-8">Submission Timeline</h3>
            <div className="flex flex-col gap-0 relative pl-4">
               {/* Vertical Line */}
               <div className="absolute left-[13px] top-6 bottom-4 w-0.5 bg-slate-100"></div>
              
              <div className="relative flex gap-5 pb-8">
                <div className="w-7 h-7 bg-indigo-600 border-2 border-indigo-600 rounded-full flex items-center justify-center text-white z-10 shrink-0">
                    <CheckCircle size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Paper Submitted</span>
                  <span className="text-xs font-semibold text-slate-400">{new Date(registration?.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="relative flex gap-5 pb-8">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 bg-white transition-all ${registration?.paperDetails?.reviewStatus ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-indigo-500 shadow-[0_0_0_4px_rgba(99,102,241,0.15)]'}`}>
                     {registration?.paperDetails?.reviewStatus ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div>}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${registration?.paperDetails?.reviewStatus ? 'text-slate-800' : 'text-indigo-700'}`}>Review Process</span>
                  <span className="text-xs font-semibold text-slate-400">Technical Committee</span>
                </div>
              </div>

              <div className="relative flex gap-5">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 bg-white ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                    {registration?.paperDetails?.reviewStatus === 'Accepted' ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-slate-300 rounded-full"></div>}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-400">Final Decision</span>
                  <span className="text-xs font-semibold text-slate-300">Final Notification</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Committee Remarks</h3>
            {registration?.paperDetails?.reviewerComments ? (
              <div className="bg-orange-50 border border-dashed border-orange-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-orange-700 font-black text-xs uppercase tracking-wider mb-3">
                  <AlertCircle size={14} />
                  <span>Peer Review Feedback</span>
                </div>
                <p className="text-orange-900 leading-relaxed text-sm font-medium">{registration.paperDetails.reviewerComments}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-4 text-slate-400">
                <Clock size={32} className="opacity-50" />
                <p className="font-semibold text-sm">Awaiting feedback</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <button onClick={handleDownload} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-slate-200">
              <Download size={18} />
              Download Manuscript
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="animate-[fadeIn_0.6s_ease-out]">
      <div className="mb-8 flex items-center gap-3">
         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><CreditCard size={24} /></div>
         <h3 className="text-2xl font-bold text-slate-800">Billing Dashboard</h3>
      </div>
      
      <div className="flex flex-col gap-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Payment Balance</p>
            <p className="text-3xl font-black text-slate-800">₹ {registration?.paymentStatus === 'Completed' ? '0' : (registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000')}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Verification</p>
            <div className={`px-4 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wide inline-block ${registration?.paymentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
               {registration?.paymentStatus || 'Awaiting'}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <h4 className="font-extrabold text-slate-800 mb-6 text-lg">Fee Breakdown</h4>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">Conference Registration</span>
              <span className="font-bold text-slate-700">₹ {registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000'}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">Processing Fee (0%)</span>
              <span className="font-bold text-slate-700">₹ 0</span>
            </div>
            <div className="flex justify-between pt-6 mt-2">
               <span className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">Total Amount</span>
               <p className="text-xl font-black text-slate-900">₹ {registration?.personalDetails?.category === 'Inter-college Student' ? '500' : '1000'}</p>
            </div>
          </div>

          <div className="rounded-3xl p-10 bg-indigo-50/50 border border-indigo-100/50 flex flex-col items-center justify-center text-center relative overflow-hidden">
             {/* Decor */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-200/20 rounded-full blur-2xl"></div>
             
            {registration?.paymentStatus === 'Completed' ? (
              <div className="relative z-10">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                  <CheckCircle size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Paid in Full</h4>
                <p className="text-slate-500 text-sm font-medium">Your registration is confirmed. We look forward to seeing you!</p>
              </div>
            ) : registration?.status === 'Accepted' ? (
              <div className="relative z-10 w-full">
                <h4 className="text-xl font-bold text-slate-800 mb-2">Checkout Ready</h4>
                <p className="text-slate-500 mb-8 text-sm font-medium">Securely pay using UPI, Card or Internet Banking.</p>
                <button className="w-full btn btn-primary py-3.5 rounded-xl shadow-lg shadow-indigo-200 font-bold">Continue to Payment</button>
              </div>
            ) : registration?.status === 'Draft' ? (
              <div className="relative z-10">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                  <FileText size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Registration in Draft</h4>
                <p className="text-slate-500 text-sm font-medium mb-6">You haven't completed your application yet.</p>
                <Link to="/register" className="inline-block bg-white text-indigo-600 border border-indigo-200 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">Resume Registration</Link>
              </div>
            ) : (
              <div className="relative z-10">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                  <Clock size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">Verification in Progress</h4>
                <p className="text-slate-500 text-sm font-medium">Reviewing your paper. Payment will be enabled once accepted.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl pointer-events-none z-0"></div>
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-100 flex flex-col h-full z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex items-center gap-4 bg-slate-50/50 rounded-2xl mx-4 mt-6 mb-8 border border-slate-100/50">
          <div className="w-11 h-11 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-200">{user?.name?.charAt(0)}</div>
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{user?.name}</h3>
            <span className="text-[0.65rem] font-extrabold text-indigo-500 uppercase tracking-wider mt-0.5">{user?.role === 'author' ? 'AUTHOR' : 'ATTENDEE'}</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'paper', icon: FileText, label: 'Submission' },
            { id: 'payment', icon: CreditCard, label: 'Payment' },
            { id: 'notifications', icon: Bell, label: 'Notifications' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <div 
              key={item.id}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm ring-1 ring-indigo-100' : 'text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-800'}`}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
            >
              <item.icon size={20} className={`transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-lg"></div>}
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <button className="w-full flex items-center justify-center gap-3 px-5 py-3 rounded-xl text-slate-500 font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-colors border border-transparent hover:border-red-100" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-slate-50/50 backdrop-blur-[2px]">
        {/* Header */}
        <header className="px-6 md:px-10 py-6 md:py-8 shrink-0 flex justify-between items-center bg-white/50 lg:bg-transparent backdrop-blur-md lg:backdrop-blur-none border-b lg:border-none border-slate-100 sticky top-0 z-40 lg:static">
          <button className="lg:hidden p-2 -ml-2 text-slate-600 bg-white border border-slate-200 rounded-lg shadow-sm" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={20} />
          </button>

          <div className="flex flex-col md:flex-row md:items-end gap-2 md:gap-6">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">{activeTab === 'paper' ? 'Submission Details' : (activeTab.charAt(0).toUpperCase() + activeTab.slice(1))}</h1>
            {activeTab === 'paper' && (
              <div className="hidden md:block px-3 py-1 bg-slate-200 rounded-md text-[0.65rem] font-bold text-slate-600 uppercase tracking-widest mb-1">
                #CMP-26-{(registration?._id || 'XXX').slice(-4).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
             {activeTab === 'paper' && (
               <div className={`px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-wider hidden sm:block ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                 {registration?.paperDetails?.reviewStatus || 'Awaiting Review'}
               </div>
             )}
             <div className="w-10 h-10 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 cursor-pointer hover:text-indigo-600 hover:border-indigo-100 transition-colors">
                <Bell size={18} />
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:px-10 md:pb-12 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'paper' && renderSubmissionTab()}
          {activeTab === 'payment' && renderPayment()}
          {activeTab === 'notifications' && (
            <div className="animate-[fadeIn_0.6s_ease-out]">
              <div className="bg-white p-16 text-center rounded-3xl shadow-sm border border-slate-100 max-w-2xl mx-auto mt-10">
                <div className="w-24 h-24 bg-blue-50 text-blue-500 mx-auto mb-8 rounded-full flex items-center justify-center">
                  <Bell size={40} />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-800">Notifications</h3>
                <p className="text-slate-500 font-medium">You have no new notifications at the moment.</p>
              </div>
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="animate-[fadeIn_0.6s_ease-out]">
               <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 max-w-3xl mx-auto">
                <h3 className="text-2xl font-bold mb-10 flex items-center gap-3 text-slate-800">
                  <Settings size={28} className="text-slate-400" /> Account Settings
                </h3>
                <div className="grid gap-10">
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Profile Information</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Full Name</label>
                        <span className="font-bold text-slate-800 text-lg">{user.name}</span>
                      </div>
                      <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-wide">Email Address</label>
                        <span className="font-bold text-slate-800 text-lg">{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-px bg-slate-100 w-full"></div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">Security</h4>
                    <button className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-colors">Change Account Password</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sidebar Backdrop Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default Dashboard;
