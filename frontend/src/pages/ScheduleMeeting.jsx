import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Input, Button, DatePicker, message, Typography, Card, Modal } from 'antd';
import dayjs from 'dayjs';
import './ScheduleMeeting.css';

const { Title, Text } = Typography;

const ScheduleMeeting = () => {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Fetch the counselor details using the counselorId
    fetch("http://localhost/AI-CAREER-PROJECT/backend/api/get_counselors.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const counselorData = data.counselors.find((c) => c.id === parseInt(counselorId));
          if (counselorData) {
            setCounselor(counselorData);
          } else {
            message.error("Counselor not found");
            navigate('/counselors');
          }
        } else {
          message.error("Failed to fetch counselors");
        }
      });
  }, [counselorId, navigate]);

  const handleSchedule = () => {
    if (!selectedDate) {
      message.warning("Please select a date and time for the meeting");
      return;
    }
    setShowConfirm(true); // Show confirmation popup
  };

  const confirmSchedule = () => {
    fetch("http://localhost/AI-CAREER-PROJECT/backend/api/schedule_meeting.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_id: 1, // Replace with actual user ID
        counselor_id: counselorId,
        schedule_date: selectedDate.format('YYYY-MM-DD HH:mm:ss')
      })
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          message.success("Meeting scheduled successfully");
          navigate('/counselors');
        } else {
          message.error("Failed to schedule meeting");
        }
      });
  };

  return (
    <div className="schedule-meeting-container">
      <Card className="schedule-meeting-card">
        <Title level={3}>Schedule a Meeting</Title>
        {counselor ? (
          <>
            <Text strong>Name: </Text>
            <Text>{counselor.name}</Text>
            <br />
            <Text strong>Specialization: </Text>
            <Text>{counselor.specialization}</Text>
            <br />
            <div className="date-picker-container">
              <Text strong>Select Date and Time:</Text>
              <DatePicker 
                showTime 
                onChange={(date) => setSelectedDate(date)} 
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
              />
            </div>
            <Button type="primary" onClick={handleSchedule}>Schedule Meeting</Button>
          </>
        ) : (
          <Text>Loading counselor details...</Text>
        )}
      </Card>

      {/* Confirmation Popup */}
      <Modal
        title="Confirm Meeting Schedule"
        visible={showConfirm}
        onOk={confirmSchedule}
        onCancel={() => setShowConfirm(false)}
        okText="Yes, Schedule"
        cancelText="Cancel"
      >
        <p>Are you sure you want to schedule this meeting?</p>
        <p>
          <strong>Counselor:</strong> {counselor?.name} <br />
          <strong>Date:</strong> {selectedDate ? selectedDate.format('YYYY-MM-DD HH:mm:ss') : 'Not selected'}
        </p>
      </Modal>
    </div>
  );
};

export default ScheduleMeeting;
