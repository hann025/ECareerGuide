import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Input, Button, message, Avatar, Card, Typography, Spin } from 'antd';
import { SendOutlined, UserOutlined, CommentOutlined, RobotOutlined } from '@ant-design/icons';
import './MessageCounselor.css';

const { Text } = Typography;

const MessageCounselor = () => {
  const { counselorId } = useParams();
  const [userMessage, setUserMessage] = useState('');
  const [counselor, setCounselor] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  const messagesEndRef = useRef(null); // Ref for scrolling to bottom

  // Scroll to the bottom of the chat when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Get user ID from local storage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      setUserId(user.id);
    } else {
      setError('User not authenticated. Please log in.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch counselor details using the comprehensive get_counselor.php
        const counselorRes = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/get_counselor.php?id=${counselorId}`
        );
        const counselorData = await counselorRes.json();

        if (!counselorRes.ok || !counselorData.success || !counselorData.counselor) {
          throw new Error(counselorData.error || 'Counselor not found');
        }

        setCounselor(counselorData.counselor);

        // Fetch messages between THIS user and THIS counselor
        // Ensure both counselor_id and user_id are passed for specific conversation
        const messagesRes = await fetch(
          `http://localhost/AI-CAREER-PROJECT/backend/api/get_messages.php?counselor_id=${counselorId}&user_id=${user.id}`
        );
        const messagesData = await messagesRes.json();

        if (!messagesRes.ok || !messagesData.success) {
          throw new Error(messagesData.error || 'Failed to load messages');
        }

        setChatMessages(messagesData.messages.map(msg => ({
          id: msg.id,
          sender: msg.user_id === user.id ? 'user' : 'counselor', // Determine sender based on user ID
          text: msg.message,
          reply: msg.reply,
          time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: msg.status
        })));

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
        message.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up interval for refreshing messages (e.g., every 5 seconds)
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval); // Clean up interval on component unmount

  }, [counselorId, userId]); // Depend on counselorId and userId to refetch if they change

  // Scroll to bottom whenever chatMessages update
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);


  const sendMessage = async () => {
    if (!userMessage.trim()) {
      message.warning("Message cannot be empty");
      return;
    }
    if (!userId || !counselorId) {
      message.error("User or Counselor ID is missing. Cannot send message.");
      return;
    }

    const currentMessage = userMessage; // Store message before clearing input
    setUserMessage(''); // Clear input immediately for better UX

    try {
      const response = await fetch(
        "http://localhost/AI-CAREER-PROJECT/backend/api/send_message.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: userId,
            counselor_id: counselorId,
            message: currentMessage // Use the stored message
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        message.success("Message sent successfully");
        // Add the new message to chat immediately for responsiveness
        setChatMessages(prev => {
          const newMessages = [
            ...prev,
            {
              id: data.message_id, // Use ID from backend if available
              sender: 'user',
              text: currentMessage,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              status: 'unread'
            }
          ];
          return newMessages;
        });
        scrollToBottom(); // Scroll after adding message
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      message.error(`Failed to send message: ${error.message}`);
      // Optionally, revert userMessage if sending failed
      setUserMessage(currentMessage);
    }
  };

  // Helper function to determine the correct image source
  const getCounselorImageSrc = (imageFileName) => {
    if (!imageFileName) return null;
    // Check if it's already a full URL (e.g., from randomuser.me)
    if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) {
      return imageFileName;
    }
    // Otherwise, assume it's a local file name and prepend the uploads path
    return `http://localhost/AI-CAREER-PROJECT/backend/uploads/${imageFileName}`;
  };


  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Loading conversation..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <Text type="danger">{error}</Text>
        <Button
          type="primary"
          onClick={() => window.location.reload()}
          style={{ marginTop: 16 }}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="error-container">
        <Text type="danger">Counselor not found or invalid ID.</Text>
      </div>
    );
  }

  return (
    <div className="message-counselor-container">
      <div className="bubbles-background"></div>

      <Card className="message-card">
        <div className="message-header">
          <Avatar
            size={48}
            // Use the helper function to get the correct image source
            src={getCounselorImageSrc(counselor.image)}
            icon={!counselor.image && <UserOutlined />}
            className="counselor-avatar"
          />
          <div className="header-text">
            <h3>
              <CommentOutlined /> {counselor.name}
              <Text type="secondary" style={{ marginLeft: '10px' }}>
                ({counselor.specialization})
              </Text>
            </h3>
            <div>
              <Text type="secondary">
                Experience: {counselor.experience} years | Rating: {counselor.rating}/5
              </Text>
            </div>
          </div>
          <RobotOutlined className="ai-icon" />
        </div>

        {/* Chat messages display area */}
        <div className="chat-container">
          {chatMessages.length === 0 ? (
            <div className="empty-chat">
              <Text type="secondary">No messages yet. Start the conversation!</Text>
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div key={msg.id} className={`chat-message ${msg.sender}`}>
                <Avatar
                  // Use the helper function for chat message avatars as well
                  src={msg.sender === 'counselor' ? getCounselorImageSrc(counselor.image) : null}
                  icon={<UserOutlined />}
                />
                <div className={`message-bubble ${msg.sender}-bubble`}>
                  {msg.text}
                  {/* Display counselor's reply to user's message */}
                  {msg.reply && msg.sender === 'user' && (
                    <div className="message-reply">
                      <Text strong>Counselor's reply: </Text>
                      <Text>{msg.reply}</Text>
                    </div>
                  )}
                  <div className="message-time">{msg.time}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} /> {/* Element to scroll into view */}
        </div>

        {/* Message input area */}
        <div className="message-input-wrapper">
          <div className="message-input-box">
            <Input.TextArea
              rows={1}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-textarea"
              autoSize={{ minRows: 1, maxRows: 4 }} // Allow textarea to grow up to 4 rows
              onPressEnter={(e) => {
                if (!e.shiftKey) { // Send on Enter, allow Shift+Enter for new line
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              type="primary"
              onClick={sendMessage}
              className="send-button"
              icon={<SendOutlined />}
              disabled={!userMessage.trim()}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MessageCounselor;
