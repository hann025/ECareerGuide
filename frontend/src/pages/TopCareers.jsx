import React from 'react';
import { Layout, Typography, Card, Row, Col, Button } from 'antd';
import { DollarOutlined, ArrowLeftOutlined, LinkOutlined } from '@ant-design/icons'; // Added LinkOutlined for external links
import { useNavigate } from 'react-router-dom';
import './TopCareers.css';

const { Content } = Layout;
const { Title, Text } = Typography;

const careerData = [
  {
    title: "AI/Machine Learning Specialist",
    salary: "$120,000 - $200,000",
    growth: "35% (Much faster than average)",
    description: "Design and implement AI models to solve complex problems.",
    website: "https://www.ibm.com/cloud/learn/what-is-artificial-intelligence", // Corrected link
    tags: ["International", "Tech"]
  },
  {
    title: "Data Scientist",
    salary: "$100,000 - $180,000",
    growth: "28% (Much faster than average)",
    description: "Extract insights from large datasets to drive decisions.",
    website: "https://www.tableau.com/learn/articles/what-is-data-science", // Corrected link
    tags: ["International", "Tech"]
  },
  {
    title: "Cybersecurity Engineer",
    salary: "$110,000 - $190,000",
    growth: "31% (Much faster than average)",
    description: "Protect systems and networks from digital attacks.",
    website: "https://www.cisco.com/c/en/us/products/security/what-is-cybersecurity.html", // Corrected link
    tags: ["International", "Tech"]
  },
  {
    title: "Cloud Architect",
    salary: "$130,000 - $210,000",
    growth: "24% (Much faster than average)",
    description: "Design and manage cloud computing strategies.",
    website: "https://aws.amazon.com/what-is-cloud-computing/", // Corrected link
    tags: ["International", "Tech"]
  },
  {
    title: "Petroleum Engineer (Oil & Gas)",
    salary: "GH₵15,000 - GH₵40,000/month",
    growth: "High demand in Western Region",
    description: "Work with Tullow Oil, GNPC, or other energy companies",
    website: "https://www.tullowoil.com",
    tags: ["Ghana", "Engineering"]
  },
  {
    title: "Mining Engineer",
    salary: "GH₵12,000 - GH₵35,000/month",
    growth: "Growing sector in Ashanti/Western",
    description: "Opportunities with Newmont, Gold Fields, AngloGold",
    website: "https://www.newmont.com",
    tags: ["Ghana", "Engineering"]
  },
  {
    title: "Telecom Network Engineer",
    salary: "GH₵8,000 - GH₵25,000/month",
    growth: "Stable in Accra/Kumasi",
    description: "MTN, Vodafone, AirtelTigo infrastructure roles",
    website: "https://www.mtn.com.gh",
    tags: ["Ghana", "Tech"]
  },
  {
    title: "Agricultural Economist",
    salary: "GH₵6,000 - GH₵18,000/month",
    growth: "Growing food security focus",
    description: "Ministry of Agriculture, FAO projects, agribusiness",
    website: "https://mofa.gov.gh",
    tags: ["Ghana", "Agriculture"]
  },
  {
    title: "FinTech Software Developer",
    salary: "GH₵10,000 - GH₵30,000/month",
    growth: "Booming in Accra",
    description: "Mobile money, banking apps at Flutterwave, Zeepay",
    website: "https://flutterwave.com",
    tags: ["Ghana", "Tech"]
  },
  {
    title: "Healthcare Administrator",
    salary: "GH₵7,000 - GH₵20,000/month",
    growth: "Expanding healthcare sector",
    description: "Manage hospitals/clinics in major cities",
    website: "https://www.ghanahealthservice.org",
    tags: ["Ghana", "Healthcare"]
  },
  {
    title: "Construction Project Manager",
    salary: "GH₵9,000 - GH₵28,000/month",
    growth: "Infrastructure development",
    description: "Oversee building projects across Ghana",
    website: "https://www.mwh.gov.gh", // Example, might need a more specific construction company
    tags: ["Ghana", "Construction"]
  },
  {
    title: "Renewable Energy Specialist",
    salary: "GH₵8,500 - GH₵22,000/month",
    growth: "Solar/Wind energy expansion",
    description: "Work with Bui Power, Volta River Authority",
    website: "https://www.vra.com",
    tags: ["Ghana", "Energy"]
  },
  {
    title: "Ports & Shipping Manager",
    salary: "GH₵11,000 - GH₵32,000/month",
    growth: "Critical for trade economy",
    description: "Tema/Takoradi port operations",
    website: "https://www.gpa.gov.gh",
    tags: ["Ghana", "Logistics"]
  },
  {
    title: "Cocoa Value Chain Specialist",
    salary: "GH₵5,500 - GH₵15,000/month",
    growth: "Cocoa processing initiatives",
    description: "COCOBOD, Niche Cocoa, Cocoa Research Institute",
    website: "https://cocobod.gh",
    tags: ["Ghana", "Agriculture"]
  },
  {
    title: "Digital Marketing Manager",
    salary: "GH₵6,500 - GH₵18,000/month",
    growth: "E-commerce growth",
    description: "Jumia, Tonaton, Hubtel marketing roles",
    website: "https://www.jumia.com.gh",
    tags: ["Ghana", "Marketing"]
  },
  {
    title: "Civil Engineer (Roads)",
    salary: "GH₵8,000 - GH₵24,000/month",
    growth: "Road construction boom",
    description: "Ministry of Roads, construction firms",
    website: "https://www.mrh.gov.gh", // Example, might need a more specific construction firm
    tags: ["Ghana", "Engineering"]
  },
  {
    title: "University Lecturer (STEM)",
    salary: "GH₵7,500 - GH₵20,000/month",
    growth: "Academic expansion",
    description: "Teaching at KNUST, UG, UCC etc.",
    website: "https://www.knust.edu.gh",
    tags: ["Ghana", "Education"]
  },
  {
    title: "Pharmaceutical Sales Rep",
    salary: "GH₵5,000 - GH₵12,000/month + commission",
    growth: "Healthcare access expansion",
    description: "KAMA, M&G, Ernest Chemists distribution",
    website: "https://www.mofep.gov.gh", // Example, might need a specific pharma company
    tags: ["Ghana", "Healthcare"]
  },
  {
    title: "Tourism Development Officer",
    salary: "GH₵4,500 - GH₵14,000/month",
    growth: "Visit Ghana initiative",
    description: "Ghana Tourism Authority, luxury resorts",
    website: "https://www.ghana.travel",
    tags: ["Ghana", "Tourism"]
  },
  {
    title: "AI Research Scientist",
    salary: "$150,000 - $300,000/year",
    growth: "35% growth projected",
    description: "Develop cutting-edge AI at Google Brain, OpenAI",
    website: "https://deepmind.com",
    tags: ["International", "Tech"]
  },
  {
    title: "Blockchain Developer",
    salary: "$120,000 - $250,000/year",
    growth: "High crypto/Web3 demand",
    description: "Build decentralized applications",
    website: "https://ethereum.org",
    tags: ["International", "Tech"]
  },
  {
    title: "Quantitative Analyst (Finance)",
    salary: "$180,000 - $350,000/year",
    growth: "Wall Street demand",
    description: "Algorithmic trading at hedge funds",
    website: "https://www.goldmansachs.com",
    tags: ["International", "Finance"]
  },
  {
    title: "Biomedical Engineer",
    salary: "$85,000 - $160,000/year",
    growth: "20% growth (medical tech)",
    description: "Design medical devices/equipment",
    website: "https://www.medtronic.com",
    tags: ["International", "Healthcare"]
  },
  {
    title: "Data Privacy Lawyer",
    salary: "$130,000 - $280,000/year",
    growth: "GDPR/regulation expansion",
    description: "Tech company compliance",
    website: "https://www.dlapiper.com",
    tags: ["International", "Law"]
  },
  {
    title: "Space Systems Engineer",
    salary: "$110,000 - $220,000/year",
    growth: "SpaceX/NASA projects",
    description: "Satellite and spacecraft systems",
    website: "https://www.spacex.com",
    tags: ["International", "Engineering"]
  },
  {
    title: "Climate Change Economist",
    salary: "$95,000 - $180,000/year",
    growth: "Green energy transition",
    description: "World Bank, UN climate initiatives",
    website: "https://www.worldbank.org",
    tags: ["International", "Environment"]
  }
];

