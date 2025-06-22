import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Avatar, Modal, Input, message, Spin, Typography, Card, Row, Col, Statistic, List } from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  MailOutlined,
  ScheduleOutlined, // Added ScheduleOutlined for meetings
} from '@ant-design/icons';
import dayjs from 'dayjs'; // Import dayjs for date formatting
import './CounselorInbox.css'; // Assuming you have a CounselorInbox.css for styling

const { Text, Title } = Typography;
const { TextArea } = Input;

const CounselorInbox = () => {
  const [messages, setMessages] = useState([]);
  const [scheduledMeetings, setScheduledMeetings] = useState([]); // State for scheduled meetings
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [counselorId, setCounselorId] = useState(null); // State to store logged-in counselor's ID
  const [currentlyActiveStudents, setCurrentlyActiveStudents] = useState(0);
  const [dailyActiveStudents, setDailyActiveStudents] = useState(0);

  useEffect(() => {
    const counselorUser = JSON.parse(localStorage.getItem('counselor') || '{}');
    if (counselorUser.id) {
      setCounselorId(counselorUser.id);
    } else {
      setError('Counselor not authenticated. Please log in as a counselor to view messages.');
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      if (!counselorUser.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null); // Clear previous errors

      const token = localStorage.getItem('token'); // Get the JWT token

      try {
        // --- Fetch messages ---
        const messagesResponse = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/get_messages.php?is_counselor_inbox=true&counselor_logged_in_id=${counselorUser.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}` // Include Authorization header
            }
          }
        );

        if (!messagesResponse.ok) {
          const errorText = await messagesResponse.text();
          throw new Error(`HTTP error fetching messages! Status: ${messagesResponse.status}, Message: ${errorText}`);
        }
        const messagesData = await messagesResponse.json();
        if (messagesData.success) {
          setMessages(messagesData.messages || []);
        } else {
          throw new Error(messagesData.error || 'Failed to load messages');
        }

        // --- Fetch student activity counts ---
        const activityResponse = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/student_activity.php`,
          {
            headers: {
              'Authorization': `Bearer ${token}` // Include Authorization header
            }
          }
        );

        if (!activityResponse.ok) {
          const errorText = await activityResponse.text();
          throw new Error(`HTTP error fetching activity! Status: ${activityResponse.status}, Message: ${errorText}`);
        }
        const activityData = await activityResponse.json();
        if (activityData.success) {
          setCurrentlyActiveStudents(activityData.currently_active_students);
          setDailyActiveStudents(activityData.daily_active_students);
        } else {
          throw new Error(activityData.error || 'Failed to load student activity data');
        }

        // --- Fetch scheduled meetings for this counselor ---
        const meetingsResponse = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/get_counselor_meetings.php`, // New API endpoint
          {
            headers: {
              'Authorization': `Bearer ${token}` // Include Authorization header
            }
          }
        );

        if (!meetingsResponse.ok) {
          const errorText = await meetingsResponse.text();
          throw new Error(`HTTP error fetching scheduled meetings! Status: ${meetingsResponse.status}, Message: ${errorText}`);
        }
        const meetingsData = await meetingsResponse.json();
        if (meetingsData.success) {
          // Filter out past meetings
          const upcomingMeetings = meetingsData.meetings.filter(meeting => {
            const meetingDateTime = dayjs(`${meeting.schedule_date} ${meeting.schedule_time}`);
            return meetingDateTime.isAfter(dayjs()); // Only show meetings in the future
          });
          setScheduledMeetings(upcomingMeetings || []);
        } else {
          throw new Error(meetingsData.error || 'Failed to load scheduled meetings');
        }


      } catch (error) {
        console.error('Error fetching data for inbox:', error);
        setError(error.message);
        message.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (counselorId) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 30000); // Refresh all data every 30 seconds
      return () => clearInterval(interval);
    }
  }, [counselorId]); // Re-run effect if counselorId changes

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) {
      message.warning("Reply cannot be empty.");
      return;
    }

    const counselorUser = JSON.parse(localStorage.getItem('counselor') || '{}');
    const token = localStorage.getItem('token');

    if (!counselorUser.id || !token) {
      message.error("Authentication error: Counselor ID or token missing.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/AI-CAREER-PROJECT/backend/api/send_reply.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            message_id: selectedMessage.id,
            counselor_id: counselorUser.id,
            reply: replyText
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response not OK:', errorData);
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (data.success) {
        message.success(data.message);

        // Update local state to reflect the reply - CORRECTED LINE HERE
        setMessages(prev => prev.map(msg =>
          msg.id === selectedMessage.id
            ? { ...msg, status: 'replied', reply: replyText, replied_at: data.replied_at }
            : msg
        ));

        setSelectedMessage(null); // Close modal
        setReplyText(''); // Clear reply text
      } else {
        throw new Error(data.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      message.error(`Failed to send reply: ${error.message}`);
    }
  };

  // Helper to format date and time
  const formatDateTime = (date, time) => {
    if (!date && !time) return 'N/A';
    // If only date is provided (e.g., for created_at timestamps), use dayjs directly
    if (date && !time) return dayjs(date).format('YYYY-MM-DD HH:mm');
    // If both date and time are provided (e.g., for schedule_date/time)
    return dayjs(`${date} ${time}`).format('YYYY-MM-DD HH:mm');
  };

  const formatLastActivity = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = dayjs(timestamp);
    const now = dayjs();
    const today = now.startOf('day');
    const activityDate = date.startOf('day');

    if (activityDate.isSame(today, 'day')) {
      return `Today, ${date.format('HH:mm')}`;
    }
    return date.format('YYYY-MM-DD HH:mm');
  };


  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading inbox data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <Text type="danger">{error}</Text>
        <Button style={{ marginTop: '10px' }} onClick={() => window.location.reload()}>Reload</Button>
      </div>
    );
  }

  return (
    <div className="counselor-inbox-container">
      <Title level={2}>Your Counselor Inbox</Title>

      {/* Student Activity Cards */}
      <Row gutter={[16, 16]} style={{ width: '100%', marginBottom: '20px', justifyContent: 'center' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card className="activity-card">
            <Statistic
              title="Currently Active Students (5 mins)"
              value={currentlyActiveStudents}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card className="activity-card">
            <Statistic
              title="Daily Active Students (Today)"
              value={dailyActiveStudents}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#0050b3' }}
            />
          </Card>
        </Col>
      </Row>

      ---

      {/* NEW: Scheduled Meetings Card */}
      <Card
        title={<><ScheduleOutlined /> Upcoming Scheduled Meetings</>}
        className="inbox-card"
        style={{ marginBottom: '20px' }}
      >
        {scheduledMeetings.length === 0 ? (
          <Text type="secondary">No upcoming scheduled meetings at the moment.</Text>
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={scheduledMeetings}
            renderItem={item => (
              <List.Item
                // You could add actions here, like "Cancel Meeting" or "Reschedule"
                // actions={[<Button type="link">View Details</Button>]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Text strong>
                      Meeting with {item.student_name || item.user_email} on {item.schedule_date} at {item.schedule_time}
                    </Text>
                  }
                  description={
                    <>
                      <Text type="secondary">Purpose: {item.purpose || 'Not specified'}</Text>
                      <br />
                      <Text type="secondary">Scheduled At: {formatDateTime(item.created_at)}</Text> {/* Using created_at for when it was scheduled */}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      ---

      {/* Existing Messages Table */}
      <Card title={<><MessageOutlined /> Student Messages</>} className="inbox-card">
        <Table
          columns={[
            {
              title: 'Student',
              dataIndex: 'student_name',
              key: 'student',
              render: (text, record) => (
                <div className="student-cell">
                  <Avatar icon={<UserOutlined />} />
                  <span>{text}</span>
                </div>
              )
            },
            {
              title: 'Email',
              dataIndex: 'student_email',
              key: 'student_email',
              render: (text) => <Text>{text}</Text>,
            },
            {
              title: 'Last Active',
              dataIndex: 'last_activity_at',
              key: 'last_activity_at',
              render: (text) => <Text type="secondary">{formatLastActivity(text)}</Text>,
            },
            {
              title: 'Message',
              dataIndex: 'message',
              key: 'message',
              render: (text, record) => (
                <div>
                  <p>{text}</p>
                  {record.reply && (
                    <div className="reply-bubble">
                      <Text strong>Your reply: </Text>
                      <Text>{record.reply}</Text>
                      {record.replied_at && (
                        <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                          Replied at: {formatDateTime(record.replied_at)}
                        </Text>
                      )}
                    </div>
                  )}
                </div>
              )
            },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: status => (
                <Tag color={status === 'unread' ? 'red' : status === 'replied' ? 'green' : 'blue'}>
                  {status.toUpperCase()}
                </Tag>
              )
            },
            {
              title: 'Action',
              key: 'action',
              render: (_, record) => (
                <Button
                  type={record.status === 'replied' ? 'default' : 'primary'}
                  icon={<MessageOutlined />}
                  onClick={() => setSelectedMessage(record)}
                  disabled={record.status === 'replied'}
                >
                  {record.status === 'replied' ? 'Replied' : 'Reply'}
                </Button>
              )
            }
          ]}
          dataSource={messages}
          rowKey="id"
          className="messages-table"
        />
      </Card>

      <Modal
        title={`Reply to ${selectedMessage?.student_name} (${selectedMessage?.student_email})`}
        open={!!selectedMessage}
        onCancel={() => setSelectedMessage(null)}
        footer={[
          <Button key="cancel" onClick={() => setSelectedMessage(null)}>
            Cancel
          </Button>,
          <Button
            key="send"
            type="primary"
            onClick={handleReply}
            disabled={!replyText.trim()}
          >
            Send Reply
          </Button>
        ]}
      >
        <div className="original-message">
          <h4>Original Message:</h4>
          <p>{selectedMessage?.message}</p>
        </div>
        <TextArea
          rows={4}
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your response..."
          className="reply-textarea"
        />
      </Modal>
    </div>
  );
};

export default CounselorInbox;