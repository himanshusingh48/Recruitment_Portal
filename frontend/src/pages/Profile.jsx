import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Save, Loader } from 'lucide-react';

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const API = import.meta.env.VITE_API_URL;
            const res = await axios.put(`${API}/api/auth/profile`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update global context & local storage
            updateProfile(res.data);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    if (!user) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Please log in.</div>;

    return (
        <div className="container" style={{ maxWidth: '600px', marginTop: '2rem' }}>
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>My Profile</h1>
                <p className="subtitle" style={{ textAlign: 'center', marginBottom: '2rem' }}>Update your personal information</p>

                {error && (
                    <div style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.3)' }}>
                        {error}
                    </div>
                )}
                {message && (
                    <div style={{ color: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.3)' }}>
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <User size={18} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="Your full name"
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                className="form-input"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ paddingLeft: '40px' }}
                                placeholder="Your email address"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
                        {saving ? <><Loader size={18} className="spin-icon" style={{ display: 'inline-block' }} /> Saving...</> : <><Save size={18} /> Save Changes</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;
