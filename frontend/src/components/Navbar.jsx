import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { Briefcase, LogOut, User as UserIcon, Moon, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { isDark, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand brand-logo" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ background: 'var(--primary)', color: '#fff', padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Briefcase size={20} />
                </div>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                    RecruitPortal <span className="gradient-text">AI</span>
                </span>
            </Link>

            <div className="navbar-links">
                <Link to="/" className="nav-link">Jobs</Link>
                {user ? (
                    <>
                        {user.role === 'recruiter' ? (
                            <>
                                <Link to="/dashboard" className="nav-link">Applications</Link>
                                <Link to="/recruiter/applications" className="nav-link">Dashboard</Link>
                                <Link to="/create-job" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                                    Post Job
                                </Link>
                            </>
                        ) : (
                            <Link to="/dashboard" className="nav-link">Dashboard</Link>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--glass-border)' }}>

                            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 500 }}>
                                <UserIcon size={16} /> {user.name}
                            </Link>
                            <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Sign Up</Link>
                    </>
                )}
                <button
                    onClick={toggleTheme}
                    className="theme-toggle-btn"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle dark mode"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
