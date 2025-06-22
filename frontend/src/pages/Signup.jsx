import React, { useState } from 'react';
import { Card, Input, Button, Typography, Form, message, Radio, Spin, InputNumber, Select } from 'antd'; 
import { UserOutlined, LockOutlined, MailOutlined, ArrowRightOutlined, PhoneOutlined, SolutionOutlined, CalendarOutlined } from '@ant-design/icons'; 
import { Link, useNavigate } from 'react-router-dom';
import './Signup.css'; 

const { Title, Text } = Typography;
const { Option } = Select; 

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [signupAs, setSignupAs] = useState('user'); // 'user' or 'counselor'

  const handleSignup = async (values) => {
    setLoading(true);
    setIsAnimating(true);

    let payload = {
      email: values.email,
      password: values.password,
      role: signupAs // Send the selected role
    };

    // Adjust payload based on role (full_name for user, name for counselor)
    if (signupAs === 'user') {
      payload.full_name = values.full_name;
    } else if (signupAs === 'counselor') {
      payload.name = values.full_name; // Use full_name input for counselor's name
      payload.phone = values.phone;
      payload.specialization = values.specialization;
      payload.experience = values.experience;
      payload.availability = values.availability;
      // Image and Rating are typically not set during initial signup
      // For image, a default or separate upload process is common.
      // For rating, it's usually aggregated from user feedback.
    }

    try {
      const response = await fetch('http://localhost/AI-CAREER-PROJECT/backend/api/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok && data.success) {
        message.success('Account created successfully! You can now log in.');
        setTimeout(() => {
          navigate('/login'); // Redirect to login page
        }, 1500);
      } else {
        setIsAnimating(false);
        message.error(data.message || data.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      setIsAnimating(false);
      message.error('Network error. Please check your connection and try again.');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="signup-container">
      <div className="bubbles-background"></div>

      <Card className={`signup-card ${isAnimating ? 'card-success-animation' : ''}`}>
        <div className="logo">
          <Title level={2} style={{ color: '#a777e3' }}>ECareerGuide</Title>
          <Text type="secondary">Start Your Career Journey</Text>
        </div>

        <Radio.Group
          onChange={(e) => setSignupAs(e.target.value)}
          value={signupAs}
          buttonStyle="solid"
          style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
        >
          <Radio.Button value="user">Sign Up as Student</Radio.Button>
          <Radio.Button value="counselor">Sign Up as Counselor</Radio.Button>
        </Radio.Group>

        <Form
          name="signupForm"
          onFinish={handleSignup}
          className="signup-form"
          layout="vertical"
        >
          <Form.Item
            name="full_name" // This field will be used for both user's full_name and counselor's name
            rules={[{ required: true, message: `Please enter your ${signupAs === 'user' ? 'full name' : 'name'}` }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#a777e3' }} />}
              placeholder={signupAs === 'user' ? "Full Name" : "Counselor Name"}
              className="signup-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ required: true, message: 'Please enter your email' }, { type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#a777e3' }} />}
              placeholder="Email"
              className="signup-input"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }, { min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#a777e3' }} />}
              placeholder="Password"
              className="signup-input"
              size="large"
            />
          </Form.Item>

          {/* Conditional fields for Counselors */}
          {signupAs === 'counselor' && (
            <>
              <Form.Item
                name="phone"
                rules={[{ required: true, message: 'Please enter your phone number' }]}
              >
                <Input
                  prefix={<PhoneOutlined style={{ color: '#a777e3' }} />}
                  placeholder="Phone Number"
                  className="signup-input"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="specialization"
                rules={[{ required: true, message: 'Please select your specialization' }]}
              >
                <Select
                  prefix={<SolutionOutlined style={{ color: '#a777e3' }} />}
                  placeholder="Select Specialization"
                  size="large"
                  className="signup-select"
                >
                  <Option value="Career Development">Career Development</Option>
                  <Option value="Resume Building">Resume Building</Option>
                  <Option value="Interview Prep">Interview Prep</Option>
                  <Option value="Skill Assessment">Skill Assessment</Option>
                  <Option value="Job Search Strategies">Job Search Strategies</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="experience"
                rules={[{ required: true, message: 'Please enter years of experience' }]}
              >
                <InputNumber
                  prefix={<UserOutlined style={{ color: '#a777e3' }} />} // Using UserOutlined as a generic icon
                  placeholder="Years of Experience"
                  min={0}
                  max={50}
                  className="signup-input-number"
                  size="large"
                  style={{ width: '100%' }} // Ensure it takes full width
                />
              </Form.Item>

              <Form.Item
                name="availability"
                rules={[{ required: true, message: 'Please describe your availability' }]}
              >
                <Input.TextArea
                  prefix={<CalendarOutlined style={{ color: '#a777e3' }} />}
                  placeholder="e.g., Mon-Fri, 9 AM - 5 PM"
                  className="signup-textarea"
                  size="large"
                  rows={2}
                />
              </Form.Item>
            </>
          )}

          <Button
            type="primary"
            htmlType="submit"
            className="signup-button"
            loading={loading}
            icon={!loading && <ArrowRightOutlined />}
          >
            {loading ? <Spin /> : 'Sign Up'}
          </Button>
        </Form>

        <div className="login-link">
          <Text>Already have an account? <Link to="/login" className="login-link-text">Login</Link></Text>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
