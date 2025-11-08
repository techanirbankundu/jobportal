import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import JobList from './pages/JobList';
import JobDetails from './pages/JobDetails';
import RelevantJobs from './pages/RelevantJobs';
import CreateJob from './pages/CreateJob';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import Messages from './pages/Messages';
import ComingSoon from './pages/ComingSoon';
import ATSChecker from './pages/ATSChecker';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route
              path="/jobs/relevant"
              element={
                <ProtectedRoute>
                  <RelevantJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/create"
              element={
                <ProtectedRoute requireRole="recruiter">
                  <CreateJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/applications"
              element={
                <ProtectedRoute requireRole="recruiter">
                  <Applications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ComingSoon 
                  title="Notifications" 
                  description="We're building a notification system to keep you updated on job applications, messages, and more!" 
                />
              }
            />
            <Route
              path="/companies"
              element={
                <ComingSoon 
                  title="Companies" 
                  description="Browse company profiles and learn about their culture, benefits, and open positions!" 
                />
              }
            />
            <Route
              path="/ats-checker"
              element={
                <ProtectedRoute>
                  <ATSChecker />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
