import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
    FileText, CheckCircle, Clock, XCircle,
    MapPin, DollarSign, Calendar, Edit2, Trash2, PlusCircle, Briefcase, AlertTriangle
} from 'lucide-react';
import './RecruiterApplications.css';

/* ─── Job seeker: application status helpers ─── */
const STATUS_COLOR = {
    accepted: '#10b981', rejected: '#ef4444', reviewed: '#3b82f6', pending: '#f59e0b'
};
const StatusIcon = ({ status }) => {
    switch (status) {
        case 'accepted': return <CheckCircle size={18} color="#10b981" />;
        case 'rejected': return <XCircle size={18} color="#ef4444" />;
        case 'reviewed': return <FileText size={18} color="#3b82f6" />;
        default: return <Clock size={18} color="#f59e0b" />;
    }
};

/* ─── Days remaining badge ─── */
const DaysLeftBadge = ({ closingDate }) => {
    if (!closingDate) return null;
    const days = Math.ceil((new Date(closingDate) - new Date()) / 86400000);
    const dateStr = new Date(closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const color = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981';
    const bg = days <= 3 ? 'rgba(239,68,68,0.1)' : days <= 7 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)';
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
            background: bg, color, padding: '0.2rem 0.6rem',
            borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600
        }}>
            <Calendar size={12} />
            {days <= 0 ? 'Expired' : `Closes ${dateStr} (${days}d left)`}
        </span>
    );
};

/* ════════════════════════════════════
   RECRUITER VIEW — My Posted Jobs
════════════════════════════════════ */
const RecruiterDashboard = () => {
    const { user } = useContext(AuthContext);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            const res = await axios.get(`${API}/api/jobs/mine`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(res.data);
        } catch (err) {
            console.error('Error fetching your jobs', err);
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (jobId, jobTitle) => {
        if (!window.confirm(`Delete "${jobTitle}"? All its applications will also be removed.`)) return;
        setDeletingId(jobId);
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            await axios.delete(`${API}/api/jobs/${jobId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setJobs(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete job');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading your jobs...</p>
        </div>
    );

    const now = new Date();
    const activeJobs = jobs.filter(j => new Date(j.closingDate) >= now);
    const expiredJobs = jobs.filter(j => new Date(j.closingDate) < now);

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>My Posted Jobs</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                        {activeJobs.length} active · {expiredJobs.length} expired
                    </p>
                </div>
                <Link to="/create-job" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    <PlusCircle size={18} /> Post New Job
                </Link>
            </div>

            {jobs.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Briefcase size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-main)' }}>No jobs posted yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start attracting candidates by posting your first job.</p>
                    <Link to="/create-job" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        <PlusCircle size={18} /> Post a Job
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {jobs.map((job, idx) => {
                        const days = Math.ceil((new Date(job.closingDate) - new Date()) / 86400000);
                        const isExpired = days <= 0;
                        const isUrgent = !isExpired && days <= 3;

                        return (
                            <div
                                key={job._id}
                                className="glass-panel"
                                style={{
                                    padding: '1.5rem',
                                    animation: `fadeIn 0.3s ease ${idx * 0.05}s both`,
                                    borderLeft: isExpired ? '3px solid #6b778c' : isUrgent ? '3px solid #ef4444' : '3px solid #10b981',
                                    opacity: isExpired ? 0.75 : 1
                                }}
                            >
                                {/* Job title row */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.3rem' }}>
                                            {job.title}
                                        </h3>
                                        <span style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>{job.company}</span>
                                    </div>
                                    {isExpired && (
                                        <span style={{ background: 'rgba(107,119,140,0.12)', color: '#6b778c', border: '1px solid #6b778c', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            EXPIRED
                                        </span>
                                    )}
                                    {isUrgent && !isExpired && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                                            <AlertTriangle size={12} /> CLOSING SOON
                                        </span>
                                    )}
                                </div>

                                {/* Meta info */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <MapPin size={14} /> {job.location}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                        <DollarSign size={14} /> {job.salary}
                                    </span>
                                    <DaysLeftBadge closingDate={job.closingDate} />
                                </div>

                                {/* Requirements tags */}
                                {job.requirements?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                                        {job.requirements.slice(0, 5).map((r, i) => (
                                            <span key={i} className="job-tag">{r}</span>
                                        ))}
                                        {job.requirements.length > 5 && (
                                            <span className="job-tag">+{job.requirements.length - 5}</span>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    <Link
                                        to={`/edit-job/${job._id}`}
                                        className="ra-btn ra-btn-edit"
                                        id={`edit-job-${job._id}`}
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <Edit2 size={14} /> Edit Job
                                    </Link>
                                    <Link
                                        to={`/jobs/${job._id}`}
                                        className="ra-btn"
                                        style={{ textDecoration: 'none', background: 'rgba(0,82,204,0.08)', color: 'var(--primary)', border: '1.5px solid var(--primary)' }}
                                    >
                                        <Briefcase size={14} /> View Listing
                                    </Link>
                                    <button
                                        onClick={() => deleteJob(job._id, job.title)}
                                        disabled={deletingId === job._id}
                                        className="ra-btn ra-btn-delete"
                                        id={`delete-job-${job._id}`}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        <Trash2 size={14} />
                                        {deletingId === job._id ? 'Deleting...' : 'Delete Job'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════
   JOB SEEKER VIEW — My Applications
════════════════════════════════════ */
const ApplicantDashboard = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                const API = import.meta.env.VITE_API_URL;
                const res = await axios.get(`${API}/api/applications`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(res.data);
            } catch (err) {
                console.error('Error fetching applications');
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchApplications();
    }, [user]);

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading your applications...</p>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: 0 }}>My Applications</h1>
                <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--primary)', fontWeight: 500 }}>
                    {applications.length} Total
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>You haven't applied to any jobs yet.</p>
                    <Link to="/" className="btn btn-primary" style={{ textDecoration: 'none' }}>Browse Jobs</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {applications.map((app, idx) => (
                        <div
                            key={app._id}
                            className="glass-panel"
                            style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', animation: `fadeIn 0.4s ease ${idx * 0.05}s both` }}
                        >
                            <div style={{ flex: '1 1 220px' }}>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                                    {app.job?.title || 'Unknown Job'}
                                </h3>
                                <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem' }}>{app.job?.company}</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    Applied on {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>

                            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <StatusIcon status={app.status} />
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: STATUS_COLOR[app.status] || '#f59e0b', fontSize: '0.9rem' }}>
                                        {app.status}
                                    </span>
                                </div>
                                {app.resume && (
                                    <a
                                        href={`${import.meta.env.VITE_API_URL}/uploads/${app.resume}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '0.8rem', fontWeight: 500 }}
                                    >
                                        View Resume ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

/* ════════════════════════════════════
   ROOT DASHBOARD — role-based router
════════════════════════════════════ */
const Dashboard = () => {
    const { user } = useContext(AuthContext);
    if (!user) return (
        <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
            Please log in to view your dashboard.
        </div>
    );
    return user.role === 'recruiter' ? <RecruiterDashboard /> : <ApplicantDashboard />;
};

export default Dashboard;
