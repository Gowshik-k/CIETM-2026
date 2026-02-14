import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, FileCheck, Clock, CheckCircle, 
  XCircle, Search, Filter, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await axios.get('/api/registrations');
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
      await axios.put(`/api/registrations/${id}/review`, { status, remarks });
      toast.success(`Paper ${status} successfully`);
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
                  <div className="author-cell">
                    <strong>{reg.userId?.name}</strong>
                    <span>{reg.personalDetails?.institution}</span>
                  </div>
                </td>
                <td>
                  <div className="title-cell">
                    <p>{reg.paperDetails?.title || 'No Title'}</p>
                    {reg.paperDetails?.fileUrl && (
                      <a href={reg.paperDetails.fileUrl} target="_blank" rel="noreferrer">
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
  );
};

export default AdminDashboard;
