import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapPin, DollarSign, Building, Calendar, Search, Zap, Cpu, Bell, Code, Briefcase, TrendingUp, MonitorSmartphone } from 'lucide-react';

// Helper: days remaining until closing date
const getDaysRemaining = (closingDate) => {
    const now = new Date();
    const close = new Date(closingDate);
    const diff = Math.ceil((close - now) / (1000 * 60 * 60 * 24));
    return diff;
};

const ClosingBadge = ({ closingDate }) => {
    if (!closingDate) return null;
    const days = getDaysRemaining(closingDate);
    const dateStr = new Date(closingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    let color = '#10b981';
    let bg = 'rgba(16,185,129,0.1)';
    let border = '#10b981';
    let label = `Closes ${dateStr} (${days}d left)`;

    if (days <= 3) {
        color = '#ef4444'; bg = 'rgba(239,68,68,0.1)'; border = '#ef4444';
        label = `Closes ${dateStr} — Only ${days}d left!`;
    } else if (days <= 7) {
        color = '#f59e0b'; bg = 'rgba(245,158,11,0.1)'; border = '#f59e0b';
        label = `Closes ${dateStr} (${days}d left)`;
    }

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: bg, color, border: `1px solid ${border}`,
            padding: '0.25rem 0.6rem', borderRadius: '6px',
            fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem'
        }}>
            <Calendar size={12} /> {label}
        </div>
    );
};

