import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'applicant'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const API = import.meta.env.VITE_API_URL;
            const res = await axios.post(`${API}/api/auth/register`, formData);
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Error creating account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ padding: '4rem 2rem' }}>
            <div className="glass-panel auth-card animate-fade-in">
                <h2 className="title" style={{ textAlign: 'center', fontSize: '2rem' }}>Create Account</h2>
                <p className="subtitle" style={{ textAlign: 'center' }}>Join RecruitPortal today</p>

                {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: '1px solid var(--glass-border)', borderRadius: '8px', flex: 1, backgroundColor: formData.role === 'applicant' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', borderColor: formData.role === 'applicant' ? 'var(--primary)' : 'var(--glass-border)' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="applicant"
                                    checked={formData.role === 'applicant'}
                                    onChange={handleChange}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: formData.role === 'applicant' ? 'white' : 'var(--text-muted)' }}>Job Seeker</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.75rem', border: '1px solid var(--glass-border)', borderRadius: '8px', flex: 1, backgroundColor: formData.role === 'recruiter' ? 'rgba(99, 102, 241, 0.2)' : 'transparent', borderColor: formData.role === 'recruiter' ? 'var(--primary)' : 'var(--glass-border)' }}>
                                <input
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={formData.role === 'recruiter'}
                                    onChange={handleChange}
                                    style={{ accentColor: 'var(--primary)' }}
                                />
                                <span style={{ fontSize: '0.9rem', color: formData.role === 'recruiter' ? 'white' : 'var(--text-muted)' }}>Recruiter</span>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isLoading}>
                        {isLoading ? 'Creating account...' : <><UserPlus size={18} /> Sign Up</>}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
