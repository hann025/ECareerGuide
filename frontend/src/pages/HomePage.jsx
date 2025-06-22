import React from 'react';
import { Button, Typography, Layout, Space } from 'antd';
import { ArrowRightOutlined, RocketOutlined, BulbOutlined, SolutionOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 
import FuturisticHumanoidRobot from '../assets/Futuristic Humanoid Robot in Blue.png'; 
const { Title, Text } = Typography;
const { Header, Content, Footer } = Layout;

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/signup'); // Direct users to the signup page
  };

  const quotes = [
    "The only way to do great work is to love what you do.",
    "Choose a job you love, and you will never have to work a day in your life.",
    "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    "The future belongs to those who believe in the beauty of their dreams."
  ];

  return (
    <Layout className="homepage-layout">
      {/* Bubbles Background - Reusing the aesthetic */}
      <div className="bubbles-background"></div>

      <Header className="homepage-header">
        <div className="logo-text">
          <Title level={3} className="logo-title">ECareerGuide</Title>
        </div>
        <Space>
          <Button type="text" className="nav-button" onClick={() => navigate('/login')}>Login</Button>
          <Button type="primary" className="nav-button-signup" onClick={() => navigate('/signup')}>Sign Up</Button>
        </Space>
      </Header>

      <Content className="homepage-content">
        <div className="hero-section">
          <div className="hero-text-content">
            <Title level={1} className="hero-title animate-fade-in-up">
              Unlock Your <span className="highlight-text">Career Potential</span>
            </Title>
            <Text className="hero-subtitle animate-fade-in-up-delay">
              Personalized guidance to help you navigate your professional journey, find your passion, and achieve your career goals.
            </Text>
            <Button
              type="primary"
              size="large"
              className="get-started-button animate-fade-in-up-delay-more"
              icon={<RocketOutlined />}
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
          </div>
          <div className="hero-image-container animate-scale-in">
            {/* Placeholder image for career guidance */}
            <img
              src={FuturisticHumanoidRobot} 
              alt="Career Guidance Illustration"
              className="hero-image"
              // Fallback for image loading errors
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x300/a777e3/ffffff?text=Image+Error"; }}
            />
          </div>
        </div>

        <div className="features-section">
          <Title level={2} className="features-title animate-fade-in">Why ECareerGuide?</Title>
          <div className="feature-cards-container">
            <div className="feature-card animate-slide-in-left">
              <BulbOutlined className="feature-icon" />
              <Title level={4}>Expert Guidance</Title>
              <Text>Connect with experienced career counselors tailored to your needs.</Text>
            </div>
            <div className="feature-card animate-slide-in-up">
              <SolutionOutlined className="feature-icon" />
              <Title level={4}>Personalized Paths</Title>
              <Text>Receive customized advice and resources for your unique career goals.</Text>
            </div>
            <div className="feature-card animate-slide-in-right">
              <RocketOutlined className="feature-icon" />
              <Title level={4}>Achieve Your Dreams</Title>
              <Text>Gain the confidence and tools to land your dream job and grow professionally.</Text>
            </div>
          </div>
        </div>

        <div className="quotes-section">
          <Title level={2} className="quotes-title animate-fade-in">Inspiring Words</Title>
          <div className="quote-carousel">
            {quotes.map((quote, index) => (
              <div key={index} className="quote-card animate-fade-in-delay">
                <Text className="quote-text">"{quote}"</Text>
              </div>
            ))}
          </div>
        </div>
      </Content>

      <Footer className="homepage-footer">
        <Text>&copy; {new Date().getFullYear()} ECareerGuide. All rights reserved.</Text>
      </Footer>
    </Layout>
  );
};

export default HomePage;