const Home = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [locationTerm, setLocationTerm] = useState('');

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

    const filteredJobs = jobs.filter(job => {
        const matchTitle = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchLocation = job.location.toLowerCase().includes(locationTerm.toLowerCase());
        return matchTitle && matchLocation;
    });

    return (
        <div>
            {/* HERO SECTION */}
            <div style={{
                padding: '6rem 2rem',
                textAlign: 'center',
                background: 'linear-gradient(to bottom, rgba(99,102,241,0.05), transparent)',
                borderBottom: '1px solid var(--glass-border)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
                    width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
                    zIndex: -1, borderRadius: '50%'
                }} />

                <h1 className="title" style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                    Find Your <span className="gradient-text">Dream Job</span> Today
                </h1>
                <p className="subtitle" style={{ maxWidth: '650px', margin: '0 auto 3rem', fontSize: '1.2rem', color: 'var(--text-muted)' }}>
                    Discover thousands of highly-paying opportunities. AI-powered matching ensures you land the perfect role faster than ever.
                </p>

                {/* Search Bar */}
                <div className="glass-panel" style={{
                    maxWidth: '800px', margin: '0 auto 3rem', padding: '0.75rem',
                    display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center'
                }}>
                    <div style={{ flex: '1 1 250px', position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Job title, keyword, or company..."
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', border: 'none', background: 'rgba(9,30,66,0.03)' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div style={{ width: '1px', height: '30px', background: 'var(--glass-border)', display: 'block' }} className="d-none-mobile"></div>
                    <div style={{ flex: '1 1 200px', position: 'relative' }}>
                        <MapPin size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="City, state, or Remote"
                            className="form-input"
                            style={{ paddingLeft: '2.75rem', border: 'none', background: 'rgba(9,30,66,0.03)' }}
                            value={locationTerm}
                            onChange={(e) => setLocationTerm(e.target.value)}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        style={{ flex: '0 0 auto', padding: '0.85rem 2rem' }}
                        onClick={() => {
                            document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    >
                        Find Jobs
                    </button>
                </div>

                {/* Hero Buttons */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                        className="btn btn-primary"
                        onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Browse All Jobs
                    </button>
                    <Link to="/create-job" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
                        Post a Job Instead
                    </Link>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="container" style={{ padding: '5rem 1rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Why Choose RecruitPortal AI?</h2>
                    <p style={{ color: 'var(--text-muted)' }}>The smartest way to accelerate your career growth.</p>
                </div>
                <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
                    {[
                        { title: 'Fast Job Search', icon: <Zap size={24} color="#f59e0b" />, desc: 'Lightning-fast search algorithms to find irrelevant jobs instantly.' },
                        { title: 'AI Resume Matching', icon: <Cpu size={24} color="#6366f1" />, desc: 'Our AI analyzes your skills and matches you with the highest-fit roles.' },
                        { title: 'Top Companies', icon: <Briefcase size={24} color="#10b981" />, desc: 'Access exclusive job listings from Fortune 500 companies and top startups.' },
                        { title: 'Instant Job Alerts', icon: <Bell size={24} color="#ef4444" />, desc: 'Never miss an opportunity. Get notified the second your dream job is posted.' }
                    ].map((feature, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '2rem', textAlign: 'center', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.05)' }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--glass-shadow)' }}
                        >
                            <div style={{ background: 'var(--bg-main)', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--glass-border)' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* JOB CATEGORIES SECTION */}
            <div style={{ background: 'rgba(9,30,66,0.02)', padding: '5rem 1rem', borderTop: '1px solid var(--glass-border)', borderBottom: '1px solid var(--glass-border)' }}>
                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.2rem' }}>Popular Categories</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Explore roles across high-demand industries</p>
                        </div>
                        <button className="btn btn-secondary" onClick={() => document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' })}>
                            See All Categories
                        </button>
                    </div>

                    <div className="grid grid-cols-4" style={{ gap: '1rem' }}>
                        {[
                            { title: 'IT & Software', icon: <Code size={20} />, count: '1,200+' },
                            { title: 'Marketing', icon: <TrendingUp size={20} />, count: '850+' },
                            { title: 'Finance', icon: <DollarSign size={20} />, count: '430+' },
                            { title: 'Remote Work', icon: <MonitorSmartphone size={20} />, count: '2,100+' }
                        ].map((cat, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', transition: 'all 0.2s ease' }}
                                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                                onClick={() => { setSearchTerm(''); setLocationTerm(cat.title === 'Remote Work' ? 'Remote' : ''); document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' }) }}
                            >
                                <div style={{ color: 'var(--primary)', background: 'rgba(99,102,241,0.1)', padding: '0.6rem', borderRadius: '10px' }}>
                                    {cat.icon}
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.1rem' }}>{cat.title}</h4>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.count} jobs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* JOBS SECTION */}
            <div id="jobs-section" className="container" style={{ padding: '5rem 1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>
                        {searchTerm || locationTerm ? 'Search Results' : 'Latest Opportunities'}
                    </h2>
                    <span style={{ color: 'var(--text-muted)', background: 'var(--glass-bg)', padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.85rem' }}>
                        {filteredJobs.length} jobs available
                    </span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div className="loading-spinner" style={{ margin: '0 auto 1rem' }} /> Loading jobs...
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="glass-panel" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
                        <Briefcase size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No jobs found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters.</p>
                        {(searchTerm || locationTerm) && (
                            <button className="btn btn-secondary" style={{ marginTop: '1.5rem' }} onClick={() => { setSearchTerm(''); setLocationTerm(''); }}>
                                Clear Search
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-3">
                        {filteredJobs.map((job, idx) => {
                            const days = job.closingDate ? getDaysRemaining(job.closingDate) : null;
                            const isUrgent = days !== null && days <= 3;
                            return (
                                <div
                                    key={job._id}
                                    className="glass-panel job-card"
                                    style={{
                                        animation: `fadeIn 0.5s ease ${idx * 0.05}s backwards`,
                                        borderLeft: isUrgent ? '3px solid #ef4444' : undefined,
                                        display: 'flex', flexDirection: 'column'
                                    }}
                                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--primary)' }}
                                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; if (isUrgent) e.currentTarget.style.borderLeft = '3px solid #ef4444'; }}
                                >
                                    {job.closingDate && <ClosingBadge closingDate={job.closingDate} />}

                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{job.title}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>
                                        <Building size={16} /> {job.company}
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <MapPin size={14} /> {job.location}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <DollarSign size={14} /> {job.salary}
                                        </div>
                                    </div>

                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {job.description}
                                    </p>

                                    {job.requirements && job.requirements.length > 0 && (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                                            {job.requirements.slice(0, 3).map((req, i) => (
                                                <span key={i} className="job-tag">{req}</span>
                                            ))}
                                            {job.requirements.length > 3 && (
                                                <span className="job-tag">+{job.requirements.length - 3}</span>
                                            )}
                                        </div>
                                    )}

                                    <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', textDecoration: 'none' }}>
                                        View Details
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;
