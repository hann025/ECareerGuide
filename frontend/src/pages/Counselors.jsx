import React, { useState, useEffect } from 'react';
import { Card, Button, Avatar, Typography, message, Row, Col, Spin, Modal, Form, DatePicker, TimePicker, Input } from 'antd'; // NEW: Modal, Form, DatePicker, TimePicker, Input
import { UserOutlined, MailOutlined, CalendarOutlined, VideoCameraOutlined, ClockCircleOutlined, SendOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // NEW: Import axios for modal form submission
import moment from 'moment'; // NEW: Import moment for date/time handling
import './Counselors.css'; // Your existing CSS

const { Title, Text } = Typography;

const Counselors = () => {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVirtualModalVisible, setIsVirtualModalVisible] = useState(false); // NEW: Modal visibility state
  const [currentCounselor, setCurrentCounselor] = useState(null); // NEW: To store counselor for modal
  const [submittingModal, setSubmittingModal] = useState(false); // NEW: Submitting state for modal
  const [form] = Form.useForm(); // NEW: Form instance for modal

  const navigate = useNavigate();

  const fetchCounselors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("http://localhost/AI-CAREER-PROJECT/backend/api/get_counselors.php");
      
      if (!response.ok) {
        const errorText = await response.text();
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
    fetchCounselors();
    const intervalId = setInterval(fetchCounselors, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Handler for Message button click
  const handleMessageClick = (counselorId) => {
    navigate(`/message-counselor/${counselorId}`);
  };

  // Handler for Schedule button click (for in-person meetings)
  const handleScheduleClick = (counselorId) => {
    navigate(`/schedule-meeting/${counselorId}`);
  };

  // NEW: Handler for Virtual Meeting button click (opens modal)
  const handleVirtualMeetClick = (counselor) => {
    setCurrentCounselor(counselor);
    setIsVirtualModalVisible(true);
  };

  // NEW: Handler for modal form submission
  const handleVirtualModalSubmit = async (values) => {
    setSubmittingModal(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found. Please log in.');
      }

      const scheduleDate = values.date.format('YYYY-MM-DD');
      const scheduleTime = values.time.format('HH:mm:ss');
      const scheduleDateTime = `${scheduleDate} ${scheduleTime}`;

      const payload = {
        counselor_id: currentCounselor.id,
        schedule_date: scheduleDateTime,
        purpose: values.purpose,
        // is_virtual_meet is handled by the virtual_meet.php backend implicitly
      };

      const response = await axios.post(
        'http://localhost/AI-CAREER-PROJECT/backend/api/virtual_meet.php', // Target your VIRTUAL meeting API
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data.success) {
        message.success(response.data.message);
        setIsVirtualModalVisible(false); // Close modal
        form.resetFields(); // Clear form fields
        // NEW: Immediately navigate to the Virtual Meeting Room using the meeting_id!
        // This is the crucial change. We pass the database ID, not the full Google Meet URL.
        navigate(`/virtual-meet/${response.data.meeting_id}`); // <--- CORRECTED LINE
      } else {
        throw new Error(response.data.error || 'Failed to schedule virtual meeting.');
      }
    } catch (err) {
      console.error('Error scheduling virtual meeting:', err);
      message.error(err.message || 'An error occurred while scheduling the virtual meeting.');
      // Optionally redirect to login if authentication fails
      if (err.message.includes('Authentication token') || err.message.includes('Access denied')) {
          navigate('/login');
      }
    } finally {
      setSubmittingModal(false);
    }
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
                  {/* NEW: Virtual Meeting Button - Opens the modal */}
                  <Button type="primary" onClick={() => handleVirtualMeetClick(counselor)}>
                    <VideoCameraOutlined /> Virtual Meeting
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* NEW: Virtual Meeting Scheduling Modal */}
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <VideoCameraOutlined style={{ marginRight: '10px', color: '#a777e3' }} />
            Schedule Virtual Meeting
            {currentCounselor && <p style={{ margin: '5px 0 0', fontSize: '0.9em', color: '#5c2d91' }}>with {currentCounselor.name}</p>}
          </div>
        }
        open={isVirtualModalVisible} 
        onCancel={() => {
          setIsVirtualModalVisible(false);
          form.resetFields(); // Clear form on cancel
        }}
        footer={null} // Custom footer with submit button
        width={500}
        centered
        className="virtual-meeting-modal" // Optional: Add custom class for modal styling
      >
        <Form
          form={form}
          name="virtual_meeting_schedule_form"
          layout="vertical"
          onFinish={handleVirtualModalSubmit}
          initialValues={{
            date: moment(), // Default to today
            time: moment().add(1, 'hour').startOf('hour'), // Default to next hour, rounded
          }}
        >
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: 'Please select a date!' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              size="large"
              format="YYYY-MM-DD"
              disabledDate={current => current && current < moment().startOf('day')} // Disable past dates
              suffixIcon={<CalendarOutlined style={{ color: '#a777e3' }} />}
            />
          </Form.Item>

          <Form.Item
            label="Time"
            name="time"
            rules={[{ required: true, message: 'Please select a time!' }]}
          >
            <TimePicker
              style={{ width: '100%' }}
              size="large"
              format="HH:mm"
              minuteStep={15} // Allow 15-minute intervals
              use12Hours={false} // Use 24-hour format
              suffixIcon={<ClockCircleOutlined style={{ color: '#a777e3' }} />}
            />
          </Form.Item>

          <Form.Item
            label="Purpose of Meeting"
            name="purpose"
            rules={[{ required: true, message: 'Please enter the purpose of the meeting!' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g., Career guidance, academic counseling, personal development"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={submittingModal}
              icon={<SendOutlined />}
              className="schedule-button" // Reuse existing button styles from Counselors.css if applicable
            >
              Schedule Virtual Meeting
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Counselors;
