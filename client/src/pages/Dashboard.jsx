import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  FileText, CheckCircle, Clock, AlertCircle, 
  CreditCard, User, Settings, Bell, Download,
  Menu, X, Search, ChevronRight, LogOut, LayoutDashboard,
  Calendar, MapPin, ShieldCheck, Award, Layers, Upload, Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import RegistrationForm from '../components/RegistrationForm';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showIDCard, setShowIDCard] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

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
      setLastSync(new Date());
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setNotificationsLoading(false);
    }
  }, [user]);

  // Payment Verification Logic
  useEffect(() => {
    const verifyPayment = async () => {
      const query = new URLSearchParams(location.search);
      const paymentId = query.get('payment_id'); // Cashfree sends order_id as payment_id in redirect
      // or we might need to check order_id based on how we constructed return_url
      // Our return_url: ...?payment_id={order_id}&payment_status={order_status}
      
      if (paymentId) {
        setPaymentLoading(true);
        try {
          // Verify with backend
          const { data } = await axios.post('/api/payments/verify', {
             orderId: paymentId 
          }, {
              headers: { Authorization: `Bearer ${user?.token}` }
          });

          if (data.status === 'SUCCESS') {
              toast.success("Payment verified successfully!");
              fetchRegistration(); // Refresh status
          } else {
              toast.error("Payment verification failed or pending.");
          }
          // Clear URL params
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Payment verification error", error);
          toast.error("Failed to verify payment.");
          navigate('/dashboard', { replace: true });
        } finally {
          setPaymentLoading(false);
        }
      }
    };

    if (location.search) {
        verifyPayment();
    }
  }, [location.search, user, navigate, fetchRegistration]);

  useEffect(() => {
    fetchRegistration();
    fetchNotifications();
  }, [fetchRegistration, fetchNotifications]);

  useEffect(() => {
    if (registration && ['Accepted', 'Rejected'].includes(registration.status) && activeTab === 'drafts') {
      setActiveTab('paper');
    }
  }, [registration, activeTab]);

  const handleDownload = () => {
    if (!registration) return;
    // Open the download route with token in query for authentication
    window.open(`/api/registrations/download/${registration._id}?token=${user.token}`, '_blank');
  };

  const handleFullPaperUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedTypes.includes(file.type)) {
        return toast.error("Please upload a Word document (.doc or .docx)");
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setChangingPassword(true);
    try {
      await axios.put('/api/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success("Password updated successfully!");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success("All marked as read");
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const handlePayment = async () => {
    if (!registration) return;
    setPaymentLoading(true);
    try {
      const { data } = await axios.post('/api/payments/init', {
        registrationId: registration._id
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const cashfree = window.Cashfree({
        mode: "sandbox", // Change to "production" for live
      });

      let checkoutOptions = {
        paymentSessionId: data.payment_session_id,
        redirectTarget: "_self", // Optional, defaults to _self
      };

      cashfree.checkout(checkoutOptions);

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Payment initialization failed");
    } finally {
      setPaymentLoading(false);
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

  const calculateCurrentFee = () => {
    if (!registration) return 0;
    let total = categoryAmounts[registration.personalDetails?.category] || 1000;
    if (registration.teamMembers && registration.teamMembers.length > 0) {
      registration.teamMembers.forEach(member => {
        total += categoryAmounts[member.category] || 1000;
      });
    }
    return total;
  };

  const currentFee = calculateCurrentFee();
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const renderBreadcrumbs = () => {
    const crumbs = [
      { label: 'Dashboard', tab: 'overview' },
      { label: activeTab.charAt(0).toUpperCase() + activeTab.slice(1), tab: activeTab }
    ];

    if (activeTab === 'paper') crumbs[1].label = 'Submission';
    if (activeTab === 'drafts') crumbs[1].label = 'My Draft';
    if (activeTab === 'notifications') crumbs[1].label = 'Updates';

    return (
      <div className="flex items-center gap-2 text-[0.65rem] font-black uppercase tracking-[0.15em] text-slate-400">
        {crumbs.map((crumb, i) => (
          <React.Fragment key={i}>
            <span 
              className={`cursor-pointer hover:text-indigo-600 transition-colors ${i === crumbs.length - 1 ? 'text-slate-800' : ''}`}
              onClick={() => setActiveTab(crumb.tab)}
            >
              {crumb.label}
            </span>
            {i < crumbs.length - 1 && <ChevronRight size={10} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Loading Dashboard...</p>
    </div>
  );

  const renderOverview = () => (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-black text-slate-800 tracking-tight font-display">Overview</h1>
           <p className="text-sm font-medium text-slate-500">Welcome back, {user.name}.</p>
         </div>
         <div className="flex gap-2">
            {!registration?.paperDetails?.fileUrl && registration?.status !== 'Accepted' && (
              <button onClick={() => setActiveTab('paper')} className="btn btn-primary px-5 py-2 text-xs shadow-indigo-200">
                <Upload size={16} /> Upload Paper
              </button>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Status Column */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Gradient Status Card */}
            <div className={`rounded-3xl p-8 relative overflow-hidden text-white shadow-xl transition-all ${
               registration?.status === 'Accepted' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200' :
               registration?.status === 'Rejected' ? 'bg-gradient-to-br from-red-500 to-rose-600 shadow-red-200' :
               'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-200'
            }`}>
               {/* Background Patterns */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
               <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
               
               <div className="relative z-10">
                  <div className="flex items-start justify-between mb-8">
                     <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider mb-2">
                           {registration?.status === 'Accepted' ? <CheckCircle size={14} /> : <Clock size={14} />}
                           {registration?.status || 'No Submission'}
                        </span>
                        <h2 className="text-3xl font-black tracking-tight leading-tight">
                           {registration?.status === 'Accepted' ? 'Paper Accepted' :
                            registration?.status === 'Under Review' ? 'Under Review' :
                            registration?.paperDetails?.fileUrl ? 'Submission Received' :
                            'Pending Submission'}
                        </h2>
                     </div>
                     <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-1">Paper ID</p>
                        <p className="font-mono text-lg font-bold">#{registration?._id?.slice(-4).toUpperCase() || '----'}</p>
                     </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="bg-black/20 rounded-full h-1.5 w-full mb-4 overflow-hidden backdrop-blur-sm">
                     <div 
                        className="bg-white h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                        style={{ width: `${
                           registration?.status === 'Accepted' || registration?.status === 'Rejected' ? '100%' :
                           registration?.paymentStatus === 'Completed' ? '100%' :
                           ['Under Review', 'Accepted', 'Rejected'].includes(registration?.paperDetails?.reviewStatus) ? '75%' :
                           registration?.paperDetails?.fileUrl ? '50%' :
                           registration?.paperDetails?.abstract ? '25%' : '5%'
                        }`}}
                     ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs font-medium text-white/80">
                     <span>Draft</span>
                     <span>Upload</span>
                     <span>Review</span>
                     <span>Decision</span>
                  </div>
               </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Layers size={20} /></div>
                  <div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Track</span>
                     <p className="text-sm font-bold text-slate-800 truncate" title={registration?.paperDetails?.track}>{registration?.paperDetails?.track?.split(' ')[0] || 'Not Set'}</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-all">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><CreditCard size={20} /></div>
                  <div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment</span>
                     <p className="text-sm font-bold text-slate-800">{registration?.paymentStatus || 'Pending'}</p>
                  </div>
               </div>
               <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-100 transition-all col-span-2 md:col-span-1">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"><Calendar size={20} /></div>
                  <div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Deadline</span>
                     <p className="text-sm font-bold text-slate-800">16 Mar 2026</p>
                  </div>
               </div>
            </div>

            {/* Deadlines List */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm relative overflow-hidden group/timeline">
               <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  Timeline & Deadlines
               </h3>
               
               <div className="relative space-y-1">
                  {/* Vertical Connector Line */}
                  <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-slate-100 group-hover/timeline:bg-indigo-50 transition-colors"></div>

                  {[
                     { label: 'Abstract Submission', date: '2026-03-08', done: true },
                     { label: 'Full Paper Submission', date: '2026-03-16', active: true },
                     { label: 'Acceptance Notification', date: '2026-03-24' },
                     { label: 'Registration Deadline', date: '2026-04-10' },
                     { label: 'Conference Date', date: '2026-04-29' }
                  ].map((item, i) => (
                     <div key={i} className="relative flex items-center justify-between p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-300 group/item">
                        <div className="flex items-center gap-4 relative z-10">
                           {/* Status Icon Column */}
                           <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              item.done ? 'bg-emerald-500 border-emerald-400 text-white' : 
                              item.active ? 'bg-white border-indigo-600 text-indigo-600 scale-110 shadow-lg shadow-indigo-100' : 
                              'bg-white border-slate-200 text-slate-300'
                           }`}>
                              {item.done ? <CheckCircle size={14} /> : 
                               item.active ? <Clock size={14} className="animate-spin-slow" /> : 
                               <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>}
                           </div>

                           <div className="flex flex-col">
                              <span className={`text-sm font-bold transition-colors ${
                                 item.active ? 'text-indigo-700' : 
                                 item.done ? 'text-slate-400 line-through' : 'text-slate-600'
                              }`}>
                                 {item.label}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 md:hidden uppercase tracking-wider">
                                 {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                              </span>
                           </div>
                        </div>
                        <span className="hidden md:block text-xs font-bold text-slate-400 font-mono bg-slate-50 px-2 py-1 rounded-md border border-slate-100 group-hover/item:border-indigo-100 group-hover/item:text-indigo-600 transition-all">
                           {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
            {/* Next Action Card */}
            <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6 shadow-sm relative overflow-hidden">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 text-center relative z-10">Action Required</h3>
                
                {/* Background Pattern */}
                <div className="absolute -right-4 -top-4 opacity-5 rotate-12 transition-transform group-hover:scale-110 pointer-events-none text-indigo-900">
                  {registration?.paymentStatus === 'Completed' ? <ShieldCheck size={100} /> :
                   registration?.status === 'Accepted' ? <CreditCard size={100} /> :
                   registration?.paperDetails?.fileUrl ? <Clock size={100} /> :
                   <Upload size={100} />}
                </div>
               
               <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-1 animate-bounce-slow">
                     {registration?.paymentStatus === 'Completed' ? <ShieldCheck size={24} /> :
                      registration?.status === 'Accepted' ? <CreditCard size={24} /> :
                      registration?.paperDetails?.fileUrl ? <Clock size={24} /> :
                      <Upload size={24} />}
                  </div>
                  
                  <div>
                     <h4 className="font-bold text-slate-900 text-base mb-1">
                        {registration?.paymentStatus === 'Completed' ? 'All Set!' :
                         registration?.status === 'Accepted' ? 'Pay Registration' :
                         registration?.paperDetails?.fileUrl ? 'Await Review' :
                         'Upload Full Paper'}
                     </h4>
                     <p className="text-[10px] text-slate-500 leading-relaxed px-2">
                        {registration?.paymentStatus === 'Completed' ? 'Access your ID below.' :
                         registration?.status === 'Accepted' ? 'Secure your spot now.' :
                         registration?.paperDetails?.fileUrl ? 'Paper under review.' :
                         'Upload Word doc.'}
                     </p>
                  </div>

                  {registration?.paymentStatus !== 'Completed' && (
                     <button 
                        onClick={() => {
                           if (registration?.status === 'Accepted') handlePayment();
                           else setActiveTab('paper');
                        }}
                        disabled={registration?.status === 'Submitted' || registration?.status === 'Under Review'}
                        className="w-full btn btn-primary py-2.5 text-xs shadow-indigo-200"
                     >
                        {registration?.status === 'Accepted' ? 'Pay Now' : 
                         registration?.paperDetails?.fileUrl ? 'View Submission' : 'Upload Now'}
                     </button>
                  )}
               </div>
            </div>

            {/* ID Card / Verification */}
            <div className={`rounded-2xl p-6 border relative overflow-hidden ${registration?.paymentStatus === 'Completed' ? 'bg-slate-900 text-white border-slate-800' : 'bg-slate-50 border-slate-100 text-slate-400'} transition-all`}>
               {/* Background Icon */}
               <div className={`absolute -right-4 -bottom-4 opacity-10 rotate-12 transition-transform group-hover:scale-110 ${registration?.paymentStatus === 'Completed' ? 'text-white' : 'text-slate-500'}`}>
                  {registration?.paymentStatus === 'Completed' ? <ShieldCheck size={100} /> : <div className="text-slate-300"><ShieldCheck size={100} /></div>}
               </div>

               <div className="flex items-center justify-between mb-4 relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider">Digital Pass</span>
                  <ShieldCheck size={18} />
               </div>
               <div className="mb-6 relative z-10">
                  <p className="text-2xl font-black tracking-tight mb-1">
                     {registration?.paymentStatus === 'Completed' ? 'ADMIT ONE' : 'LOCKED'}
                  </p>
                  <p className="text-[10px] font-medium opacity-60">Authorize Entry</p>
               </div>
               <button 
                  onClick={() => setShowIDCard(true)}
                  disabled={registration?.paymentStatus !== 'Completed'}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all relative z-10 ${
                     registration?.paymentStatus === 'Completed' 
                     ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg' 
                     : 'bg-slate-200 cursor-not-allowed'
                  }`}
               >
                  View ID Card
               </button>
            </div>

            {/* Author Guidelines Card (Full Content) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-all">
               <div className="absolute -top-6 -right-6 text-slate-50 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity rotate-12 pointer-events-none">
                  <FileText size={180} />
               </div>
               
               <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                     <FileText size={18} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Author Guidelines</h3>
               </div>

               <div className="space-y-4 relative z-10">
                  <ul className="space-y-3">
                     <li className="flex gap-3 text-[10px] text-slate-500 font-medium leading-relaxed">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Original work not published elsewhere and must follow IEEE formatting.</span>
                     </li>
                     <li className="flex gap-3 text-[10px] text-slate-500 font-medium leading-relaxed">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Max 6 pages allowed with strict double-blind peer review.</span>
                     </li>
                     <li className="flex gap-3 text-[10px] text-slate-500 font-medium leading-relaxed">
                        <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={14} />
                        <span>Plagiarism must be under 15% for evaluation.</span>
                     </li>
                  </ul>
                  
                  <a 
                     href="https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/Conference-template-A4.doc" 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-bold border border-slate-200 hover:border-indigo-200 transition-all"
                  >
                     <Download size={14} /> Download IEEE Template
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
               {/* Vertical Line with Motion */}
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: 'calc(100% - 48px)' }}
                 transition={{ duration: 1.5, ease: "easeInOut" }}
                 className="absolute left-[13.5px] top-6 w-px bg-indigo-500/30"
               ></motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative flex gap-6 pb-10"
              >
                <div className="w-7 h-7 bg-emerald-500 border-2 border-emerald-400 rounded-full flex items-center justify-center text-white z-10 shrink-0 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                    <CheckCircle size={14} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white tracking-wide">Paper Submitted</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">{registration?.createdAt ? new Date(registration.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative flex gap-6 pb-10"
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-all duration-500 ${['Under Review', 'Accepted', 'Rejected'].includes(registration?.paperDetails?.reviewStatus) ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#0f172a] border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]'}`}>
                     {['Under Review', 'Accepted', 'Rejected'].includes(registration?.paperDetails?.reviewStatus) ? <CheckCircle size={14} /> : <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse transition-all"></div>}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold tracking-wide ${['Under Review', 'Accepted', 'Rejected'].includes(registration?.paperDetails?.reviewStatus) ? 'text-white' : 'text-indigo-200'}`}>Review Process</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-tighter">Technical Committee</span>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="relative flex gap-6"
              >
                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 shrink-0 transition-all duration-500 ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-[#0f172a] border-slate-700 text-slate-500'}`}>
                    {registration?.paperDetails?.reviewStatus === 'Accepted' ? <CheckCircle size={14} /> : <div className="w-1.5 h-1.5 bg-slate-700 rounded-full"></div>}
                </div>
                <div className="flex flex-col text-left">
                  <span className={`text-sm font-bold tracking-wide ${registration?.paperDetails?.reviewStatus === 'Accepted' ? 'text-white' : 'text-slate-500'}`}>Registration Confirmation</span>
                  <span className="text-[10px] font-semibold text-slate-600 mt-0.5">Awaiting Official Decision</span>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-6">Reviewer Comments</h3>
            {registration?.paperDetails?.reviewerComments ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-3 text-indigo-200 group-hover:text-indigo-400 transition-colors">
                  <AlertCircle size={40} />
                </div>
                <p className="text-indigo-900 leading-relaxed text-sm font-medium relative z-10 pr-12">{registration.paperDetails.reviewerComments}</p>
              </motion.div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400 py-2">
                <Clock size={18} className="opacity-50" />
                <p className="font-semibold text-sm italic">Review in progress...</p>
              </div>
            )}
          </div>

          {registration?.status !== 'Accepted' && registration?.status !== 'Rejected' && (
            <div className="flex flex-col gap-3 pt-4">
              {!registration?.paperDetails?.fileUrl ? (
                <div className="relative">
                    <input 
                        type="file" 
                        accept=".doc,.docx" 
                        onChange={handleFullPaperUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait"
                        disabled={uploading}
                    />
                    <button className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        {uploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : <Upload size={18} />}
                        {uploading ? 'Uploading...' : 'Upload Manuscript (Word)'}
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
                        accept=".doc,.docx" 
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
          )}

          {(registration?.status === 'Accepted' || registration?.status === 'Rejected') && registration?.paperDetails?.fileUrl && (
            <div className="flex flex-col gap-3 pt-4">
               <button onClick={handleDownload} className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-lg hover:shadow-slate-200">
                  <Download size={18} />
                  Download Manuscript
                </button>
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
                    <ShieldCheck size={14} /> Editing locked after {registration.status.toLowerCase()}
                  </p>
                </div>
            </div>
          )}
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
              <span className="text-slate-500 font-medium text-sm">Main Author ({registration?.personalDetails?.category})</span>
              <span className="font-bold text-slate-700">₹ {categoryAmounts[registration?.personalDetails?.category] || 1000}</span>
            </div>
            {registration?.teamMembers?.map((member, idx) => (
              <div key={idx} className="flex justify-between py-3 border-b border-slate-50">
                <span className="text-slate-500 font-medium text-sm">Co-Author {idx + 1} ({member.category})</span>
                <span className="font-bold text-slate-700">₹ {categoryAmounts[member.category] || 1000}</span>
              </div>
            ))}
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
                <button 
                  onClick={handlePayment}
                  disabled={paymentLoading}
                  className="w-full btn btn-primary py-3.5 rounded-xl shadow-lg shadow-indigo-200 font-bold flex items-center justify-center gap-2"
                >
                  {paymentLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CreditCard size={18} />}
                  {paymentLoading ? 'Processing...' : 'Continue to Payment'}
                </button>
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
            ...(registration?.paymentStatus !== 'Completed' && registration?.status !== 'Accepted' && registration?.status !== 'Rejected' ? [
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
              {item.id === 'notifications' && unreadNotifications > 0 && (
                <div className="ml-auto bg-indigo-100 text-indigo-700 w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black border border-indigo-200">
                  {unreadNotifications}
                </div>
              )}
              {activeTab === item.id && (
                <div className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-50/50">
          <button 
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl text-slate-500 font-black text-[0.7rem] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all group" 
            onClick={() => setShowLogoutModal(true)}
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
              <div className="hidden md:block mb-1">
                 {renderBreadcrumbs()}
              </div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                {activeTab === 'paper' ? 'Submission details' : activeTab}
              </h1>
              <div className="flex items-center gap-2 mt-1 hidden md:flex">
                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  Last synced: {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto pb-10">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'drafts' && renderDraftsTab()}
            {activeTab === 'paper' && renderSubmissionTab()}
            {activeTab === 'payment' && renderPayment()}
            {activeTab === 'notifications' && (
              <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Recent Updates</h3>
                  {notifications.some(n => !n.isRead) && (
                    <button onClick={handleMarkAllAsRead} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Mark all as read</button>
                  )}
                </div>
                
                {notificationsLoading ? (
                  <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                ) : notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((n) => (
                      <div 
                        key={n._id} 
                        className={`p-6 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/50 border-indigo-100 shadow-sm'}`}
                        onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            n.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
                            n.type === 'error' ? 'bg-red-100 text-red-600' : 
                            n.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Bell size={20} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-800">{n.title}</h4>
                              {!n.isRead && <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>}
                            </div>
                            <p className="text-sm text-slate-600 font-medium mb-2">{n.message}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(n.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    <div className="w-24 h-24 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mb-6">
                      <Bell size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No notifications yet</h3>
                    <p className="text-slate-500 text-center max-w-sm">We'll alert you here when there's an update on your paper or payment.</p>
                  </div>
                )}
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
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-8 py-4 rounded-xl border-2 border-slate-100 text-slate-600 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all active:scale-95 shadow-sm hover:shadow-md"
                      >
                        Change Account Password
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden"
            >
               {/* Decor */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-50 rounded-full blur-3xl opacity-60"></div>
               
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all z-20"
              >
                <X size={20} />
              </button>
              
              <div className="relative z-10">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Security Update</h3>
                <p className="text-slate-500 text-sm font-medium mb-8">Ensure your account remains secure with a strong password.</p>
                
                <form onSubmit={handlePasswordChange} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Min. 6 characters"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Repeat new password"
                      className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-indigo-500 focus:bg-white transition-all shadow-sm"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    disabled={changingPassword}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all mt-4 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-[0.98]"
                  >
                    {changingPassword ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <ShieldCheck size={16} />}
                    {changingPassword ? 'Updating...' : 'Save New Password'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        {/* Digital ID Card Modal */}
        {showIDCard && registration && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in print:bg-white print:p-0">
            <div className="flex flex-col gap-6 max-w-md w-full animate-scale-in print:hidden">
              <div className="bg-white p-6 rounded-3xl shadow-2xl overflow-hidden relative" id="printable-id-card">
                {/* ID Card Front */}
                <div className="border-[3px] border-indigo-600 rounded-2xl p-6 bg-white relative overflow-hidden">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-slate-100">
                    <div>
                      <h4 className="text-xl font-black text-slate-800 leading-none">CIETM <span className="text-indigo-600">2026</span></h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Conclave on Innovation</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">C</div>
                  </div>

                  {/* Card Body */}
                  <div className="flex gap-6 mb-6">
                    <div className="w-24 h-24 bg-slate-50 border-2 border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shrink-0 overflow-hidden">
                      <User size={48} />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <h5 className="text-lg font-black text-slate-800 truncate leading-tight uppercase">{user.name}</h5>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter mb-2">{registration.personalDetails.category}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 truncate">{registration.personalDetails.institution}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers size={10} className="text-slate-400" />
                          <span className="text-[10px] font-bold text-slate-500 truncate">{registration.paperDetails.track}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Participant ID</p>
                      <p className="text-sm font-black text-slate-800 tracking-wider">#CMP-26-{registration._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <CheckCircle size={24} className="text-emerald-500 mb-1 inline-block" />
                      <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Verified</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                >
                  <Download size={18} /> Print / Save PDF
                </button>
                <button 
                  onClick={() => setShowIDCard(false)}
                  className="px-6 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print-only version (cleaner for PDF export) */}
            <div className="hidden print:block bg-white p-10">
               <div className="w-[85.6mm] h-[53.98mm] border-[1px] border-slate-300 rounded-[3mm] p-[5mm] bg-white flex flex-col justify-between shadow-none mx-auto mb-10">
                  <div className="flex justify-between items-start border-b-[0.5mm] border-slate-100 pb-[2mm]">
                    <div>
                      <h4 className="text-[5mm] font-black text-slate-800 leading-none">CIETM <span className="text-indigo-600">2026</span></h4>
                      <p className="text-[2.5mm] font-bold text-slate-400 uppercase tracking-widest mt-[0.5mm]">Conclave on Innovation</p>
                    </div>
                    <div className="w-[8mm] h-[8mm] bg-indigo-50 rounded-[1.5mm] flex items-center justify-center text-indigo-600 font-bold text-[3mm]">C</div>
                  </div>

                  <div className="flex gap-[4mm]">
                    <div className="w-[18mm] h-[18mm] bg-slate-50 border-[0.3mm] border-slate-100 rounded-[2mm] flex items-center justify-center text-slate-300 overflow-hidden">
                      <User size={32} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h5 className="text-[4mm] font-black text-slate-800 truncate leading-tight uppercase">{user.name}</h5>
                      <span className="text-[2.5mm] font-black text-indigo-600 uppercase tracking-tighter mb-[1mm]">{registration.personalDetails.category}</span>
                      <p className="text-[2.5mm] font-bold text-slate-500">{registration.personalDetails.institution}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[2mm] font-black text-slate-400 uppercase tracking-widest mb-[0.5mm]">Participant ID</p>
                      <p className="text-[3mm] font-black text-slate-800 tracking-wider">#CMP-26-{registration._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[2.5mm] font-black text-emerald-600 uppercase tracking-widest">Verified Delegate</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
            >
               {/* Decor */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-50 rounded-full blur-3xl opacity-50"></div>
               
               <div className="relative z-10 text-center">
                  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <LogOut size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Sign Out?</h3>
                  <p className="text-slate-500 text-sm font-medium mb-8">Are you sure you want to end your current session?</p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={logout}
                      className="w-full py-4 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
                    >
                      Confirm Logout
                    </button>
                    <button 
                      onClick={() => setShowLogoutModal(false)}
                      className="w-full py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                    >
                      Keep Session
                    </button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
