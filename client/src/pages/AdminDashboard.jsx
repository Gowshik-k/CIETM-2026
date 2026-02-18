import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Users, FileCheck, Clock, CheckCircle, 
  XCircle, Search, Filter, ExternalLink, Home, LayoutDashboard
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await axios.get('/api/registrations', {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      setRegistrations(data);
    } catch (error) {
      toast.error("Failed to fetch registrations");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    const remarks = prompt("Enter remarks (optional):");
    try {
      await axios.put(`/api/registrations/${id}/review`, { status, remarks }, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      toast.success(`Paper ${status} successfully`);
      if (selectedReg && selectedReg._id === id) {
        setSelectedReg({ ...selectedReg, status, paperDetails: { ...selectedReg.paperDetails, reviewStatus: status } });
      }
      fetchRegistrations();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const filteredData = registrations.filter(reg => {
    const matchesFilter = filter === 'All' || reg.status === filter;
    const matchesSearch = reg.personalDetails?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          reg.paperDetails?.title?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: registrations.length,
    submitted: registrations.filter(r => r.status === 'Submitted').length,
    accepted: registrations.filter(r => r.status === 'Accepted').length,
    pending: registrations.filter(r => r.status === 'Under Review' || r.status === 'Submitted').length
  };

// Standalone Modal Component for better performance and data isolation
const AuthorDetailModal = ({ registration, onClose, onReview, token }) => {
  if (!registration) return null;

  // Robust "Data Stitching" Logic
  // Priority: personalDetails (Form) > userId (Account Profile) > fallback
  const details = {
    name: registration.personalDetails?.name || registration.userId?.name || 'Not provided',
    email: registration.personalDetails?.email || registration.userId?.email || 'Not provided',
    mobile: registration.personalDetails?.mobile || registration.userId?.phone || 'Not provided',
    institution: registration.personalDetails?.institution || 'Not provided',
    category: registration.personalDetails?.category || 'Not provided',
    track: registration.paperDetails?.track || 'Not selected',
    title: registration.paperDetails?.title || 'Untitled',
    abstract: registration.paperDetails?.abstract || 'No abstract provided'
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-[modalSlideUp_0.3s_ease-out]" onClick={e => e.stopPropagation()}>
        <div className="p-5 px-8 flex justify-between items-center bg-slate-50 border-b border-slate-100">
           <div className="flex flex-col">
            <h2 className="text-xl font-extrabold text-slate-800 m-0">Registration Detail</h2>
            <code className="text-xs font-mono text-slate-400 mt-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-fit">ID: {registration._id}</code>
           </div>
           
           <div className="flex items-center gap-4">
               <span className={`px-3 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide ${registration.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : registration.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {registration.status}
              </span>
              <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={onClose}><XCircle size={24} /></button>
           </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-2"><Users size={16} /> Personal Details</h3>
            
            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Users size={12} /> Full Name</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.name}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><ExternalLink size={12} /> Email</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.email}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Clock size={12} /> Phone</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.mobile}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Users size={12} /> Institution</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.institution}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Filter size={12} /> Category</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.category}</span>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-2"><FileCheck size={16} /> Paper Details</h3>
            
            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><FileCheck size={12} /> Paper Title</label>
              <h4 className="text-lg font-bold text-slate-800 leading-snug">{details.title}</h4>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Search size={12} /> Abstract</label>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm leading-relaxed text-slate-600 font-medium italic">
                <p>{details.abstract}</p>
              </div>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Filter size={12} /> Track</label>
              <span className="text-[0.95rem] font-semibold text-slate-800">{details.track}</span>
            </div>

            <div className="grid grid-cols-[120px_1fr] mb-3 items-baseline gap-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2"><Search size={12} /> Keywords</label>
              <div className="flex flex-wrap gap-2">
                {registration.paperDetails?.keywords?.length > 0 ? (
                  registration.paperDetails.keywords.map((k, i) => (
                    <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-wide">{k}</span>
                  ))
                ) : (
                  <span className="text-slate-400 text-sm">None provided</span>
                )}
              </div>
            </div>
          </div>

          {registration.teamMembers && registration.teamMembers.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest mb-4 border-b border-slate-200 pb-2 flex items-center gap-2"><Users size={16} /> Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {registration.teamMembers.map((member, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-col">
                    <span className="font-bold text-slate-800 text-sm">{member.name}</span>
                    <span className="text-xs text-slate-500 font-medium">{member.email}</span>
                    <div className="mt-1 flex flex-col gap-0.5">
                      <span className="text-[0.7rem] text-indigo-600 font-extrabold uppercase tracking-tight">{member.affiliation}</span>
                      <span className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">{member.department}</span>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-[0.65rem]">
                       <span className="text-slate-500 font-bold">📞 {member.mobile || 'N/A'}</span>
                       <span className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-700 font-black tracking-tighter uppercase">{member.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 px-8 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="flex gap-4">
            {registration.paperDetails?.fileUrl && (
              <a 
                href={`/api/registrations/download/${registration._id}?token=${token}`} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center gap-2 bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-700 hover:-translate-y-0.5 transition-all shadow-md"
              >
                <ExternalLink size={16} /> View / Download Manuscript
              </a>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => onReview(registration._id, 'Accepted')} 
              className="bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-600 hover:-translate-y-0.5 transition-all shadow-md shadow-emerald-200"
            >
              Verify & Accept
            </button>
            <button 
              onClick={() => onReview(registration._id, 'Rejected')} 
              className="bg-white text-red-500 border border-red-200 px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-red-50 hover:border-red-300 transition-all"
            >
              Reject Submission
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-bold text-sm">Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className="h-screen p-6 md:px-10 md:py-8 bg-slate-50 flex flex-col overflow-hidden animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center shrink-0 gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
             <Link to="/" className="p-2 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-indigo-600 transition-colors shadow-sm">
               <Home size={20} />
             </Link>
             <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight uppercase">Admin Dashboard</h1>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">CIETM 2026 Management</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 min-w-[160px] transition-transform hover:-translate-y-1">
             <Users className="text-indigo-500 opacity-90" size={24} />
             <div>
                <span className="block text-xl font-black text-slate-800 leading-none mb-0.5">{stats.total}</span>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Total Authors</div>
             </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 min-w-[160px] transition-transform hover:-translate-y-1">
             <FileCheck className="text-blue-500 opacity-90" size={24} />
             <div>
                <span className="block text-xl font-black text-slate-800 leading-none mb-0.5">{stats.submitted}</span>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Submitted</div>
             </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 min-w-[160px] transition-transform hover:-translate-y-1">
             <CheckCircle className="text-emerald-500 opacity-90" size={24} />
             <div>
                <span className="block text-xl font-black text-slate-800 leading-none mb-0.5">{stats.accepted}</span>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Accepted</div>
             </div>
          </div>
          <div className="bg-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100 min-w-[160px] transition-transform hover:-translate-y-1">
             <Clock className="text-amber-500 opacity-90" size={24} />
             <div>
                <span className="block text-xl font-black text-slate-800 leading-none mb-0.5">{stats.pending}</span>
                <div className="text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Pending Review</div>
             </div>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-2xl flex flex-col md:flex-row justify-between items-center mb-6 p-4 shadow-sm border border-slate-100 shrink-0 gap-4">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl w-full md:w-[320px] border border-transparent focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all group">
          <Search size={20} className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            placeholder="Search by name or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none w-full font-medium text-sm focus:outline-none text-slate-700 placeholder:text-slate-400"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Submitted', 'Under Review', 'Accepted', 'Rejected'].map(t => (
            <button 
              key={t} 
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all whitespace-nowrap ${filter === t ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'}`}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grow overflow-hidden bg-white rounded-2xl border border-slate-100 shadow-md flex flex-col">
        <div className="overflow-y-auto h-full w-full">
          <table className="w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left">
              <tr>
                <th className="p-4 text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-wider border-b border-slate-200">Author</th>
                <th className="p-4 text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-wider border-b border-slate-200">Paper Title</th>
                <th className="p-4 text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-wider border-b border-slate-200">Status</th>
                <th className="p-4 text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-wider border-b border-slate-200">Review Status</th>
                <th className="p-4 text-slate-400 text-[0.7rem] font-extrabold uppercase tracking-wider border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(reg => (
                <tr key={reg._id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-4 border-b border-slate-100 align-middle">
                    <div className="cursor-pointer" onClick={() => setSelectedReg(reg)}>
                      <strong className="block text-sm font-bold text-slate-800 mb-0.5 group-hover:text-indigo-600 transition-colors">{reg.userId?.name}</strong>
                      <span className="text-xs font-semibold text-slate-400">{reg.personalDetails?.institution}</span>
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100 align-middle">
                    <div>
                      <p className="text-sm font-bold text-slate-700 max-w-[280px] truncate mb-1">{reg.paperDetails?.title || 'No Title'}</p>
                      {reg.paperDetails?.fileUrl && (
                        <a href={`/api/registrations/download/${reg._id}?token=${user.token}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-indigo-600 hover:underline">
                          View Paper <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-4 border-b border-slate-100 align-middle">
                     <span className={`px-2.5 py-1 rounded-md text-[0.65rem] font-extrabold uppercase tracking-wide inline-block ${reg.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600' : reg.status === 'Rejected' ? 'bg-red-50 text-red-600' : reg.status === 'Under Review' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                      {reg.status}
                     </span>
                  </td>
                  <td className="p-4 border-b border-slate-100 align-middle text-sm font-medium text-slate-600">
                    {reg.paperDetails?.reviewStatus}
                  </td>
                  <td className="p-4 border-b border-slate-100 align-middle">
                    <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleReview(reg._id, 'Accepted')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600 transition-all hover:scale-110"
                        title="Accept"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button 
                        onClick={() => handleReview(reg._id, 'Rejected')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600 transition-all hover:scale-110"
                        title="Reject"
                      >
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Search size={48} className="mb-4 opacity-20" />
                <p className="font-bold">No registrations found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>

      {selectedReg && (
        <AuthorDetailModal 
          registration={selectedReg} 
          onClose={() => setSelectedReg(null)} 
          onReview={handleReview}
          token={user.token}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
