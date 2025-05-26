import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import all components with direct imports (not lazy for now)
import HomePage from './pages/HomePage'; // CORRECTED: Changed path to './pages/HomePage'
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Counselors from './pages/Counselors';
import ScheduleMeeting from './pages/ScheduleMeeting';
import MessageCounselor from './pages/MessageCounselor';
import AIChat from './pages/AIChat';
import TopCareers from './pages/TopCareers';
import EliteInstitutions from './pages/EliteInstitutions';
import CounselorInbox from './pages/CounselorInbox';

function App() {
  return (
    <Router>
      <Routes>
        {/* Set HomePage as the default landing page */}
        <Route path="/" element={<HomePage />} /> 
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/counselors" element={<Counselors />} />
        <Route path="/schedule-meeting" element={<ScheduleMeeting />} />
        <Route path="/schedule-meeting/:counselorId" element={<ScheduleMeeting />} />
        <Route path="/message-counselor/:counselorId" element={<MessageCounselor />} />
        <Route path="/ask-ai" element={<AIChat />} />
        <Route path="/counselor-inbox" element={<CounselorInbox />} />
        <Route path="/top-careers" element={<TopCareers />} />
        <Route path="/elite-institutions" element={<EliteInstitutions />} />
        
        {/* Catch-all for 404 Not Found pages */}
        <Route path="*" element={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404 - Page Not Found</h1>
            <button onClick={() => window.location.href = '/'}>Return to Home</button>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
