import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Button } from 'antd';

// Import all components from the './pages/' directory
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Counselors from './pages/Counselors';
import ScheduleMeeting from './pages/ScheduleMeeting'; // This will remain for IN-PERSON
import MessageCounselor from './pages/MessageCounselor';
import AIChat from './pages/AIChat';
import TopCareers from './pages/TopCareers';
import EliteInstitutions from './pages/EliteInstitutions';
import CounselorInbox from './pages/CounselorInbox';
import UserProfilePage from './pages/UserProfilePage';
import LearningJourneyPage from './pages/LearningJourneyPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import DocumentOptimizer from './pages/DocumentOptimizer';
import VirtualMeetPage from './pages/VirtualMeetPage'; // The actual video call page
// ScheduleVirtualMeetingForm is no longer directly used for navigation in this simplified Google Meet flow
// import ScheduleVirtualMeetingForm from './pages/ScheduleVirtualMeetingForm'; 

// Helper function to check if the user is a counselor
const isCounselor = () => {
    try {
        const user = JSON.parse(localStorage.getItem('counselor'));
        // A user is considered a counselor if 'counselor' item exists and has role 'counselor'
        return user && user.role === 'counselor';
    } catch (e) {
        // Handle parsing errors gracefully
        console.error("Error parsing counselor data from localStorage:", e);
        return false;
    }
};

// A simple PrivateRoute component to protect routes and differentiate roles
const PrivateRoute = ({ children, requiredRole = 'user' }) => {
    const isAuthenticated = localStorage.getItem('token');
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const currentUserRole = isCounselor() ? 'counselor' : 'user';

    // If the route specifically requires a 'counselor' role
    if (requiredRole === 'counselor' && currentUserRole !== 'counselor') {
        return <Navigate to="/dashboard" replace />;
    }
    // If the route specifically requires a 'user' role (student)
    if (requiredRole === 'user' && currentUserRole !== 'user') {
        return <Navigate to="/counselor-inbox" replace />;
    }
    
    // For VirtualMeetPage, if requiredRole is not explicitly 'user' or 'counselor',
    // it means any authenticated user can access it.
    if (requiredRole === false && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes (accessible without login) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected Routes for Students (require authentication and non-counselor role) */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute requiredRole="user">
                            <Dashboard />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/counselors"
                    element={
                        <PrivateRoute requiredRole="user">
                            <Counselors />
                        </PrivateRoute>
                    }
                />
                {/* Route for scheduling IN-PERSON meetings with a counselor ID */}
                <Route
                    path="/schedule-meeting/:counselorId"
                    element={
                        <PrivateRoute requiredRole="user">
                            <ScheduleMeeting /> {/* This is now ONLY for in-person scheduling */}
                        </PrivateRoute>
                    }
                />
                {/* Route for scheduling IN-PERSON meetings without a pre-selected counselor (if applicable) */}
                <Route
                    path="/schedule-meeting"
                    element={
                        <PrivateRoute requiredRole="user">
                            <ScheduleMeeting /> {/* This is now ONLY for in-person scheduling */}
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/message-counselor/:counselorId"
                    element={
                        <PrivateRoute requiredRole="user">
                            <MessageCounselor />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/ai-chat"
                    element={
                        <PrivateRoute requiredRole="user">
                            <AIChat />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/top-careers"
                    element={
                        <PrivateRoute requiredRole="user">
                            <TopCareers />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/elite-institutions"
                    element={
                        <PrivateRoute requiredRole="user">
                            <EliteInstitutions />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <PrivateRoute requiredRole="user">
                            <UserProfilePage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/learning-journey"
                    element={
                        <PrivateRoute requiredRole="user">
                            <LearningJourneyPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/resume-builder"
                    element={
                        <PrivateRoute requiredRole="user">
                            <ResumeBuilderPage />
                        </PrivateRoute>
                    }
                />
                <Route
                    path="/document-optimizer"
                    element={
                        <PrivateRoute requiredRole="user">
                            <DocumentOptimizer />
                        </PrivateRoute>
                    }
                />

                {/* Protected Routes for Counselors (require authentication and counselor role) */}
                <Route
                    path="/counselor-inbox"
                    element={
                        <PrivateRoute requiredRole="counselor">
                            <CounselorInbox />
                        </PrivateRoute>
                    }
                />

                {/* Removed: ScheduleVirtualMeetingForm route is no longer directly navigated to
                    as the modal handles virtual meeting scheduling directly from Counselors page.
                <Route
                    path="/schedule-virtual-meeting/:counselorId"
                    element={
                        <PrivateRoute requiredRole="user">
                            <ScheduleVirtualMeetingForm />
                        </PrivateRoute>
                    }
                />
                */}

                {/* NEW: Protected Route for the actual Virtual Meeting ROOM (Google Meet Redirect Page) */}
                {/* This is the route that VirtualMeetPage.jsx component handles.
                    It MUST use :meetingId to correctly capture the database ID from the URL. */}
                <Route
                    path="/virtual-meet/:meetingId" // CORRECTED: Changed from :meetingLink to :meetingId
                    element={
                        <PrivateRoute requiredRole={false}> {/* Accessible to any authenticated user/counselor */}
                            <VirtualMeetPage />
                        </PrivateRoute>
                    }
                />

                {/* Catch-all for 404 Not Found pages */}
                <Route path="*" element={
                    <div style={{ padding: '2rem', textAlign: 'center', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #f6e8ff, #f3d8ff)' }}>
                        <h1>404 - Page Not Found</h1>
                        <p>The page you are looking for does not exist.</p>
                        <Button type="primary" onClick={() => window.location.href = '/'}>Return to Home</Button>
                    </div>
                } />
            </Routes>
        </Router>
    );
}

export default App;
