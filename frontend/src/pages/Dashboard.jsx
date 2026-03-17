import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FileText, CheckCircle, Clock, XCircle, Users } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/applications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setApplications(res.data);
            } catch (err) {
                console.error('Error fetching applications');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchApplications();
        }
    }, [user]);

    const updateStatus = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `http://localhost:5000/api/applications/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local state
            setApplications(applications.map(app => app._id === id ? { ...app, status } : app));
        } catch (err) {
            console.error('Error updating status', err);
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'accepted': return <CheckCircle size={20} color="#10b981" />;
            case 'rejected': return <XCircle size={20} color="#ef4444" />;
            case 'reviewed': return <FileText size={20} color="#3b82f6" />;
            default: return <Clock size={20} color="#f59e0b" />;
        }
    };

    if (!user) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Please log in to view your dashboard.</div>;
    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>Loading dashboard...</div>;

    return (
        <div className="container" style={{ maxWidth: '1000px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 className="title" style={{ fontSize: '2rem', marginBottom: 0 }}>
                    {user.role === 'recruiter' ? 'Recruiter Dashboard' : 'My Applications'}
                </h1>
                <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--primary)', fontWeight: 500, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Users size={18} /> {applications.length} Total
                </div>
            </div>

            {applications.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {user.role === 'recruiter'
                            ? "You haven't received any applications yet."
                            : "You haven't applied to any jobs yet. Start exploring!"}
                    </p>
                </div>
            ) : (
                <div className="grid" style={{ gridTemplateColumns: '1fr' }}>
                    {applications.map(app => (
                        <div key={app._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', animation: 'fadeIn 0.5s ease backwards' }}>

                            <div style={{ flex: '1 1 min-content', minWidth: '250px' }}>
                                <h3 style={{ fontSize: '1.25rem', color: 'white', marginBottom: '0.5rem' }}>{app.job?.title || 'Unknown Job'}</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{app.job?.company}</p>
                                {user.role === 'recruiter' && (
                                    <p style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                        <span style={{ color: 'var(--text-muted)' }}>Applicant:</span> {app.applicant?.name} ({app.applicant?.email})
                                    </p>
                                )}
                            </div>

                            <div style={{ flex: '1 1 250px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <StatusIcon status={app.status} />
                                    <span style={{
                                        textTransform: 'capitalize', fontWeight: 500,
                                        color: app.status === 'accepted' ? '#10b981' :
                                            app.status === 'rejected' ? '#ef4444' :
                                                app.status === 'reviewed' ? '#3b82f6' : '#f59e0b'
                                    }}>
                                        {app.status}
                                    </span>
                                </div>

                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                                    {app.resumeLink && (
                                        <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View Resume</a>
                                    )}
                                    <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {user.role === 'recruiter' && (
                                <div style={{ flex: '0 0 auto', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    {app.status !== 'accepted' && (
                                        <button onClick={() => updateStatus(app._id, 'accepted')} className="btn btn-secondary" style={{ borderColor: '#10b981', color: '#10b981', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Accept</button>
                                    )}
                                    {app.status !== 'rejected' && (
                                        <button onClick={() => updateStatus(app._id, 'rejected')} className="btn btn-secondary" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Reject</button>
                                    )}
                                    {app.status === 'pending' && (
                                        <button onClick={() => updateStatus(app._id, 'reviewed')} className="btn btn-secondary" style={{ borderColor: '#3b82f6', color: '#3b82f6', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>Mark Reviewed</button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
