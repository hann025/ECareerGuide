import React, { useState } from 'react';
import { Layout, Typography, Input, Button, Card, Spin, message, Space, Select, Collapse, Row, Col } from 'antd';
import { RobotOutlined, FileTextOutlined, ArrowLeftOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './DocumentOptimizer.css'; // We will create this CSS file next

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const DocumentOptimizer = () => {
  const navigate = useNavigate();
  const [userDocument, setUserDocument] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [documentType, setDocumentType] = useState('resume'); // 'resume' or 'cover_letter'
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleOptimizeDocument = async () => {
    if (!userDocument.trim() || !jobDescription.trim()) {
      message.warning('Please provide both your document text and the job description.');
      return;
    }

    setLoading(true);
    setError(null);
    setFeedback(null); // Clear previous feedback

    const token = localStorage.getItem('token'); // Get JWT token from localStorage

    if (!token) {
      message.error('Authentication token missing. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost/AI-CAREER-PROJECT/backend/api/optimize_document.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Include JWT token
        },
        body: JSON.stringify({
          user_document: userDocument,
          job_description: jobDescription,
          document_type: documentType,
          job_title: jobTitle,
          company_name: companyName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to get feedback from AI. Please try again.');
      }

      setFeedback(data.feedback);
      message.success('Document optimized successfully! Review the feedback below.');

    } catch (err) {
      console.error('Error optimizing document:', err);
      setError(err.message);
      message.error(`Optimization failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="optimizer-container">
      <div className="bubbles-background"></div>

      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/dashboard')}
        className="back-button"
      >
        Back to Dashboard
      </Button>

      <Card className="optimizer-card">
        <Title level={2} className="card-title">
          <RobotOutlined /> AI Document Optimizer
        </Title>
        <Text type="secondary" className="card-subtitle">
          Get instant, AI-powered feedback to perfect your resume or cover letter for any job.
        </Text>

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div className="input-section">
            <Text strong>Document Type:</Text>
            <Select
              value={documentType}
              onChange={setDocumentType}
              style={{ width: '100%', marginBottom: '16px' }}
              size="large"
            >
              <Option value="resume">Resume</Option>
              <Option value="cover_letter">Cover Letter</Option>
            </Select>

            <Text strong>{documentType === 'resume' ? 'Your Resume Text' : 'Your Cover Letter Text'}:</Text>
            <TextArea
              rows={10}
              value={userDocument}
              onChange={(e) => setUserDocument(e.target.value)}
              placeholder={`Paste your full ${documentType} text here...`}
              className="optimizer-textarea"
            />
          </div>

          <div className="input-section">
            <Text strong>Job Description Text:</Text>
            <TextArea
              rows={10}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description text here..."
              className="optimizer-textarea"
            />
          </div>

          <div className="input-section">
            <Text strong>Job Title (Optional, for better context):</Text>
            <Input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="optimizer-input"
              size="large"
            />
          </div>

          <div className="input-section">
            <Text strong>Company Name (Optional, for better context):</Text>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Google"
              className="optimizer-input"
              size="large"
            />
          </div>

          <Button
            type="primary"
            size="large"
            block
            icon={<ThunderboltOutlined />}
            onClick={handleOptimizeDocument}
            loading={loading}
            className="optimize-button"
          >
            {loading ? 'Analyzing...' : 'Get AI Feedback'}
          </Button>

          {error && (
            <Text type="danger" className="error-message">
              {error}
            </Text>
          )}

          {feedback && (
            <Card className="feedback-card">
              <Title level={3} className="feedback-title">
                <FileTextOutlined /> Your Personalized Feedback
              </Title>
              <Text type="secondary" className="feedback-intro">
                Here's what our AI suggests to optimize your {documentType}:
              </Text>

              <Collapse accordion bordered={false} className="feedback-collapse">
                {Object.entries(feedback).map(([category, points]) => (
                  <Panel
                    header={<span className="feedback-category-header">{category.replace(/([A-Z])/g, ' $1').trim()}</span>}
                    key={category}
                    className="feedback-panel"
                  >
                    {Array.isArray(points) && points.length > 0 ? (
                      <ul>
                        {points.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <Text type="secondary">No specific feedback in this category. Great job!</Text>
                    )}
                  </Panel>
                ))}
              </Collapse>
            </Card>
          )}
        </Space>
      </Card>
    </Layout>
  );
};

export default DocumentOptimizer;