const TopCareers = () => {
  const navigate = useNavigate();

  const handleExploreClick = (websiteUrl) => {
    if (websiteUrl) {
      window.open(websiteUrl, '_blank'); // Open in new tab
    } else {
      message.info("No specific website link available for this career yet.");
    }
  };

  return (
    <Layout className="top-careers-container">
      <Content className="top-careers-content">
        {/* Bubbles background will now be applied via CSS pseudo-element on .top-careers-content */}
        
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate(-1)}
          className="back-button"
        >
          Back to Dashboard
        </Button>

        <div className="header-section">
          <Title level={2} className="page-title">
            <DollarOutlined /> Top Paying Careers
          </Title>
          <Text className="page-subtitle">
            Explore high-growth, high-salary career paths in emerging fields
          </Text>
        </div>

        <Row gutter={[24, 24]} className="careers-grid">
          {careerData.map((career, index) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={index}>
              <Card className="career-card" hoverable>
                <Title level={4} className="career-title">{career.title}</Title>
                <div className="salary-badge">{career.salary}</div>
                <Text className="growth-rate">{career.growth}</Text>
                <Text className="career-description">{career.description}</Text>
                <Button 
                  type="primary" 
                  className="explore-button"
                  onClick={() => handleExploreClick(career.website)} // Use the new handler
                  icon={<LinkOutlined />} // Add a link icon
                >
                  Explore Path
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </Content>
    </Layout>
  );
};

export default TopCareers;
