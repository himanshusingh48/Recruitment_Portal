import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PlusCircle } from 'lucide-react';

const CreateJob = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: '',
        salary: '',
        description: '',
        requirements: ''
    });

    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            await axios.post(`${API}/api/jobs`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error posting job');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user || user.role !== 'recruiter') {
        return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Access Denied. Only recruiters can post jobs.</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '800px' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Post a New Job</h1>
                <p className="subtitle" style={{ marginBottom: '2rem' }}>Fill out the details below to publish your opening.</p>

                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Job Title</label>
                            <input type="text" name="title" className="form-input" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior Frontend Developer" />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Company Name</label>
                            <input type="text" name="company" className="form-input" value={formData.company} onChange={handleChange} required placeholder="e.g. Acme Corp" />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Location</label>
                            <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} required placeholder="e.g. Remote, New York" />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Salary Range</label>
                            <input type="text" name="salary" className="form-input" value={formData.salary} onChange={handleChange} required placeholder="e.g. $100k - $120k" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Job Description</label>
                        <textarea
                            name="description"
                            className="form-input form-textarea"
                            style={{ minHeight: '150px' }}
                            value={formData.description}
                            onChange={handleChange}
                            required
                            placeholder="Describe the role, responsibilities, and team culture..."
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Requirements (Comma-separated)</label>
                        <input
                            type="text"
                            name="requirements"
                            className="form-input"
                            value={formData.requirements}
                            onChange={handleChange}
                            placeholder="e.g. React, Node.js, 5+ years experience"
                        />
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Separate each skill or requirement with a comma.</p>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Publishing...' : <><PlusCircle size={18} /> Publish Job</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJob;
