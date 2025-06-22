import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, DatePicker, message, Typography, Card, Modal, Spin } from 'antd';
import dayjs from 'dayjs'; // Ensure dayjs is installed: npm install dayjs
import './ScheduleMeeting.css';

const { Title, Text } = Typography;
const { TextArea } = Input; // Destructure TextArea from Input

const ScheduleMeeting = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [purpose, setPurpose] = useState(''); // New state for meeting purpose
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true); // New loading state for initial fetch
  const [error, setError] = useState(null); // New error state for initial fetch

  useEffect(() => {
    const fetchCounselorDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the counselor details. This endpoint typically doesn't require auth.
        const response = await fetch(`http://localhost/AI-CAREER-PROJECT/backend/api/get_counselors.php?id=${counselorId}`); // Added ID param for more specific fetch
        const data = await response.json();

        if (!response.ok || !data.success) {
          // If the backend returns an error, use its message, otherwise a generic one
          throw new Error(data.error || 'Failed to fetch counselors');
        }

        // Filter the counselors data by ID, as get_counselors.php might return all
        const counselorData = data.counselors.find((c) => c.id === parseInt(counselorId));

        if (counselorData) {
          setCounselor(counselorData);
        } else {
          throw new Error("Counselor not found");
        }
      } catch (err) {
        console.error("Error fetching counselor details:", err);
        setError(err.message);
        message.error(`Error: ${err.message}`);
        navigate('/counselors'); // Navigate back if counselor not found or error
      } finally {
        setLoading(false);
      }
    };

    fetchCounselorDetails();
  }, [counselorId, navigate]);


  const handleSchedule = () => {
    // Check if purpose is provided
    if (!purpose.trim()) {
      message.warning("Please provide a purpose for the meeting.");
      return;
    }
    if (!selectedDate) {
      message.warning("Please select a date and time for the meeting.");
      return;
    }
    setShowConfirm(true); // Show confirmation popup
  };

  const confirmSchedule = async () => {
    setShowConfirm(false); // Hide confirmation modal immediately

    // --- Retrieve JWT token ---
    const token = localStorage.getItem('token');
    if (!token) {
      message.error("You are not logged in. Please log in to schedule a meeting.");
      // Optionally, redirect to login page
      navigate('/login');
      return;
    }

    // --- Get user ID from localStorage ---
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;

    if (!userId) {
      message.error("Could not retrieve user ID. Please log in again.");
      navigate('/login');
      return;
    }

    try {
      const response = await fetch("http://localhost/AI-CAREER-PROJECT/backend/api/schedule_meeting.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` // --- CRUCIAL: Send the JWT token ---
        },
        body: JSON.stringify({
          user_id: userId, // Use the dynamically retrieved user ID
          counselor_id: counselorId,
          schedule_date: selectedDate.format('YYYY-MM-DD HH:mm:ss'), // Format for database
          purpose: purpose // Send the meeting purpose
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // If the backend returns an error status (e.g., 401, 400, 500)
        throw new Error(data.error || `HTTP error! Status: ${response.status}`);
      }

      if (data.success) {
        message.success("Meeting scheduled successfully!");
        navigate('/counselors'); // Or navigate to a 'my meetings' page
      } else {
        // If backend returns success: false but status 200 (less common but possible)
        throw new Error(data.error || "Failed to schedule meeting.");
      }
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      message.error(`Failed to schedule meeting: ${error.message}`);
    }
  };

  // Function to disable dates in the past
  const disabledDate = (current) => {
    // Can not select days before today
    return current && current < dayjs().startOf('day');
  };

  if (loading) {
    return (
      <div className="schedule-meeting-container loading-state">
        <Spin size="large" tip="Loading counselor details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="schedule-meeting-container error-state">
        <Text type="danger">{error}</Text>
        <Button type="primary" onClick={() => navigate('/counselors')} style={{ marginTop: '20px' }}>
          Back to Counselors
        </Button>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="schedule-meeting-container error-state">
        <Text type="danger">Counselor details could not be loaded.</Text>
        <Button type="primary" onClick={() => navigate('/counselors')} style={{ marginTop: '20px' }}>
          Back to Counselors
        </Button>
      </div>
    );
  }

  return (
    <div className="schedule-meeting-container">
      <Card className="schedule-meeting-card">
        <Title level={3}>Schedule a Meeting with</Title>
        <div className="counselor-info">
          <Text strong>Name: </Text>
          <Text>{counselor.name}</Text>
          <br />
          <Text strong>Specialization: </Text>
          <Text>{counselor.specialization}</Text>
          <br />
        </div>

        <div className="form-section">
          <div className="date-picker-container">
            <Text strong>Select Date and Time:</Text>
            <DatePicker
              showTime={{ format: 'HH:mm' }} // Show time picker with hour and minute
              onChange={(date) => setSelectedDate(date)}
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
              disabledDate={disabledDate} // Disable past dates
              value={selectedDate} // Ensure DatePicker displays current selected date
            />
          </div>

          <div className="purpose-input-container" style={{ marginTop: '20px' }}>
            <Text strong>Meeting Purpose:</Text>
            <TextArea
              rows={4}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Briefly describe the purpose of your meeting..."
            />
          </div>

          <Button
            type="primary"
            onClick={handleSchedule}
            className="schedule-button"
            disabled={!selectedDate || !purpose.trim()} // Disable if no date/time or purpose
          >
            Schedule Meeting
          </Button>
        </div>
      </Card>

      {/* Confirmation Popup */}
      <Modal
        title="Confirm Meeting Schedule"
        open={showConfirm} // Changed 'visible' to 'open'
        onOk={confirmSchedule}
        onCancel={() => setShowConfirm(false)}
        okText="Yes, Schedule"
        cancelText="Cancel"
      >
        <p>Are you sure you want to schedule this meeting?</p>
        <p>
          <strong>Counselor:</strong> {counselor?.name} <br />
          <strong>Date:</strong> {selectedDate ? selectedDate.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'} <br />
          <strong>Purpose:</strong> {purpose || 'No purpose provided'}
        </p>
      </Modal>
    </div>
  );
};

export default ScheduleMeeting;