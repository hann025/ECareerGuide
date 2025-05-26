import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Card,
  Row,
  Col,
  Button,
  message,
} from "antd";
import {
  LogoutOutlined,
  RobotOutlined,
  MessageOutlined,
  CalendarOutlined,
  DashboardOutlined,
  UserOutlined,
  DollarOutlined,
  BankOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("Guest"); // Default to Guest
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
    } else if (hour < 18) {
      setGreeting("Good Afternoon");
    } else {
      setGreeting("Good Evening");
    }

    // AUTHENTICATION: Retrieve user data from localStorage
    const userDataString = localStorage.getItem("user");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // Use full_name for regular users
        if (userData.role === 'user' && userData.full_name) {
          setUsername(userData.full_name);
        } else if (userData.role === 'counselor' && userData.name) {
          // If a counselor logs in and lands here (though usually they go to inbox)
          setUsername(userData.name);
        } else {
          setUsername("User"); // Fallback if name is missing
        }
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        setUsername("User"); // Fallback on parse error
      }
    } else {
      // If no user data in localStorage, prompt to log in (or handle as guest)
      message.warning("You are not logged in. Please log in to access full features.");
      // Optionally, navigate to login if not authenticated
      // navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // Clear user data
    localStorage.removeItem("counselor"); // Clear counselor data if it was set
    message.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "2",
      icon: <RobotOutlined />,
      label: "Ask AI",
      onClick: () => navigate("/ask-ai"),
    },
    {
      key: "3",
      icon: <MessageOutlined />,
      label: "Counselors",
      onClick: () => navigate("/counselors"),
    },
    {
      key: "4",
      icon: <CalendarOutlined />,
      label: "Schedule Meeting",
      onClick: () => navigate("/schedule-meeting"),
    },
    {
      key: "5",
      icon: <InboxOutlined />,
      label: "Counselor Inbox",
      onClick: () => navigate("/counselor-inbox"),
    },
  ];

  return (
    <Layout className="dashboard-wrapper">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="custom-sider"
        width={220}
      >
        <div className="logo">E-CareerGuide</div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["1"]}
          items={menuItems}
          className="custom-menu"
        />
      </Sider>

      <Layout className="inner-layout">
        <Header className="custom-header">
          <div className="header-left">
            <Avatar icon={<UserOutlined />} />
            <Text className="user-name">{username}</Text>
          </div>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Button>
        </Header>

        <Content className="dashboard-content">
          {/* Bubbles background will now be applied via CSS pseudo-element on .dashboard-content */}

          <div className="welcome-box">
            <Title level={2}>
              {greeting}, {username}! {/* Display actual username */}
            </Title>
            <Text>Welcome to your AI Career Dashboard</Text>
          </div>

          <div className="center-boxes">
            {/* First Row */}
            <Row gutter={[32, 32]} justify="center" style={{ width: '100%' }}>
              <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                <Card
                  className="action-box"
                  onClick={() => navigate("/ask-ai")}
                  hoverable
                >
                  <RobotOutlined style={{ fontSize: 40 }} />
                  <Title level={4}>Talk to AI</Title>
                  <Text>Let AI guide your career decisions instantly.</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                <Card
                  className="action-box"
                  onClick={() => navigate("/counselors")}
                  hoverable
                >
                  <MessageOutlined style={{ fontSize: 40 }} />
                  <Title level={4}>Talk to a Counselor</Title>
                  <Text>Connect with a real expert for career help.</Text>
                </Card>
              </Col>
            </Row>

            {/* Second Row */}
            <Row gutter={[32, 32]} justify="center" style={{ width: '100%', marginTop: '24px' }}>
              <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                <Card
                  className="action-box"
                  onClick={() => navigate("/top-careers")}
                  hoverable
                >
                  <DollarOutlined style={{ fontSize: 40 }} />
                  <Title level={4}>Top Paying Careers</Title>
                  <Text>Discover high-earning career paths with growth potential.</Text>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={10} lg={8} xl={6}>
                <Card
                  className="action-box"
                  onClick={() => navigate("/elite-institutions")}
                  hoverable
                >
                  <BankOutlined style={{ fontSize: 40 }} />
                  <Title level={4}>Elite Institutions</Title>
                  <Text>Explore top universities for your chosen career path.</Text>
                </Card>
              </Col>
            </Row>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
