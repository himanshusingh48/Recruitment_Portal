import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Save, ChevronLeft, Loader } from 'lucide-react';

const EditJob = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
        requirements: '',
        closingDate: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    // Load the existing job
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const res = await axios.get(`${API}/api/jobs/${id}`);
                const job = res.data;

                // Check this recruiter owns it
                if (job.recruiter?._id !== user?.id && job.recruiter !== user?.id) {
                    navigate('/');
                    return;
                }

                setFormData({
                    title: job.title || '',
                    company: job.company || '',
                    location: job.location || '',
                    salary: job.salary || '',
                    description: job.description || '',
                    requirements: Array.isArray(job.requirements)
                        ? job.requirements.join(', ')
                        : job.requirements || '',
                    closingDate: job.closingDate
                        ? new Date(job.closingDate).toISOString().split('T')[0]
                        : ''
                });
            } catch (err) {
                setError('Failed to load job. It may have expired or been deleted.');
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchJob();
    }, [id, user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            await axios.put(`${API}/api/jobs/${id}`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating job');
        } finally {
            setSaving(false);
        }
    };

    if (!user || user.role !== 'recruiter') {
        return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Access Denied.</div>;
    }

    if (loading) return (
        <div className="container" style={{ textAlign: 'center', padding: '5rem' }}>
            <div className="loading-spinner" />
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Loading job details...</p>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <Link
                to="/dashboard"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '2rem', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseOver={e => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
                <ChevronLeft size={20} /> Back to My Jobs
            </Link>

            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Edit Job</h1>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>Update the details of your job posting.</p>

                {error && (
                    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Job Title *</label>
                            <input
                                type="text" name="title" className="form-input"
                                value={formData.title} onChange={handleChange}
                                required placeholder="e.g. Senior Frontend Developer"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Company Name *</label>
                            <input
                                type="text" name="company" className="form-input"
                                value={formData.company} onChange={handleChange}
                                required placeholder="e.g. Acme Corp"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Location *</label>
                            <input
                                type="text" name="location" className="form-input"
                                value={formData.location} onChange={handleChange}
                                required placeholder="e.g. Remote, New York"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Salary Range *</label>
                            <input
                                type="text" name="salary" className="form-input"
                                value={formData.salary} onChange={handleChange}
                                required placeholder="e.g. $100k - $120k"
                            />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Application Closing Date *</label>
                            <input
                                type="date" name="closingDate" className="form-input"
                                value={formData.closingDate} onChange={handleChange}
                                required
                                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                                Job auto-deletes after this date.
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Job Description *</label>
                        <textarea
                            name="description" className="form-input form-textarea"
                            style={{ minHeight: '150px' }}
                            value={formData.description} onChange={handleChange}
                            required placeholder="Describe the role, responsibilities..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Requirements (Comma-separated)</label>
                        <input
                            type="text" name="requirements" className="form-input"
                            value={formData.requirements} onChange={handleChange}
                            placeholder="e.g. React, Node.js, 5+ years experience"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Separate each skill or requirement with a comma.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <><Loader size={16} className="spin-icon" /> Saving...</> : <><Save size={16} /> Save Changes</>}
                        </button>
                        <Link to="/dashboard" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditJob;
