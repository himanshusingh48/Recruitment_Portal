import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, DollarSign, Building } from 'lucide-react';

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const API = import.meta.env.VITE_API_URL;
                const res = await axios.get(`${API}/api/jobs`);
                setJobs(res.data);
            } catch (err) {
                console.error('Error fetching jobs', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    return (
        <div>
            {/* Hero Section */}
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <h1 className="title" style={{ fontSize: '3.5rem', marginBottom: '1.5rem', animationDelay: '0.1s' }}>
                    Find Your Dream Job Today
                </h1>
                <p className="subtitle" style={{ maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.25rem' }}>
                    Explore thousands of job opportunities and take the next step in your career with RecruitPortal.
                </p>
            </div>

            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 600 }}>Latest Opportunities</h2>
                    <span style={{ color: 'var(--text-muted)' }}>{jobs.length} jobs available</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading jobs...</div>
                ) : jobs.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No jobs found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Be the first to post a job on this platform!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {jobs.map(job => (
                            <div key={job._id} className="glass-panel job-card" style={{ animation: 'fadeIn 0.5s ease backwards' }}>
                                <h3 className="job-title">{job.title}</h3>
                                <div className="job-company">
                                    <Building size={16} style={{ display: 'inline', marginRight: '4px' }} />
                                    {job.company}
                                </div>

                                <div className="job-meta">
                                    <div className="job-meta-item">
                                        <MapPin size={16} /> {job.location}
                                    </div>
                                    <div className="job-meta-item">
                                        <DollarSign size={16} /> {job.salary}
                                    </div>
                                </div>

                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {job.description}
                                </p>

                                <div className="job-tags" style={{ marginBottom: '1.5rem' }}>
                                    {job.requirements && job.requirements.slice(0, 3).map((req, i) => (
                                        <span key={i} className="job-tag">{req}</span>
                                    ))}
                                    {job.requirements && job.requirements.length > 3 && (
                                        <span className="job-tag">+{job.requirements.length - 3}</span>
                                    )}
                                </div>

                                <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', textDecoration: 'none' }}>
                                    View Details
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
