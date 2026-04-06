import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './RecruiterApplications.css';
import { AuthContext } from '../context/AuthContext';
import {
    Users, CheckCircle, XCircle, Clock, FileText,
    Download, Mail, Phone, Briefcase, Building, Filter, Trash2, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
    accepted: { text: '#10b981', bg: 'rgba(16,185,129,0.1)', border: '#10b981' },
    rejected: { text: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: '#ef4444' },
    reviewed: { text: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: '#3b82f6' },
    pending: { text: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: '#f59e0b' },
};

const StatusBadge = ({ status }) => {
    const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
    const icons = {
        accepted: <CheckCircle size={14} />,
        rejected: <XCircle size={14} />,
        reviewed: <FileText size={14} />,
        pending: <Clock size={14} />,
    };
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
            padding: '0.25rem 0.75rem', borderRadius: '999px',
            fontSize: '0.78rem', fontWeight: 700, textTransform: 'capitalize'
        }}>
            {icons[status]} {status}
        </span>
    );
};

const RecruiterApplications = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterJob, setFilterJob] = useState('all');
    const [updatingId, setUpdatingId] = useState(null);
    const [deletingJobId, setDeletingJobId] = useState(null);

    useEffect(() => {
        if (!user) return;
        if (user.role !== 'recruiter') { navigate('/'); return; }
        fetchApplications();
    }, [user]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API}/api/applications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(res.data);
        } catch (err) {
            console.error('Error fetching applications', err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            await axios.put(
                `${API}/api/applications/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setApplications(prev =>
                prev.map(app => app._id === id ? { ...app, status } : app)
            );
        } catch (err) {
            console.error('Error updating status', err);
        } finally {
            setUpdatingId(false);
        }
    };

    const deleteJob = async (jobId, jobTitle) => {
        if (!window.confirm(`Are you sure you want to permanently delete "${jobTitle}"? All applications for this job will also be deleted.`)) return;
        setDeletingJobId(jobId);
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            await axios.delete(`${API}/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove all applications for this job from local state
            setApplications(prev => prev.filter(app => app.job?._id !== jobId));
            if (filterJob === jobId) setFilterJob('all');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete job');
        } finally {
            setDeletingJobId(null);
        }
    };

    // Unique job titles for filter
    const jobTitles = [...new Map(
        applications.map(a => [a.job?._id, { id: a.job?._id, title: a.job?.title, company: a.job?.company }])
    ).values()];

    const filtered = applications.filter(app => {
        const matchStatus = filterStatus === 'all' || app.status === filterStatus;
        const matchJob = filterJob === 'all' || app.job?._id === filterJob;
        return matchStatus && matchJob;
    });

    // Stats
    const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
    };

    if (!user || user.role !== 'recruiter') return null;

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading applications...</p>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1100px' }}>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    Applications Received
                </h1>
                <p className="subtitle" style={{ marginBottom: 0 }}>
                    Manage all applications for your job postings
                </p>
            </div>

            {/* Stats Row */}
            <div className="ra-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Total', value: stats.total, icon: <Users size={20} />, color: 'var(--primary)' },
                    { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: '#f59e0b' },
                    { label: 'Accepted', value: stats.accepted, icon: <CheckCircle size={20} />, color: '#10b981' },
                    { label: 'Rejected', value: stats.rejected, icon: <XCircle size={20} />, color: '#ef4444' },
                ].map(s => (
                    <div key={s.label} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ color: s.color }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>{s.value}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-panel" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                    <Filter size={16} /> <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter by:</span>
                </div>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    id="filter-status"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select
                    value={filterJob}
                    onChange={e => setFilterJob(e.target.value)}
                    className="form-input"
                    style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    id="filter-job"
                >
                    <option value="all">All Jobs</option>
                    {jobTitles.map(j => (
                        <option key={j.id} value={j.id}>{j.title} — {j.company}</option>
                    ))}
                </select>
                <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Applications List */}
            {filtered.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Users size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--text-muted)' }}>No applications found for the selected filters.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filtered.map((app, idx) => (
                        <div
                            key={app._id}
                            className="glass-panel ra-card"
                            style={{ padding: '1.5rem', animation: `fadeIn 0.3s ease ${idx * 0.05}s both` }}
                        >
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                        <Briefcase size={16} color="var(--primary)" />
                                        <span style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-main)' }}>
                                            {app.job?.title || 'Unknown Role'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        <Building size={14} />
                                        <span>{app.job?.company || '—'}</span>
                                        <span style={{ color: 'var(--glass-border)' }}>•</span>
                                        <span>Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        {app.job?.closingDate && (
                                            <>
                                                <span style={{ color: 'var(--glass-border)' }}>•</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontWeight: 600 }}>
                                                    <Calendar size={13} />
                                                    Closes {new Date(app.job.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <StatusBadge status={app.status} />
                                    <button
                                        onClick={() => deleteJob(app.job?._id, app.job?.title)}
                                        disabled={deletingJobId === app.job?._id}
                                        className="ra-btn ra-btn-delete"
                                        title="Delete this job posting"
                                        id={`delete-job-${app.job?._id}`}
                                    >
                                        <Trash2 size={14} />
                                        {deletingJobId === app.job?._id ? 'Deleting...' : 'Delete Job'}
                                    </button>
                                </div>
                            </div>

                            {/* Applicant details */}
                            <div style={{
                                background: 'rgba(9,30,66,0.04)', borderRadius: '10px',
                                padding: '1rem 1.25rem', marginBottom: '1.25rem',
                                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem'
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{app.applicant?.name || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Mail size={12} /> Email
                                    </div>
                                    <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{app.email || app.applicant?.email || '—'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <Phone size={12} /> Phone
                                    </div>
                                    <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{app.phone || '—'}</div>
                                </div>
                                {app.coverLetter && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cover Letter</div>
                                        <div style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{app.coverLetter}</div>
                                    </div>
                                )}
                            </div>

                            {/* Action buttons */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
                                {/* Resume Download */}
                                {app.resume && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/uploads/${app.resume}`}
                                        download
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ra-btn ra-btn-download"
                                        id={`download-resume-${app._id}`}
                                    >
                                        <Download size={15} /> Download Resume
                                    </a>
                                )}

                                <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    {app.status !== 'accepted' && (
                                        <button
                                            onClick={() => updateStatus(app._id, 'accepted')}
                                            disabled={updatingId === app._id}
                                            className="ra-btn ra-btn-accept"
                                            id={`accept-${app._id}`}
                                        >
                                            <CheckCircle size={15} /> Accept
                                        </button>
                                    )}
                                    {app.status === 'pending' && (
                                        <button
                                            onClick={() => updateStatus(app._id, 'reviewed')}
                                            disabled={updatingId === app._id}
                                            className="ra-btn ra-btn-review"
                                            id={`review-${app._id}`}
                                        >
                                            <FileText size={15} /> Mark Reviewed
                                        </button>
                                    )}
                                    {app.status !== 'rejected' && (
                                        <button
                                            onClick={() => updateStatus(app._id, 'rejected')}
                                            disabled={updatingId === app._id}
                                            className="ra-btn ra-btn-reject"
                                            id={`reject-${app._id}`}
                                        >
                                            <XCircle size={15} /> Reject
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RecruiterApplications;
