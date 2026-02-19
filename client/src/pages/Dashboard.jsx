import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  CreditCard, User, Settings, Bell, Download,
  Menu, X, Search, ChevronRight, LogOut, LayoutDashboard,
  Calendar, MapPin, ShieldCheck, Award, Layers, Upload, Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import RegistrationForm from '../components/RegistrationForm';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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

  const handleFullPaperUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        return toast.error("Please upload a PDF file");
    }

    const confirmUpload = window.confirm("Are you sure you want to upload this full paper?");
    if (!confirmUpload) return;

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('paper', file);

    try {
        // First upload to Cloudinary via server
        const { data: uploadRes } = await axios.post('/api/registrations/upload', uploadData, {
            headers: { 
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${user?.token}`
            }
        });

        // Then update the registration record with file details
        await axios.post('/api/registrations/update-paper', {
            fileUrl: uploadRes.url,
            publicId: uploadRes.publicId,
            resourceType: uploadRes.resourceType,
            originalName: uploadRes.originalName
        }, {
            headers: { Authorization: `Bearer ${user.token}` }
        });

        toast.success("Full paper uploaded successfully!");
        fetchRegistration(); // Refresh registration data
    } catch (error) {
        toast.error("Paper upload failed. Please try again.");
        console.error("Upload error", error);
    } finally {
        setUploading(false);
    }
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

  const categoryAmounts = {
    'UG/PG STUDENTS': 500,
    'FACULTY/RESEARCH SCHOLARS': 750,
    'EXTERNAL / ONLINE PRESENTATION': 300,
    'INDUSTRY PERSONNEL': 900
  };
  const currentFee = categoryAmounts[registration?.personalDetails?.category] || 1000;

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading Dashboard...</p>
    </div>
  );

  const renderOverview = () => (
    <div className="animate-[fadeIn_0.6s_ease-out] space-y-8">
      {/* Welcome Section */}
      <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2 font-display">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-slate-500 font-medium max-w-md">
            Here's what's happening with your conference submission today.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 relative z-10">
          {!registration?.paperDetails?.fileUrl && registration?.status !== 'Draft' && registration?.status && (
            <button 
              onClick={() => setActiveTab('paper')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 flex items-center gap-2 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              <Upload size={18} /> Upload Full Paper
            </button>
          )}
          <button 
            onClick={() => setActiveTab('paper')}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-slate-200 transition-all font-sans"
          >
            {registration ? 'View Submission' : 'Start Submission'} <ChevronRight size={16} />
          </button>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
      </div>

      {/* Quick Status Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: 'Submission ID', 
            value: registration ? `#CMP-26-${registration._id.slice(-4).toUpperCase()}` : 'N/A', 
            icon: FileText, 
            color: 'text-blue-600', 
            bg: 'bg-blue-50' 
          },
          { 
            label: 'Current Status', 
            value: registration?.status || 'No Submission', 
            icon: Clock, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
          { 
            label: 'Global Track', 
            value: registration?.paperDetails?.track || 'Not Selected', 
            icon: Award, 
            color: 'text-purple-600', 
            bg: 'bg-purple-50' 
          },
          { 
            label: 'Payment', 
            value: registration?.paymentStatus || 'Pending', 
            icon: CreditCard, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
              <stat.icon size={22} />
            </div>
            <div className="min-w-0">
              <span className="text-[0.65rem] font-black uppercase text-slate-400 tracking-wider block mb-0.5">{stat.label}</span>
              <span className="text-sm font-bold text-slate-800 truncate block">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Timeline Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Calendar size={20} /></div>
                <h3 className="text-lg font-bold text-slate-800">Critical Deadlines</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-wider">CIETM 2026</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Abstract', date: 'Mar 08', status: 'completed' },
                { label: 'Full Paper', date: 'Mar 16', status: 'active' },
                { label: 'Acceptance', date: 'Mar 24', status: 'pending' },
                { label: 'Conference', date: 'Apr 29', status: 'pending' }
              ].map((item, idx) => (
                <div key={idx} className={`p-5 rounded-2xl border transition-all duration-300 ${item.status === 'active' ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-50 bg-white'}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-[0.6rem] font-black uppercase tracking-widest ${item.status === 'completed' ? 'text-emerald-500' : item.status === 'active' ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`}>
                      {item.status}
                    </span>
                    {item.status === 'completed' && <CheckCircle size={14} className="text-emerald-500" />}
                    {item.status === 'active' && <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_0_2px_rgba(99,102,241,0.2)]"></div>}
                  </div>
                  <h4 className="font-bold text-slate-800 mb-1">{item.label}</h4>
                  <p className="text-xs font-semibold text-slate-500">{item.date}, 2026</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 transition-all duration-500 group-hover:opacity-30"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5 text-left">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 shrink-0">
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg">Identity Verification</h4>
                  <p className="text-slate-400 text-sm font-medium">Your account is verified as an active conference participant.</p>
                </div>
              </div>
              <button 
                onClick={() => toast.success('Digital ID available after full paper acceptance')}
                className="w-full md:w-auto bg-white text-slate-900 px-8 py-3.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all shadow-xl active:scale-95 shrink-0"
              >
                Download Entry ID
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Guidelines */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Layers size={20} /></div>
              <h3 className="text-lg font-bold text-slate-800">Submission Rules</h3>
            </div>
            
            <div className="flex-1 space-y-4 mb-8">
              {[
                { icon: Layers, text: 'IEEE double-column format' },
                { icon: FileText, text: 'Limit to 6 pages including refs' },
                { icon: AlertCircle, text: 'Plagiarism must be below 15%' },
                { icon: ShieldCheck, text: 'Original, unpublished work' }
              ].map((g, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm"><g.icon size={14}/></div>
                  <span className="text-xs font-bold text-slate-600">{g.text}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-[0.65rem] font-black uppercase text-slate-400 tracking-widest px-1">Resources</h4>
              <a 
                href="https://www.ieee.org/conferences/publishing/templates.html" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-3 w-full py-4 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all border border-indigo-100/50 group"
              >
                <Download size={16} className="transition-transform group-hover:translate-y-0.5" />
                IEEE Template (DOCX/PDF)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const getInitialStep = () => {
    if (!registration) return 2;
    // Step 2: Personal Details
    if (!registration.personalDetails?.institution || !registration.personalDetails?.department) return 2;
    // Step 4: Paper Details (Step 3 is optional)
    if (!registration.paperDetails?.title || !registration.paperDetails?.abstract) return 4;
    // Step 5: Review
    return 5;
  };

  const renderDraftsTab = () => {
    return (
        <div className="animate-[fadeIn_0.6s_ease-out]">
             <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                    <h2 className="text-3xl font-bold text-slate-800">
                        {registration && registration.status === 'Draft' ? 'Continue Submission' : 'Start Submission'}
                    </h2>
                </div>
                <RegistrationForm 
                    startStep={getInitialStep()} 
                    showAccountCreation={false} 
                    onSuccess={() => {
                        fetchRegistration();
                        setActiveTab('paper');
                        toast.success("Submission Completed!");
                    }} 
                />
             </div>
        </div>
    );
  };

  const renderSubmissionTab = () => {
    if (!registration || registration.status === 'Draft' || !registration.status) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
                    <FileText size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Official Submission Yet</h3>
                <p className="text-slate-500 mb-8 max-w-sm">Complete your draft to view your official conference submission details here.</p>
                <button 
                    onClick={() => setActiveTab('drafts')}
                    className="btn btn-primary"
                >
                    Go to Drafts
                </button>
            </div>
        );
    }
    return renderMyPaper();
  };

  const renderMyPaper = () => (
    <div className="animate-[fadeIn_0.6s_ease-out]">
      <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1.2fr] gap-8">
        {/* Left Column: Paper Details */}
        <div className="flex flex-col gap-6">
          {/* Main Paper Overview */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50">
               <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 leading-tight mb-4">{registration?.paperDetails?.title || 'Untitled Research Submission'}</h2>
               <div className="flex flex-wrap gap-2">
                 <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold uppercase tracking-wider">{registration?.paperDetails?.track || 'General track'}</span>
                 <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">{registration?.personalDetails?.category || 'Student'}</span>
               </div>
            </div>
            <div className="p-8 bg-slate-50/30">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Abstract Overview</h3>
              <div className="text-slate-600 text-base leading-relaxed font-serif italic text-justify">
                <p>{registration?.paperDetails?.abstract || 'No abstract content available at this moment.'}</p>
              </div>
            </div>
          </div>

          {/* Submission Metadata Group */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
             <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Submission Context \u0026 Team</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Keywords/Metadata */}
                <div className="flex flex-col gap-4">
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Keywords</span>
                      <p className="text-sm font-semibold text-slate-700">{registration?.paperDetails?.keywords?.join(', ') || 'N/A'}</p>
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Submitted On</span>
                      <p className="text-sm font-semibold text-slate-700">{registration?.createdAt ? new Date(registration.createdAt).toLocaleDateString() : 'Pending'}</p>
                   </div>
                </div>

                {/* Team Members */}
                <div className="flex flex-col gap-4 border-l border-slate-100 pl-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shrink-0">{user.name?.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm leading-none">{user.name}</span>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tight">Principal Author</span>
                      </div>
                   </div>
                   {registration?.teamMembers?.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 text-slate-400 border border-slate-200 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">{member.name?.charAt(0)}</div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-sm leading-none">{member.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Co-Author</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Status & Actions */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#0f172a] via-[#0f172a] to-[#1e1b4b] p-8 rounded-3xl shadow-2xl shadow-indigo-950/40 border border-white/5 text-white relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -right-24 -top-24 w-48 h-48 bg-indigo-500/10 blur-[80px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            
            <h3 className="text-[10px] font-black text-indigo-300/60 uppercase tracking-[0.3em] mb-10 relative z-10">Status Timeline</h3>
            <div className="flex flex-col gap-0 relative z-10">
               {/* Fixed Vertical Line Alignment */}
               <div className="absolute left-[13.5px] top-6 bottom-6 w-px bg-white/10"></div>
              
              <div className="relative flex gap-6 pb-10">
                <div className="w-7 h-7 bg-emerald-500 border-2 border-emerald-400 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <CheckCircle size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white tracking-wide">Paper Submitted</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{registration?.createdAt ? new Date(registration.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              <div className="relative flex gap-6 pb-10">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-all duration-500 ${registration?.paperDetails?.reviewStatus ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#0f172a] border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}>
                     {registration?.paperDetails?.reviewStatus ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse transition-all"></div>}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold tracking-wide ${registration?.paperDetails?.reviewStatus ? 'text-white' : 'text-indigo-200'}`}>Review Process</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-tighter">Technical Committee</span>
                </div>
              </div>

              <div className="relative flex gap-6">
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-all duration-500 ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#0f172a] border-slate-700 text-slate-500'}`}>
                    {registration?.paperDetails?.reviewStatus === 'Accepted' ? <CheckCircle size={14} /> : <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold tracking-wide ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'text-white' : 'text-slate-500'}`}>Registration Confirmation</span>
                  <span className="text-[10px] font-semibold text-slate-600 mt-0.5">Awaiting Official Decision</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Reviewer Comments</h3>
            {registration?.paperDetails?.reviewerComments ? (
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                <p className="text-orange-900 leading-relaxed text-sm font-medium">{registration.paperDetails.reviewerComments}</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 py-2">
                <Clock size={18} className="opacity-50" />
                <p className="font-semibold text-sm italic">Review in progress...</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 pt-4">
            {!registration?.paperDetails?.fileUrl ? (
              <div className="relative">
                  <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFullPaperUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                      disabled={uploading}
                  />
                  <button className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      {uploading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : <Upload size={18} />}
                      {uploading ? 'Uploading...' : 'Upload Manuscript (PDF)'}
                  </button>
              </div>
            ) : (
              <>
                <button onClick={handleDownload} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-slate-200">
                  <Download size={18} />
                  Download Manuscript
                </button>
                <div className="relative">
                  <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFullPaperUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                      disabled={uploading}
                  />
                  <button className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-500 border border-slate-200 px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all mt-2">
                      {uploading ? 'Updating...' : 'Update Manuscript'}
                  </button>
                </div>
              </>
            )}
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
            <p className="text-3xl font-black text-slate-800">₹ {registration?.paymentStatus === 'Completed' ? '0' : currentFee}</p>
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
              <span className="font-bold text-slate-700">₹ {currentFee}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-slate-50">
              <span className="text-slate-500 font-medium text-sm">Processing Fee (0%)</span>
              <span className="font-bold text-slate-700">₹ 0</span>
            </div>
            <div className="flex justify-between pt-6 mt-2">
               <span className="font-extrabold text-slate-400 uppercase tracking-widest text-xs">Total Amount</span>
               <p className="text-xl font-black text-slate-900">₹ {currentFee}</p>
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
      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-slate-100 flex flex-col h-full z-50 transition-all duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0 outline-none' : '-translate-x-full shadow-2xl'}`}>
        {/* Logo/Brand */}
        <div className="p-8 pb-6">
          <Link to="/" className="text-2xl font-black text-slate-800 tracking-tighter flex items-center gap-2 mb-2 font-display hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <LayoutDashboard size={20} />
            </div>
            <span>CIETM <span className="text-indigo-600">2026</span></span>
          </Link>
        </div>
        
        {/* User Card */}
        <div className="px-4 mb-6">
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100/50 flex items-center gap-3">
            <div className="w-11 h-11 bg-white text-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm border border-slate-100 shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-slate-800 text-xs truncate uppercase tracking-wider">{user?.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest truncate">{user?.role} portal</span>
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-auto pt-2">
          <Link 
            to="/" 
            className="flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 text-left group relative w-full text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800 mb-2"
          >
            <Home size={20} className="transition-transform duration-300 group-hover:scale-110" />
            <span className="text-sm tracking-tight">Main Website</span>
          </Link>

          <div className="h-px bg-slate-100 mx-4 mb-4"></div>

          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            ...(registration?.paymentStatus !== 'Completed' ? [
                { id: 'drafts', icon: Layers, label: 'My Draft' }
            ] : []),
            { id: 'paper', icon: FileText, label: 'Submission' },
            { id: 'payment', icon: CreditCard, label: 'Payments' },
            { id: 'notifications', icon: Bell, label: 'Updates' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button 
              key={item.id}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-200 text-left group relative w-full ${
                activeTab === item.id 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' 
                : 'text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-800'
              }`}
              onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
            >
              <item.icon size={20} className={`transition-transform duration-300 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-50/50">
          <button 
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl text-slate-500 font-black text-[0.7rem] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all group" 
            onClick={logout}
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-1" /> Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-slate-50/30">
        {/* Header */}
        <header className="px-6 md:px-10 py-5 shrink-0 flex justify-between items-center bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-slate-600 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 md:hidden mb-0.5">
                <span className="text-[0.6rem] font-black text-indigo-600 uppercase tracking-[0.2em]">CIETM 2026</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {activeTab === 'paper' ? 'Submission details' : activeTab}
              </h1>
              <div className="flex items-center gap-2 mt-1 hidden md:flex">
                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">
                  CIETM 2026 Management System
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 md:gap-5">
             {/* Small Logo for mobile right side if needed, or just stay as is */}
             <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100 md:hidden">
                <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-[0.5rem] text-white font-bold">C</div>
                <span className="text-[0.6rem] font-bold text-slate-800">CIETM</span>
             </div>
             
             {activeTab === 'paper' && registration && (
               <div className={`px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest hidden sm:flex items-center gap-2 shadow-sm border ${
                 registration?.paperDetails?.reviewStatus === 'Accepted' 
                 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                 : 'bg-amber-50 text-amber-600 border-amber-100'
               }`}>
                 <div className={`w-1.5 h-1.5 rounded-full ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                 {registration?.paperDetails?.reviewStatus || 'In Review'}
               </div>
             )}
             <div className="relative group">
               <div className="w-11 h-11 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 cursor-pointer hover:text-indigo-600 hover:border-indigo-200 transition-all hover:shadow-md active:scale-95">
                  <Bell size={20} />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
               </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'drafts' && renderDraftsTab()}
            {activeTab === 'paper' && renderSubmissionTab()}
            {activeTab === 'payment' && renderPayment()}
            {activeTab === 'notifications' && (
              <div className="animate-fade-in flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-32 h-32 bg-indigo-50 text-indigo-500 rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12 group hover:rotate-0 transition-transform duration-500">
                  <Bell size={48} />
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-800 uppercase tracking-tight">No notifications</h3>
                <p className="text-slate-500 font-medium text-center max-w-sm">We'll keep you posted when there's an update on your submission status.</p>
              </div>
            )}
            {activeTab === 'settings' && (
              <div className="animate-fade-in">
                <div className="bg-white p-10 rounded-[2rem] shadow-sm border border-slate-100 max-w-4xl">
                  <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-800 uppercase tracking-tight">
                    <span className="p-2 bg-slate-100 rounded-lg"><Settings size={24} className="text-slate-500" /></span> Account Settings
                  </h3>
                  <div className="space-y-12">
                    <div>
                      <h4 className="text-[0.65rem] font-black uppercase text-slate-400 mb-6 tracking-[0.2em]">Profile Information</h4>
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user.name}</div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-slate-700">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-slate-100">
                      <h4 className="text-[0.65rem] font-black uppercase text-slate-400 mb-6 tracking-[0.2em]">Security</h4>
                      <button className="px-8 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm hover:shadow-md">
                        Change Account Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Backdrop Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden animate-fade-in" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default Dashboard;
