import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, FileCheck, Clock, CheckCircle, 
  XCircle, Search, Filter, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

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
    <div className="registration-modal-overlay" onClick={onClose}>
      <div className="registration-modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><XCircle /></button>
        
        <div className="modal-header">
          <div className="header-info">
            <h2>Registration Detail</h2>
            <code className="reg-id">ID: {registration._id}</code>
          </div>
          <span className={`status-badge ${registration.status?.toLowerCase().replace(' ', '-')}`}>
            {registration.status}
          </span>
        </div>

        <div className="modal-grid">
          <div className="detail-section">
            <h3 className="section-title-sm"><Users size={18} /> Personal Details</h3>
            
            <div className="detail-row">
              <label><Users size={14} /> Full Name</label>
              <span className="modal-value-text">{details.name}</span>
            </div>

            <div className="detail-row">
              <label><ExternalLink size={14} /> Email Address</label>
              <span className="modal-value-text">{details.email}</span>
            </div>

            <div className="detail-row">
              <label><Clock size={14} /> Phone Number</label>
              <span className="modal-value-text">{details.mobile}</span>
            </div>

            <div className="detail-row">
              <label><Users size={14} /> Institution</label>
              <span className="modal-value-text">{details.institution}</span>
            </div>

            <div className="detail-row">
              <label><Filter size={14} /> Category</label>
              <span className="modal-value-text">{details.category}</span>
            </div>
          </div>

          <div className="detail-section">
            <h3 className="section-title-sm"><FileCheck size={18} /> Paper Details</h3>
            
            <div className="detail-row">
              <label><FileCheck size={14} /> Paper Title</label>
              <h4 className="modal-paper-title">{details.title}</h4>
            </div>

            <div className="detail-row">
              <label><Search size={14} /> Abstract</label>
              <div className="modal-abstract-box">
                <p className="modal-abstract-content">{details.abstract}</p>
              </div>
            </div>

            <div className="detail-row">
              <label><Filter size={14} /> Conference Track</label>
              <span className="modal-value-text">{details.track}</span>
            </div>

            <div className="detail-row">
              <label><Search size={14} /> Keywords</label>
              <div className="modal-keywords-container">
                {registration.paperDetails?.keywords?.length > 0 ? (
                  registration.paperDetails.keywords.map((k, i) => (
                    <span key={i} className="modal-keyword-chip">{k}</span>
                  ))
                ) : (
                  <span className="text-muted">None provided</span>
                )}
              </div>
            </div>
          </div>

          {registration.teamMembers && registration.teamMembers.length > 0 && (
            <div className="detail-section full-width">
              <h3 className="section-title-sm"><Users size={18} /> Team Members</h3>
              <div className="modal-team-grid">
                {registration.teamMembers.map((member, i) => (
                  <div key={i} className="modal-team-card">
                    <span className="member-name">{member.name}</span>
                    <span className="member-email">{member.email}</span>
                    <span className="member-org">{member.affiliation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hidden Data for debugging if needed */}
          <div style={{display: 'none'}} id="modal-debug-data">
            {JSON.stringify(registration, null, 2)}
          </div>
        </div>

        <div className="modal-footer">
          <div className="primary-actions">
            {registration.paperDetails?.fileUrl && (
              <a 
                href={`/api/registrations/download/${registration._id}?token=${token}`} 
                target="_blank" 
                rel="noreferrer" 
                className="btn-download-premium"
              >
                <ExternalLink size={18} /> View / Download Manuscript
              </a>
            )}
          </div>
          <div className="workflow-actions">
            <button 
              onClick={() => onReview(registration._id, 'Accepted')} 
              className="btn-action-accept"
            >
              Verify & Accept
            </button>
            <button 
              onClick={() => onReview(registration._id, 'Rejected')} 
              className="btn-action-reject"
            >
              Reject Submission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  if (loading) return <div className="loading">Loading Admin Panel...</div>;

  return (
    <div className="admin-dashboard container fade-in">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-stats">
          <div className="stat-box">
             <Users />
             <div><span>{stats.total}</span>Total Authors</div>
          </div>
          <div className="stat-box">
             <FileCheck />
             <div><span>{stats.submitted}</span>Submitted Papers</div>
          </div>
          <div className="stat-box">
             <CheckCircle color="var(--success-color)" />
             <div><span>{stats.accepted}</span>Accepted</div>
          </div>
          <div className="stat-box">
             <Clock color="var(--warning-color)" />
             <div><span>{stats.pending}</span>Pending Review</div>
          </div>
        </div>
      </header>

      <div className="admin-controls card">
        <div className="search-box">
          <Search size={20} />
          <input 
            placeholder="Search by name or title..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['All', 'Submitted', 'Under Review', 'Accepted', 'Rejected'].map(t => (
            <button 
              key={t} 
              className={filter === t ? 'active' : ''}
              onClick={() => setFilter(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="registrations-list">
        <div className="table-wrapper">
          <table className="admin-table card">
            <thead>
              <tr>
                <th>Author</th>
                <th>Paper Title</th>
                <th>Status</th>
                <th>Review Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(reg => (
                <tr key={reg._id}>
                  <td>
                    <div className="author-cell clickable" onClick={() => setSelectedReg(reg)}>
                      <strong>{reg.userId?.name}</strong>
                      <span>{reg.personalDetails?.institution}</span>
                    </div>
                  </td>
                  <td>
                    <div className="title-cell">
                      <p>{reg.paperDetails?.title || 'No Title'}</p>
                      {reg.paperDetails?.fileUrl && (
                        <a href={`/api/registrations/download/${reg._id}?token=${user.token}`} target="_blank" rel="noreferrer" className="view-link">
                          View Paper <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td>
                     <span className={`status-badge ${reg.status.toLowerCase().replace(' ', '-')}`}>
                      {reg.status}
                     </span>
                  </td>
                  <td>
                    {reg.paperDetails?.reviewStatus}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button 
                        onClick={() => handleReview(reg._id, 'Accepted')}
                        className="btn-icon success"
                        title="Accept"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => handleReview(reg._id, 'Rejected')}
                        className="btn-icon danger"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
