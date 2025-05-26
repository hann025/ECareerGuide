import React, { useState, useRef, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Avatar, 
  Card, 
  Typography, 
  message 
} from 'antd';
import { 
  SendOutlined, 
  UserOutlined, 
  RobotOutlined, 
  ArrowLeftOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
  FormOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './AIChat.css';

const { Text, Title } = Typography;

const AIChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { icon: <ThunderboltOutlined />, text: "Career Suggestions" },
    { icon: <FormOutlined />, text: "Skills Assessment" },
    { icon: <MessageOutlined />, text: "Interview Prep" },
    { icon: <DashboardOutlined />, text: "Career Roadmap" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) {
      message.warning('Please enter a message');
      return;
    }

    const userMessage = { 
      text: input, 
      sender: 'user', 
      id: Date.now() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost/AI-CAREER-PROJECT/backend/api/ask-ai.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: input }) 
      });

      const textResponse = await response.text(); 
      console.log('Response from PHP:', textResponse); 

      try {
        const data = JSON.parse(textResponse); 
        const aiMessage = {
          text: data.reply || "Sorry, I couldn't get an answer.",
          sender: 'ai',
          id: Date.now()
        };
        setMessages(prev => [...prev, aiMessage]);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        setMessages(prev => [...prev, {
          text: "Sorry, I couldn't parse the response.",
          sender: 'ai',
          id: Date.now()
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        text: "Oops! Something went wrong. Please try again.",
        sender: 'ai',
        id: Date.now()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="ai-chat-wrapper">
        {/* Moved Back to Dashboard Button here */}
        <Button 
          className="back-button"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/dashboard')}
        >
          Dashboard
        </Button>

        <div className="ai-chat-container">
          <Card className="ai-chat-glass-card">
            <div className="chat-header">
              {/* Removed back-button from here */}
              <div className="header-title">
                <RobotOutlined />
                <span>AI Career Assistant</span>
              </div>
            </div>

            <div className="messages-container">
              {messages.length === 0 && (
                <div className="welcome-message">
                  <Title level={3}>
                    <RobotOutlined /> Ask me anything about careers
                  </Title>
                  <Text type="secondary">
                    I can help with career suggestions, skills assessment, and interview preparation
                  </Text>
                  <div className="quick-actions">
                    {quickActions.map((action, index) => (
                      <div 
                        key={index}
                        className="quick-action"
                        onClick={() => setInput(action.text)}
                      >
                        {action.icon}
                        <span>{action.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  {msg.sender === 'ai' ? (
                    <Avatar icon={<RobotOutlined />} className="avatar" />
                  ) : (
                    <Avatar icon={<UserOutlined />} className="avatar user-avatar" />
                  )}
                  <div className="message-content">
                    <div className="message-text">
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
              <Input
                className="chat-input"
                placeholder="Ask about careers..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onPressEnter={handleSend}
              />
              <Button
                className="send-button"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={loading}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
