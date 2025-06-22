import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Space, Spin, message, DatePicker, Select, InputNumber } from 'antd';
import {
    UserOutlined, MailOutlined, PhoneOutlined, LinkOutlined, FileTextOutlined,
    ReadOutlined, CalendarOutlined, GlobalOutlined, CodeOutlined, TrophyOutlined,
    SaveOutlined, FolderOutlined, PlusOutlined, DeleteOutlined, EditOutlined
} from '@ant-design/icons';
import moment from 'moment';
import './ResumeBuilderPage.css'; // Import your CSS file

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;
const { TextArea } = Input;

const API_BASE_URL = 'http://localhost/AI-CAREER-PROJECT/backend/api';

// Helper function to safely parse JSON
const parseJsonSafely = (jsonString) => {
    try {
        return jsonString ? JSON.parse(jsonString) : [];
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return [];
    }
};

// Helper function to safely stringify JSON
const stringifyJsonSafely = (data) => {
    try {
        return JSON.stringify(data);
    } catch (e) {
        console.error("Error stringifying JSON:", e);
        return "[]"; // Return empty array JSON string on error
    }
};

const ResumeBuilderPage = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [resumeId, setResumeId] = useState(null); // To store the ID of the current resume
    const [resumeName, setResumeName] = useState(''); // To store the name of the resume

    // State for all resume data
    const [resumeData, setResumeData] = useState({
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            linkedin: '',
            github: '',
            portfolio: '',
            location: ''
        },
        summaryObjective: '',
        education: [],
        experience: [],
        skills: [],
        projects: [],
        awards: []
    });

    // Effect to fetch resume data when component mounts
    useEffect(() => {
        const fetchResume = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('You are not logged in. Please log in to build your resume.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/resume.php`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch resume data.');
                }

                const data = await response.json();

                if (data && data.id) {
                    setResumeId(data.id);
                    setResumeName(data.resume_name || 'My Resume');

                    const fetchedData = {
                        personalInfo: parseJsonSafely(data.personal_info),
                        summaryObjective: data.summary_objective || '',
                        education: parseJsonSafely(data.education_json).map(edu => ({
                            ...edu,
                            start_year: edu.start_year ? moment(String(edu.start_year), 'YYYY') : null,
                            end_year: edu.end_year ? moment(String(edu.end_year), 'YYYY') : null,
                        })),
                        experience: parseJsonSafely(data.experience_json).map(exp => ({
                            ...exp,
                            start_date: exp.start_date ? moment(exp.start_date) : null,
                            end_date: exp.end_date ? moment(exp.end_date) : null,
                        })),
                        skills: parseJsonSafely(data.skills_json),
                        projects: parseJsonSafely(data.projects_json).map(proj => ({
                            ...proj,
                            start_date: proj.start_date ? moment(proj.start_date) : null,
                            end_date: proj.end_date ? moment(proj.end_date) : null,
                        })),
                        awards: parseJsonSafely(data.awards_json)
                    };
                    setResumeData(fetchedData);
                    form.setFieldsValue({
                        resumeName: data.resume_name || 'My Resume',
                        ...fetchedData.personalInfo,
                        summaryObjective: fetchedData.summaryObjective,
                        // Education, Experience, Projects, Awards are managed by dynamic forms, not directly by main form
                    });
                    message.success('Resume loaded successfully!');
                } else {
                    message.info('No existing resume found. Start building a new one!');
                    setResumeName('My Resume');
                    form.setFieldsValue({ resumeName: 'My Resume' });
                }
            } catch (error) {
                console.error('Error fetching resume:', error);
                message.error(error.message || 'Failed to load resume. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchResume();
    }, [form]);

    // Function to handle saving/updating resume data
    const handleSaveResume = async () => {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Authentication error. Please log in again.');
            setLoading(false);
            return;
        }

        try {
            const values = await form.validateFields(); // Get values from the main form

            const payload = {
                resume_name: values.resumeName,
                personal_info: stringifyJsonSafely({
                    fullName: values.fullName,
                    email: values.email,
                    phone: values.phone,
                    linkedin: values.linkedin,
                    github: values.github,
                    portfolio: values.portfolio,
                    location: values.location
                }),
                summary_objective: values.summaryObjective,
                education_json: stringifyJsonSafely(resumeData.education.map(edu => ({
                    ...edu,
                    start_year: edu.start_year ? edu.start_year.year() : null,
                    end_year: edu.end_year ? edu.end_year.year() : null,
                }))),
                experience_json: stringifyJsonSafely(resumeData.experience.map(exp => ({
                    ...exp,
                    start_date: exp.start_date ? exp.start_date.format('YYYY-MM-DD') : null,
                    end_date: exp.end_date ? exp.end_date.format('YYYY-MM-DD') : null,
                }))),
                skills_json: stringifyJsonSafely(resumeData.skills),
                projects_json: stringifyJsonSafely(resumeData.projects.map(proj => ({
                    ...proj,
                    start_date: proj.start_date ? proj.start_date.format('YYYY-MM-DD') : null,
                    end_date: proj.end_date ? proj.end_date.format('YYYY-MM-DD') : null,
                }))),
                awards_json: stringifyJsonSafely(resumeData.awards)
            };

            let response;
            if (resumeId) { // Update existing resume
                response = await fetch(`${API_BASE_URL}/resume.php?id=${resumeId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            } else { // Create new resume
                response = await fetch(`${API_BASE_URL}/resume.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save resume.');
            }

            const data = await response.json();
            if (data.id) {
                setResumeId(data.id); // Set the new resume ID if created
            }
            message.success(data.message || 'Resume saved successfully!');
        } catch (error) {
            console.error('Error saving resume:', error);
            message.error(error.message || 'Failed to save resume. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Generic handler for updating nested state (e.g., personalInfo fields)
    const handleInputChange = useCallback((section, field, value) => {
        setResumeData(prev => {
            if (section === 'personalInfo') {
                return {
                    ...prev,
                    personalInfo: {
                        ...prev.personalInfo,
                        [field]: value
                    }
                };
            } else if (section === 'summaryObjective') {
                return {
                    ...prev,
                    summaryObjective: value
                };
            }
            return prev;
        });
    }, []);

    // Generic handlers for adding/editing/deleting array items (Education, Experience, Skills, Projects, Awards)
    const handleAddItem = useCallback((section) => {
        setResumeData(prev => ({
            ...prev,
            [section]: [...prev[section], {}] // Add an empty object for a new item
        }));
    }, []);

    const handleUpdateItem = useCallback((section, index, field, value) => {
        setResumeData(prev => {
            const updatedSection = [...prev[section]];
            updatedSection[index] = { ...updatedSection[index], [field]: value };
            return {
                ...prev,
                [section]: updatedSection
            };
        });
    }, []);

    const handleDeleteItem = useCallback((section, index) => {
        setResumeData(prev => ({
            ...prev,
            [section]: prev[section].filter((_, i) => i !== index)
        }));
    }, []);

    // Resume Preview Component (Inline for simplicity)
    const ResumePreview = ({ data }) => {
        const { personalInfo, summaryObjective, education, experience, skills, projects, awards } = data;

        return (
            <div className="resume-preview-content">
                {/* Personal Info */}
                <section className="resume-section personal-info-preview">
                    <h1 className="resume-name">{personalInfo.fullName || 'Your Name'}</h1>
                    <p className="contact-info">
                        {personalInfo.phone && <span>{personalInfo.phone} | </span>}
                        {personalInfo.email && <span>{personalInfo.email} | </span>}
                        {personalInfo.location && <span>{personalInfo.location}</span>}
                    </p>
                    <p className="links">
                        {personalInfo.linkedin && <a href={personalInfo.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
                        {personalInfo.github && personalInfo.linkedin && ' | '}
                        {personalInfo.github && <a href={personalInfo.github} target="_blank" rel="noopener noreferrer">GitHub</a>}
                        {personalInfo.portfolio && (personalInfo.linkedin || personalInfo.github) && ' | '}
                        {personalInfo.portfolio && <a href={personalInfo.portfolio} target="_blank" rel="noopener noreferrer">Portfolio</a>}
                    </p>
                </section>

                {/* Summary / Objective */}
                {summaryObjective && (
                    <section className="resume-section summary-objective-preview">
                        <h2>Summary</h2>
                        <p>{summaryObjective}</p>
                    </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                    <section className="resume-section education-preview">
                        <h2>Education</h2>
                        {education.map((edu, index) => (
                            <div key={index} className="resume-item">
                                <div className="item-header">
                                    <Text strong>{edu.degree || 'Degree/Major'}</Text>
                                    <Text className="item-date">
                                        {edu.start_year ? edu.start_year.year() : ''} - {edu.end_year ? edu.end_year.year() : 'Present'}
                                    </Text>
                                </div>
                                <Text className="item-subtitle">{edu.institution || 'Institution Name'}</Text>
                                {edu.description && <p className="item-description">{edu.description}</p>}
                            </div>
                        ))}
                    </section>
                )}

                {/* Experience */}
                {experience.length > 0 && (
                    <section className="resume-section experience-preview">
                        <h2>Experience</h2>
                        {experience.map((exp, index) => (
                            <div key={index} className="resume-item">
                                <div className="item-header">
                                    <Text strong>{exp.title || 'Job Title'}</Text>
                                    <Text className="item-date">
                                        {exp.start_date ? exp.start_date.format('YYYY-MM-DD') : ''} - {exp.end_date ? exp.end_date.format('YYYY-MM-DD') : 'Present'}
                                    </Text>
                                </div>
                                <Text className="item-subtitle">{exp.company || 'Company Name'}{exp.location && `, ${exp.location}`}</Text>
                                {exp.description && (
                                    <ul className="item-description-list">
                                        {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim()}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {skills.length > 0 && (
                    <section className="resume-section skills-preview">
                        <h2>Skills</h2>
                        <div className="skills-grid">
                            {skills.map((skill, index) => (
                                <div key={index} className="skill-item-preview">
                                    <Text strong>{skill.category || 'Category'}: </Text>
                                    <Text>{skill.names || 'Skill1, Skill2'}</Text>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {projects.length > 0 && (
                    <section className="resume-section projects-preview">
                        <h2>Projects</h2>
                        {projects.map((proj, index) => (
                            <div key={index} className="resume-item">
                                <div className="item-header">
                                    <Text strong>{proj.name || 'Project Name'}</Text>
                                    <Text className="item-date">
                                        {proj.start_date ? proj.start_date.format('YYYY-MM-DD') : ''} - {proj.end_date ? proj.end_date.format('YYYY-MM-DD') : 'Present'}
                                    </Text>
                                </div>
                                <Text className="item-subtitle">{proj.technologies || 'Technologies Used'}</Text>
                                {proj.description && (
                                    <ul className="item-description-list">
                                        {proj.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim()}</li>)}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </section>
                )}

                {/* Awards & Certifications */}
                {awards.length > 0 && (
                    <section className="resume-section awards-preview">
                        <h2>Awards & Certifications</h2>
                        {awards.map((award, index) => (
                            <div key={index} className="resume-item">
                                <div className="item-header">
                                    <Text strong>{award.name || 'Award/Certification Name'}</Text>
                                    <Text className="item-date">{award.date || 'Date'}</Text>
                                </div>
                                <Text className="item-subtitle">{award.issuer || 'Issuer'}</Text>
                                {award.description && <p className="item-description">{award.description}</p>}
                            </div>
                        ))}
                    </section>
                )}
            </div>
        );
    };


    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Loading Resume Builder..." />
            </div>
        );
    }

    return (
        <Layout className="resume-builder-layout">
            <Content className="resume-builder-content-area">
                <Title level={2} className="resume-builder-title">Resume Builder</Title>

                <div className="resume-builder-grid">
                    {/* Left Column: Input Forms */}
                    <div className="resume-forms-column">
                        <Card className="resume-card resume-actions-card">
                            <Form form={form} layout="vertical" onFinish={handleSaveResume} initialValues={{ resumeName: resumeName }}>
                                <Form.Item
                                    name="resumeName"
                                    label="Resume Name"
                                    rules={[{ required: true, message: 'Please name your resume!' }]}
                                >
                                    <Input
                                        prefix={<FileTextOutlined />}
                                        placeholder="e.g., Software Engineer Resume"
                                        value={resumeName}
                                        onChange={(e) => setResumeName(e.target.value)}
                                    />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={loading}
                                    block
                                    className="save-resume-button"
                                >
                                    {resumeId ? 'Update Resume' : 'Save New Resume'}
                                </Button>
                            </Form>
                        </Card>

                        {/* Personal Information */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><UserOutlined /> Personal Information</Title>
                            <Form.Item label="Full Name" name="fullName" initialValue={resumeData.personalInfo.fullName}>
                                <Input onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="Email" name="email" initialValue={resumeData.personalInfo.email}>
                                <Input type="email" onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="Phone" name="phone" initialValue={resumeData.personalInfo.phone}>
                                <Input onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="Location" name="location" initialValue={resumeData.personalInfo.location}>
                                <Input placeholder="e.g., City, State, Country" onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="LinkedIn Profile" name="linkedin" initialValue={resumeData.personalInfo.linkedin}>
                                <Input prefix={<LinkOutlined />} onChange={(e) => handleInputChange('personalInfo', 'linkedin', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="GitHub Profile" name="github" initialValue={resumeData.personalInfo.github}>
                                <Input prefix={<LinkOutlined />} onChange={(e) => handleInputChange('personalInfo', 'github', e.target.value)} />
                            </Form.Item>
                            <Form.Item label="Portfolio/Website" name="portfolio" initialValue={resumeData.personalInfo.portfolio}>
                                <Input prefix={<LinkOutlined />} onChange={(e) => handleInputChange('personalInfo', 'portfolio', e.target.value)} />
                            </Form.Item>
                        </Card>

                        {/* Summary/Objective */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><FileTextOutlined /> Summary / Objective</Title>
                            <Form.Item label="Write a concise summary or objective statement." name="summaryObjective" initialValue={resumeData.summaryObjective}>
                                <TextArea rows={4} onChange={(e) => handleInputChange('summaryObjective', null, e.target.value)} />
                            </Form.Item>
                        </Card>

                        {/* Education */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><ReadOutlined /> Education</Title>
                            {resumeData.education.map((edu, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <Input
                                        placeholder="Degree/Major"
                                        value={edu.degree}
                                        onChange={(e) => handleUpdateItem('education', index, 'degree', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Institution"
                                        value={edu.institution}
                                        onChange={(e) => handleUpdateItem('education', index, 'institution', e.target.value)}
                                    />
                                    <InputNumber
                                        placeholder="Start Year"
                                        min={1900}
                                        max={moment().year()}
                                        value={edu.start_year ? edu.start_year.year() : null}
                                        onChange={(value) => handleUpdateItem('education', index, 'start_year', value ? moment(String(value), 'YYYY') : null)}
                                        style={{ width: '100%' }}
                                    />
                                    <InputNumber
                                        placeholder="End Year (or leave blank if ongoing)"
                                        min={1900}
                                        max={moment().year()}
                                        value={edu.end_year ? edu.end_year.year() : null}
                                        onChange={(value) => handleUpdateItem('education', index, 'end_year', value ? moment(String(value), 'YYYY') : null)}
                                        style={{ width: '100%' }}
                                    />
                                    <TextArea
                                        rows={2}
                                        placeholder="Description (e.g., Honors, GPA, relevant coursework)"
                                        value={edu.description}
                                        onChange={(e) => handleUpdateItem('education', index, 'description', e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteItem('education', index)}
                                        className="delete-item-button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => handleAddItem('education')} block icon={<PlusOutlined />}>
                                Add Education
                            </Button>
                        </Card>

                        {/* Experience */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><CalendarOutlined /> Work Experience</Title>
                            {resumeData.experience.map((exp, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <Input
                                        placeholder="Job Title"
                                        value={exp.title}
                                        onChange={(e) => handleUpdateItem('experience', index, 'title', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Company"
                                        value={exp.company}
                                        onChange={(e) => handleUpdateItem('experience', index, 'company', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Location (e.g., City, State)"
                                        value={exp.location}
                                        onChange={(e) => handleUpdateItem('experience', index, 'location', e.target.value)}
                                    />
                                    <DatePicker
                                        picker="month"
                                        placeholder="Start Date"
                                        format="YYYY-MM"
                                        value={exp.start_date}
                                        onChange={(date) => handleUpdateItem('experience', index, 'start_date', date)}
                                        style={{ width: '100%' }}
                                    />
                                    <DatePicker
                                        picker="month"
                                        placeholder="End Date (or leave blank if ongoing)"
                                        format="YYYY-MM"
                                        value={exp.end_date}
                                        onChange={(date) => handleUpdateItem('experience', index, 'end_date', date)}
                                        style={{ width: '100%' }}
                                        allowClear
                                    />
                                    <TextArea
                                        rows={4}
                                        placeholder="Responsibilities and achievements (use bullet points, one per line)"
                                        value={exp.description}
                                        onChange={(e) => handleUpdateItem('experience', index, 'description', e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteItem('experience', index)}
                                        className="delete-item-button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => handleAddItem('experience')} block icon={<PlusOutlined />}>
                                Add Experience
                            </Button>
                        </Card>

                        {/* Skills */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><CodeOutlined /> Skills</Title>
                            {resumeData.skills.map((skill, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <Input
                                        placeholder="Skill Category (e.g., Programming Languages)"
                                        value={skill.category}
                                        onChange={(e) => handleUpdateItem('skills', index, 'category', e.target.value)}
                                    />
                                    <TextArea
                                        rows={2}
                                        placeholder="Skill Names (comma-separated, e.g., Python, JavaScript, React)"
                                        value={skill.names}
                                        onChange={(e) => handleUpdateItem('skills', index, 'names', e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteItem('skills', index)}
                                        className="delete-item-button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => handleAddItem('skills')} block icon={<PlusOutlined />}>
                                Add Skill Section
                            </Button>
                        </Card>

                        {/* Projects */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><FolderOutlined /> Projects</Title>
                            {resumeData.projects.map((proj, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <Input
                                        placeholder="Project Name"
                                        value={proj.name}
                                        onChange={(e) => handleUpdateItem('projects', index, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Technologies Used (e.g., React, Node.js, MongoDB)"
                                        value={proj.technologies}
                                        onChange={(e) => handleUpdateItem('projects', index, 'technologies', e.target.value)}
                                    />
                                    <DatePicker
                                        picker="month"
                                        placeholder="Start Date"
                                        format="YYYY-MM"
                                        value={proj.start_date}
                                        onChange={(date) => handleUpdateItem('projects', index, 'start_date', date)}
                                        style={{ width: '100%' }}
                                    />
                                    <DatePicker
                                        picker="month"
                                        placeholder="End Date (or leave blank if ongoing)"
                                        format="YYYY-MM"
                                        value={proj.end_date}
                                        onChange={(date) => handleUpdateItem('projects', index, 'end_date', date)}
                                        style={{ width: '100%' }}
                                        allowClear
                                    />
                                    <TextArea
                                        rows={3}
                                        placeholder="Project description and your contributions (use bullet points, one per line)"
                                        value={proj.description}
                                        onChange={(e) => handleUpdateItem('projects', index, 'description', e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteItem('projects', index)}
                                        className="delete-item-button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => handleAddItem('projects')} block icon={<PlusOutlined />}>
                                Add Project
                            </Button>
                        </Card>

                        {/* Awards & Certifications */}
                        <Card className="resume-card">
                            <Title level={4} className="card-title"><TrophyOutlined /> Awards & Certifications</Title>
                            {resumeData.awards.map((award, index) => (
                                <div key={index} className="dynamic-form-item">
                                    <Input
                                        placeholder="Award/Certification Name"
                                        value={award.name}
                                        onChange={(e) => handleUpdateItem('awards', index, 'name', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Issuer (e.g., Coursera, IBM)"
                                        value={award.issuer}
                                        onChange={(e) => handleUpdateItem('awards', index, 'issuer', e.target.value)}
                                    />
                                    <Input
                                        placeholder="Date (e.g., 2023-05-15 or May 2023)"
                                        value={award.date}
                                        onChange={(e) => handleUpdateItem('awards', index, 'date', e.target.value)}
                                    />
                                    <TextArea
                                        rows={2}
                                        placeholder="Description (optional)"
                                        value={award.description}
                                        onChange={(e) => handleUpdateItem('awards', index, 'description', e.target.value)}
                                    />
                                    <Button
                                        type="link"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDeleteItem('awards', index)}
                                        className="delete-item-button"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                            <Button type="dashed" onClick={() => handleAddItem('awards')} block icon={<PlusOutlined />}>
                                Add Award/Certification
                            </Button>
                        </Card>
                    </div>

                    {/* Right Column: Resume Preview */}
                    <div className="resume-preview-column">
                        <Card className="resume-card resume-preview-card">
                            <Title level={4} className="card-title">Live Preview: {resumeName}</Title>
                            <ResumePreview data={resumeData} />
                        </Card>
                    </div>
                </div>
            </Content>
        </Layout>
    );
};

export default ResumeBuilderPage;
