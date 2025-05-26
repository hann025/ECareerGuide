import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button, Card, Typography, message, Radio, Spin } from "antd"; // Added Radio, Spin
import { UserOutlined, LockOutlined, MailOutlined } from "@ant-design/icons"; // Added MailOutlined
import "./Login.css"; // Assuming you have a Login.css for styling

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAs, setLoginAs] = useState('user'); // 'user' or 'counselor'

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      message.warning("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost/AI-CAREER-PROJECT/backend/api/login.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
          loginAs: loginAs, // Send the selected role to the backend
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        message.success(data.message);

        // Store user/counselor data in localStorage based on their role
        if (data.user) { // This means a regular user logged in
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify({
            id: data.user.id,
            full_name: data.user.full_name,
            email: data.user.email,
            role: data.user.role // Should be 'user'
          }));
          // Clear counselor data if any was left from previous session
          localStorage.removeItem("counselor");
          setTimeout(() => navigate("/dashboard"), 500); // Redirect to user dashboard
        } else if (data.counselor) { // This means a counselor logged in
          localStorage.setItem("token", data.token);
          localStorage.setItem("counselor", JSON.stringify({
            id: data.counselor.id,
            name: data.counselor.name, // Counselor name
            email: data.counselor.email,
            role: data.counselor.role // Should be 'counselor'
          }));
          // Clear user data if any was left from previous session
          localStorage.removeItem("user");
          setTimeout(() => navigate("/counselor-inbox"), 500); // Redirect to counselor inbox
        } else {
          // Fallback if role data is missing from backend response
          message.error("Login successful, but role information is missing. Please contact support.");
          setLoading(false);
        }

      } else {
        message.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>Login</Title>

        <Radio.Group
          onChange={(e) => setLoginAs(e.target.value)}
          value={loginAs}
          buttonStyle="solid"
          style={{ marginBottom: 24, display: 'flex', justifyContent: 'center' }}
        >
          <Radio.Button value="user">Login as Student</Radio.Button>
          <Radio.Button value="counselor">Login as Counselor</Radio.Button>
        </Radio.Group>

        <Input
          size="large"
          placeholder="Email"
          prefix={<MailOutlined />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
        />

        <Input.Password
          size="large"
          placeholder="Password"
          prefix={<LockOutlined />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: 24 }}
        />

        <Button
          type="primary"
          block
          size="large"
          onClick={handleLogin}
          loading={loading}
        >
          {loading ? <Spin /> : "Login"}
        </Button>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <Text>Don't have an account? <a href="/signup">Sign Up</a></Text>
        </div>
      </Card>
    </div>
  );
};

export default Login;
