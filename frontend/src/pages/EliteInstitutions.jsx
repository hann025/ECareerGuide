import React, { useState } from 'react';
import { Layout, Typography, Card, Row, Col, Button, Input, Tag } from 'antd';
import { BankOutlined, ArrowLeftOutlined, SearchOutlined, LinkOutlined } from '@ant-design/icons'; // Added LinkOutlined
import { useNavigate } from 'react-router-dom';
import './EliteInstitutions.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Search } = Input;

const institutionsData = [
  {
    name: "Kwame Nkrumah University of Science and Technology (KNUST)",
    location: "Kumasi, Ghana",
    ranking: "#1 Engineering School in Ghana",
    programs: "Engineering, Medicine, Architecture, Pharmacy",
    website: "https://www.knust.edu.gh",
    tags: ["Ghana", "STEM"]
  },
  {
    name: "University of Ghana (Legon)",
    location: "Accra, Ghana",
    ranking: "#1 Overall in Ghana",
    programs: "Law, Business, Social Sciences, Medicine",
    website: "https://www.ug.edu.gh",
    tags: ["Ghana", "Comprehensive"]
  },
  {
    name: "University of Cape Coast (UCC)",
    location: "Cape Coast, Ghana",
    ranking: "#1 Education School",
    programs: "Education, Fisheries, Tourism",
    website: "https://www.ucc.edu.gh",
    tags: ["Ghana", "Education"]
  },
  {
    name: "Ghana Institute of Management and Public Administration (GIMPA)",
    location: "Accra, Ghana",
    ranking: "#1 Business School",
    programs: "MBA, Public Administration, Law",
    website: "https://www.gimpa.edu.gh",
    tags: ["Ghana", "Business"]
  },
  {
    name: "University of Professional Studies, Accra (UPSA)",
    location: "Accra, Ghana",
    ranking: "#1 Accounting School",
    programs: "Accounting, Finance, Marketing",
    website: "https://www.upsa.edu.gh",
    tags: ["Ghana", "Business"]
  },
  {
    name: "Ashesi University",
    location: "Berekuso, Ghana",
    ranking: "#1 Liberal Arts",
    programs: "Computer Science, Business, Engineering",
    website: "https://www.ashesi.edu.gh",
    tags: ["Ghana", "Private"]
  },
  {
    name: "Ghana Communication Technology University (GCTU)", // Corrected name
    location: "Accra, Ghana",
    ranking: "#1 Telecom School",
    programs: "ICT, Communications, Engineering",
    website: "https://www.gctu.edu.gh",
    tags: ["Ghana", "Tech"]
  },
  {
    name: "University of Mines and Technology (UMaT)",
    location: "Tarkwa, Ghana",
    ranking: "#1 Mining School",
    programs: "Mining, Petroleum, Geological Engineering",
    website: "https://www.umat.edu.gh",
    tags: ["Ghana", "Engineering"]
  },
  {
    name: "University of Health and Allied Sciences (UHAS)",
    location: "Ho, Ghana",
    ranking: "#1 Medical School (Public Health)",
    programs: "Medicine, Nursing, Public Health",
    website: "https://www.uhas.edu.gh",
    tags: ["Ghana", "Healthcare"]
  },
  {
    name: "University for Development Studies (UDS)",
    location: "Tamale, Ghana",
    ranking: "#1 Agriculture School",
    programs: "Agriculture, Medicine, Development Studies",
    website: "https://www.uds.edu.gh",
    tags: ["Ghana", "Agriculture"]
  },
  {
    name: "Regent University College of Science and Technology", // Full name
    location: "Accra, Ghana",
    ranking: "Top Private Business School",
    programs: "Business, Theology, Communication",
    website: "https://www.regent.edu.gh",
    tags: ["Ghana", "Private"]
  },
  {
    name: "Central University",
    location: "Accra, Ghana",
    ranking: "Leading Christian University",
    programs: "Business, Theology, Law",
    website: "https://www.central.edu.gh",
    tags: ["Ghana", "Private"]
  },
  {
    name: "Massachusetts Institute of Technology (MIT)",
    location: "Cambridge, USA",
    ranking: "#1 Worldwide (QS 2023)",
    programs: "Engineering, Computer Science, Physics, Economics",
    website: "https://web.mit.edu", // Corrected to primary MIT website
    tags: ["International", "STEM"]
  },
  {
    name: "University of Oxford",
    location: "Oxford, UK",
    ranking: "#2 Worldwide (THE 2023)",
    programs: "Law, Medicine, Humanities, Business",
    website: "https://www.ox.ac.uk",
    tags: ["International", "Comprehensive"]
  },
  {
    name: "ETH Zurich",
    location: "Zurich, Switzerland",
    ranking: "#1 in Europe for Engineering",
    programs: "Engineering, Natural Sciences, Architecture",
    website: "https://ethz.ch/en/", // Added /en/ for English version
    tags: ["International", "STEM"]
  },
  {
    name: "Stanford University", // Added a new international institution
    location: "Stanford, USA",
    ranking: "Top 5 Worldwide",
    programs: "Computer Science, Engineering, Business, Law",
    website: "https://www.stanford.edu/",
    tags: ["International", "STEM", "Comprehensive"]
  },
  {
    name: "University of Cambridge", // Added a new international institution
    location: "Cambridge, UK",
    ranking: "Top 5 Worldwide",
    programs: "Arts, Humanities, Sciences, Engineering",
    website: "https://www.cam.ac.uk/",
    tags: ["International", "Comprehensive"]
  }
];

const EliteInstitutions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleViewDetailsClick = (websiteUrl) => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank'); // Open in new tab
    } else {
      message.info("No specific website link available for this institution yet.");
    }
  };

  const filteredInstitutions = institutionsData.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.programs.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Layout className="institutions-container">
      <Content className="institutions-content">
        {/* Bubbles background will now be applied via CSS pseudo-element on .institutions-content */}
        
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back to Dashboard
        </Button>
        <div className="header-section">
          <Title level={2} className="page-title">
            <BankOutlined /> Elite Institutions
          </Title>
          <Text className="page-subtitle">
            World's top universities for your career aspirations
          </Text>
          <Search
            placeholder="Search institutions by name, location, or program"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={setSearchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="institution-search-bar"
          />
        </div>
        <Row gutter={[24, 24]} className="institutions-grid">
          {filteredInstitutions.length === 0 ? (
            <Col span={24} style={{ textAlign: 'center', marginTop: '50px' }}>
              <Text type="secondary">No institutions found matching your search criteria.</Text>
            </Col>
          ) : (
            filteredInstitutions.map((institution, index) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={index}>
                <Card className="institution-card" hoverable>
                  <Title level={4} className="institution-name">{institution.name}</Title>
                  <Text className="institution-location">{institution.location}</Text>
                  <div className="ranking-badge">{institution.ranking}</div>
                  <Text className="programs-title">Top Programs:</Text>
                  <Text className="programs-list">{institution.programs}</Text>
                  <div className="institution-tags">
                    {institution.tags && institution.tags.map(tag => (
                      <Tag key={tag} color="purple">{tag}</Tag>
                    ))}
                  </div>
                  <Button 
                    type="primary" 
                    className="explore-button"
                    onClick={() => handleViewDetailsClick(institution.website)}
                    icon={<LinkOutlined />} // Added LinkOutlined icon
                  >
                    View Details
                  </Button>
                </Card>
              </Col>
            ))
          )}
        </Row>
      </Content>
    </Layout>
  );
};

export default EliteInstitutions;
