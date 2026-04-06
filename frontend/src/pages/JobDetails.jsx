import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { MapPin, DollarSign, Building, Clock, Briefcase, ChevronLeft, CheckCircle, Calendar, AlertTriangle } from 'lucide-react';

const JobDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applySuccess, setApplySuccess] = useState(false);
    const [error, setError] = useState('');

    const [applicationData, setApplicationData] = useState({
        resume: null,
        email: '',
        phone: '+91 ',
        coverLetter: ''
    });

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const res = await axios.get(`${API}/api/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                setError('Failed to load job details.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('Please login to apply');
            return;
        }

        setApplying(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;

            const formData = new FormData();
            formData.append('resume', applicationData.resume);
            formData.append('email', applicationData.email);
            formData.append('phone', applicationData.phone);
            formData.append('coverLetter', applicationData.coverLetter);

            await axios.post(
                `${API}/api/applications/${id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            setApplySuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
    if (!job) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Job not found</div>;

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = 'var(--primary)'} onMouseOut={e => e.target.style.color = 'var(--text-muted)'}>
                <ChevronLeft size={20} /> Back to Jobs
            </Link>

            <div className="grid" style={{ gridTemplateColumns: '1fr 350px', alignItems: 'start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Main Content */}
                    <div className="glass-panel" style={{ padding: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{job.title}</h1>
                        <h2 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: 500, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Building size={20} /> {job.company}
                        </h2>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem', padding: '1.5rem', background: 'rgba(9, 30, 66, 0.04)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <MapPin size={20} color="var(--primary)" />
                                <span>{job.location}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <DollarSign size={20} color="var(--primary)" />
                                <span>{job.salary}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)' }}>
                                <Clock size={20} color="var(--primary)" />
                                <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                            {job.closingDate && (() => {
                                const days = Math.ceil((new Date(job.closingDate) - new Date()) / 86400000);
                                const color = days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : '#10b981';
                                return (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color }}>
                                        <Calendar size={20} color={color} />
                                        <span style={{ fontWeight: 600 }}>
                                            Closes {new Date(job.closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {days <= 7 && ` — ${days}d left!`}
                                        </span>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Closing soon warning banner */}
                        {job.closingDate && Math.ceil((new Date(job.closingDate) - new Date()) / 86400000) <= 3 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.5rem', color: '#ef4444', fontSize: '0.9rem', fontWeight: 600 }}>
                                <AlertTriangle size={18} /> This role closes very soon — apply now!
                            </div>
                        )}

                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Briefcase size={20} /> Job Description
                        </h3>
                        <div style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '2.5rem', whiteSpace: 'pre-line' }}>
                            {job.description}
                        </div>

                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Requirements</h3>
                        <ul style={{ color: 'var(--text-muted)', lineHeight: 1.7, paddingLeft: '1.5rem', marginBottom: '2rem' }}>
                            {job.requirements.map((req, i) => (
                                <li key={i} style={{ marginBottom: '0.5rem' }}>{req}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Sidebar / Apply fixed box */}
                <div style={{ position: 'sticky', top: '100px' }}>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        {user?.role === 'recruiter' ? (
                            <div style={{ textAlign: 'center' }}>
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Recruiter View</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    You are browsing as a recruiter. Log in as an applicant to apply for this position.
                                </p>
                            </div>
                        ) : applySuccess ? (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                <h3 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Application Sent!</h3>
                                <p style={{ color: 'var(--text-muted)' }}>The recruiter will review your profile soon.</p>
                                <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: '1.5rem', width: '100%', textDecoration: 'none' }}>
                                    View My Applications
                                </Link>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Apply for this job</h3>

                                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                                <form onSubmit={handleApply}>
                                    <div className="form-group">
                                        <label className="form-label">Resume (PDF only) *</label>
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            className="form-input"
                                            onChange={e => setApplicationData({ ...applicationData, resume: e.target.files[0] })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input
                                            type="email"
                                            className="form-input"
                                            placeholder="you@example.com"
                                            value={applicationData.email}
                                            onChange={e => setApplicationData({ ...applicationData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Phone Number *</label>
                                        <input
                                            type="tel"
                                            className="form-input"
                                            placeholder="+91 9876543210"
                                            value={applicationData.phone}
                                            onChange={e => setApplicationData({ ...applicationData, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Cover Letter</label>
                                        <textarea
                                            className="form-input form-textarea"
                                            placeholder="Why are you a good fit?"
                                            required
                                            value={applicationData.coverLetter}
                                            onChange={e => setApplicationData({ ...applicationData, coverLetter: e.target.value })}
                                        ></textarea>
                                    </div>

                                    {user ? (
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={applying}>
                                            {applying ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    ) : (
                                        <Link to="/login" className="btn btn-primary" style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}>
                                            Login to Apply
                                        </Link>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
