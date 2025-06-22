import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, DatePicker, TimePicker, Typography, message, Spin, Avatar } from 'antd';
import { UserOutlined, CalendarOutlined, ClockCircleOutlined, SendOutlined, VideoCameraOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import './ScheduleMeeting.css'; // Reuse existing CSS for form styling

const { Title, Text } = Typography;

const ScheduleVirtualMeetingForm = () => {
    const { counselorId } = useParams(); // Get counselorId from URL
    const navigate = useNavigate();
    const [counselor, setCounselor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchCounselorDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`http://localhost/AI-CAREER-PROJECT/backend/api/get_counselors.php?id=${counselorId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.success && data.counselors && data.counselors.length > 0) {
                    setCounselor(data.counselors[0]);
                } else {
                    throw new Error(data.error || "Counselor not found.");
                }
            } catch (err) {
                console.error("Error fetching counselor details:", err);
                setError(err.message);
                message.error(`Failed to load counselor: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (counselorId) {
            fetchCounselorDetails();
        } else {
            setError("Counselor ID is missing. Cannot schedule a meeting.");
            setLoading(false);
        }
    }, [counselorId]);

    const onFinish = async (values) => {
        setSubmitting(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication token not found. Please log in.');
            }

            // Format date and time for backend (YYYY-MM-DD HH:mm:ss)
            const scheduleDate = values.date.format('YYYY-MM-DD');
            const scheduleTime = values.time.format('HH:mm:ss');
            const scheduleDateTime = `${scheduleDate} ${scheduleTime}`;

            const payload = {
                counselor_id: counselor.id, // Ensure counselor.id is used
                student_email: localStorage.getItem('userEmail'), // Assuming user email is stored here
                schedule_date: scheduleDateTime,
                purpose: values.purpose,
                is_virtual_meet: true // Explicitly set to true for this API
            };

            const response = await axios.post(
                'http://localhost/AI-CAREER-PROJECT/backend/api/virtual_meet.php', // Target the VIRTUAL meeting API
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
                form.resetFields();
                // After successful scheduling, navigate to a confirmation page or dashboard
                navigate('/dashboard'); // Or '/meetings' to view scheduled meetings
            } else {
                throw new Error(response.data.error || 'Failed to schedule virtual meeting.');
            }
        } catch (err) {
            console.error('Error scheduling virtual meeting:', err);
            message.error(err.message || 'An error occurred while scheduling the virtual meeting.');
            setError(err.message);
            // Redirect to login if authentication fails
            if (err.message.includes('Authentication token') || err.message.includes('Access denied')) {
                navigate('/login');
            }
        } finally {
            setSubmitting(false);
        }
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
                <Card className="schedule-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
                    <Title level={4} type="danger">Error: {error}</Title>
                    <Button type="primary" onClick={() => navigate('/counselors')}>Back to Counselors</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="schedule-meeting-container">
            <div className="bubbles-background"></div>
            <Card className="schedule-card">
                <div className="schedule-header">
                    <Avatar
                        size={64}
                        src={counselor.image && (counselor.image.startsWith('http://') || counselor.image.startsWith('https://'))
                            ? counselor.image
                            : (counselor.image ? `http://localhost/AI-CAREER-PROJECT/backend/uploads/${counselor.image}` : null)
                        }
                        icon={!counselor.image && <UserOutlined />}
                        alt={counselor.name}
                        className="counselor-avatar"
                    />
                    <Title level={4} style={{ color: 'white', margin: 0 }}>Schedule Virtual Meeting with</Title>
                    <Text strong style={{ color: 'white', fontSize: '1.2em' }}>{counselor.name}</Text>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9em' }}>{counselor.specialization}</Text>
                </div>

                <div className="schedule-form-content">
                    <Form
                        form={form}
                        name="schedule_virtual_meeting"
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{
                            date: moment(), // Default to today
                            time: moment(), // Default to current time
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
                                loading={submitting}
                                icon={<VideoCameraOutlined />}
                                className="schedule-button" // Apply existing button styles
                            >
                                Schedule Virtual Meeting
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default ScheduleVirtualMeetingForm;