import React, { useState, useEffect } from 'react';
import { Table, Tag, Button, Avatar, Modal, Input, message, Spin, Typography } from 'antd';
import { MessageOutlined, UserOutlined } from '@ant-design/icons';
import './CounselorInbox.css'; // Assuming you have a CounselorInbox.css for styling

const { Text } = Typography;

const CounselorInbox = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // State to handle errors
  const [counselorId, setCounselorId] = useState(null); // State to store logged-in counselor's ID

  useEffect(() => {
    // Get logged-in counselor ID from local storage
    // IMPORTANT: Ensure your counselor login process stores the counselor ID in localStorage
    const counselorUser = JSON.parse(localStorage.getItem('counselor') || '{}');
    if (counselorUser.id) {
      setCounselorId(counselorUser.id);
    } else {
      setError('Counselor not authenticated. Please log in as a counselor to view messages.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      if (!counselorUser.id) { // Ensure counselor ID is available before fetching
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null); // Clear previous errors

        // Fetch messages specifically for the logged-in counselor's inbox
        const response = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/get_messages.php?is_counselor_inbox=true&counselor_logged_in_id=${counselorUser.id}`
        );

        if (!response.ok) {
          const errorData = await response.text(); // Get response text for debugging
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
        }

        const data = await response.json();
        console.log('Fetched messages for inbox:', data); // Log the fetched data

        if (data.success) {
          setMessages(data.messages || []);
        } else {
          throw new Error(data.error || 'Failed to load messages');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setError(error.message); // Set error state
        message.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if counselorId is set
    if (counselorId) {
      fetchData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [counselorId]); // Re-run effect if counselorId changes

  const handleReply = async () => {
    if (!replyText.trim() || !selectedMessage) {
      message.warning("Reply cannot be empty.");
      return;
    }

    try {
      const response = await fetch(
        "http://localhost/AI-CAREER-PROJECT/backend/api/send_reply.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message_id: selectedMessage.id,
            counselor_id: selectedMessage.counselor_id, // This should be the ID of the counselor making the reply
            reply: replyText
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response not OK:', errorData);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.substring(0, 200)}...`);
      }

      const data = await response.json();

      if (data.success) {
        message.success(data.message);

        // Update local state to reflect the reply
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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading messages..." />
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
      <h2>Your Messages</h2>
      <Table
        columns={[
          {
            title: 'Student',
            dataIndex: 'student_name',
            key: 'student',
            render: (text, record) => (
              <div className="student-cell">
                {/* Assuming student_photo is a URL or a file path that needs prefixing */}
                <Avatar src={record.student_photo ? `http://localhost/AI-CAREER-PROJECT/backend/uploads/${record.student_photo}` : null} icon={<UserOutlined />} />
                <span>{text}</span>
              </div>
            )
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
                        Replied at: {new Date(record.replied_at).toLocaleString()}
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

      <Modal
        title={`Reply to ${selectedMessage?.student_name}`}
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
        <Input.TextArea
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
