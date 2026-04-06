import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import CreateJob from './pages/CreateJob';
import JobDetails from './pages/JobDetails';
import Dashboard from './pages/Dashboard';
import EditJob from './pages/EditJob';
import Profile from './pages/Profile';
import RecruiterApplications from './pages/RecruiterApplications';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/create-job" element={<CreateJob />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-job/:id" element={<EditJob />} />
              <Route path="/recruiter/applications" element={<RecruiterApplications />} />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
