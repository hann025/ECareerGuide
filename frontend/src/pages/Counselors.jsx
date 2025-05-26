import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Typography, message, Row, Col, Spin } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './Counselors.css';

const { Title, Text } = Typography;

const Counselors = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      setError(null); // Clear previous errors
      const response = await fetch("http://localhost/AI-CAREER-PROJECT/backend/api/get_counselors.php");
      
      if (!response.ok) {
        const errorText = await response.text(); // Get raw error response for debugging
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();

      if (data.success) {
        setCounselors(data.counselors);
      } else {
        throw new Error(data.error || "Failed to load counselors.");
      }
    } catch (err) {
      console.error("Error fetching counselors:", err);
      setError(err.message);
      message.error(`Error loading counselors: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchCounselors();

    // Set up polling to refresh counselors every 1 minute
    const intervalId = setInterval(fetchCounselors, 60000); // Poll every 1 minute

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  // Handler for Message button click
  const handleMessageClick = (counselorId) => {
    console.log(`Navigating to message counselor: ${counselorId}`); // ADDED FOR DEBUGGING
    navigate(`/message-counselor/${counselorId}`);
  };

  // Handler for Schedule button click
  const handleScheduleClick = (counselorId) => {
    console.log(`Navigating to schedule meeting: ${counselorId}`); // ADDED FOR DEBUGGING
    navigate(`/schedule-meeting/${counselorId}`);
  };

  if (loading) {
    return (
      <div className="counselors-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" tip="Loading counselors..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="counselors-container" style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4} type="danger">Error: {error}</Title>
        <Button type="primary" onClick={fetchCounselors}>Retry Load</Button>
      </div>
    );
  }

  return (
    <div className="counselors-container">
      <Title level={3} style={{ textAlign: 'center', marginBottom: '30px', color: '#5c2d91' }}>Our Expert Counselors</Title>
      <Row gutter={[24, 24]} justify="center">
        {counselors.length === 0 ? (
          <Col span={24} style={{ textAlign: 'center' }}>
            <Text type="secondary">No counselors available at the moment. Please check back later!</Text>
          </Col>
        ) : (
          counselors.map((counselor) => (
            <Col xs={24} sm={12} md={8} lg={6} key={counselor.id}>
              <Card className="counselor-card">
                <Avatar
                  size={64}
                  src={counselor.image && (counselor.image.startsWith('http://') || counselor.image.startsWith('https://'))
                    ? counselor.image
                    : (counselor.image ? `http://localhost/AI-CAREER-PROJECT/backend/uploads/${counselor.image}` : null)
                  }
                  icon={!counselor.image && <UserOutlined />}
                  alt={counselor.name}
                />
                <Title level={4}>{counselor.name}</Title>
                <Text strong>{counselor.specialization}</Text>
                <Text type="secondary">Experience: {counselor.experience} years</Text>
                <Text type="secondary">Rating: {counselor.rating || 'N/A'}/5</Text>
                <Text type="secondary">Availability: {counselor.availability}</Text>
                <div className="action-buttons">
                  <Button type="primary" onClick={() => handleMessageClick(counselor.id)}>
                    <MailOutlined /> Message
                  </Button>
                  <Button type="primary" onClick={() => handleScheduleClick(counselor.id)}>
                    <CalendarOutlined /> Schedule
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </div>
  );
};

export default Counselors;
