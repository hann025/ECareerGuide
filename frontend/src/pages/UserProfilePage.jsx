import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Space, Avatar, Tag, Progress, Spin, message, Modal, InputNumber, DatePicker } from 'antd';
import {
  UserOutlined, MailOutlined, PhoneOutlined, EditOutlined, SaveOutlined,
  ReadOutlined, BulbOutlined, LineChartOutlined, ClockCircleOutlined,
  LinkedinOutlined, GithubOutlined, SolutionOutlined, TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import './UserProfilePage.css';

const { Title, Text } = Typography;
const { Content } = Layout;

const API_BASE_URL = 'http://localhost/AI-CAREER-PROJECT/backend/api';

const UserProfilePage = () => {
  const [form] = Form.useForm();
  const [counselorForm] = Form.useForm();
  const [skillForm] = Form.useForm();
  const [educationForm] = Form.useForm();
  const [experienceForm] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [currentSkill, setCurrentSkill] = useState(null);
  const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState(null);
  const [isExperienceModalOpen, setIsExperienceModalOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);
  const [isInterestsModalOpen, setIsInterestsModalOpen] = useState(false);
  const [newInterestInput, setNewInterestInput] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    skills: [],
    education: [],
    experience: [],
    interests: [],
    aiInsights: [],
    specialization: '',
    experience_years: null,
    rating: null,
    availability: '',
    image: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userDataString = localStorage.getItem('user');
      const counselorDataString = localStorage.getItem('counselor');

      if (!token) {
        message.error('You are not logged in. Please log in to view your profile.');
        setLoading(false);
        return;
      }

      let roleDetermined = null;
      let profileApiUrl = '';

      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.role === 'user') {
          roleDetermined = 'user';
          profileApiUrl = `${API_BASE_URL}/profile.php`;
        }
      } else if (counselorDataString) {
        const counselorData = JSON.parse(counselorDataString);
        if (counselorData.role === 'counselor') {
          roleDetermined = 'counselor';
          profileApiUrl = `${API_BASE_URL}/counselor_profile.php`;
        }
      } else {
        message.error('User role could not be determined. Please log in again.');
        setLoading(false);
        return;
      }

      setUserRole(roleDetermined);

      try {
        const profileResponse = await fetch(profileApiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
        });

        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          let errorMessage = `HTTP error! Status: ${profileResponse.status}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const responseText = await profileResponse.text();
        if (!responseText.trim()) {
          throw new Error("Empty response from server. Check PHP error logs for `profile.php` or `counselor_profile.php`.");
        }

        let profileDataFetched;
        try {
          profileDataFetched = JSON.parse(responseText);
        } catch (e) {
          console.error("JSON parsing error:", e);
          console.error("Raw response text:", responseText);
          throw new Error(`Failed to parse JSON response: ${e.message}. Raw: "${responseText.substring(0, 100)}..."`);
        }

        if (roleDetermined === 'user' && profileDataFetched.user) {
          const userProfile = profileDataFetched.user;
          setProfileData(prev => ({
            ...prev,
            name: userProfile.full_name,
            email: userProfile.email,
            phone: userProfile.phone || '',
            bio: userProfile.bio || '',
          }));
          form.setFieldsValue({
            name: userProfile.full_name,
            email: userProfile.email,
            phone: userProfile.phone || '',
            bio: userProfile.bio || '',
          });

          const fetchUserSubData = async (endpoint) => {
            const res = await fetch(`${API_BASE_URL}/${endpoint}.php`, {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
              const errorText = await res.text();
              let errorMessage = `Failed to load ${endpoint}: HTTP error! Status: ${res.status}`;
              try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorMessage;
              } catch (e) {
                errorMessage = errorText || errorMessage;
              }
              throw new Error(errorMessage);
            }
            return await res.json();
          };

          try {
            const [skillsRes, educationRes, experienceRes, interestsRes, aiInsightsRes] = await Promise.allSettled([
              fetchUserSubData('skills'),
              fetchUserSubData('education'),
              fetchUserSubData('experience'),
              fetchUserSubData('interests'),
              fetchUserSubData('ai_insights'),
            ]);

            setProfileData(prev => ({
              ...prev,
              skills: skillsRes.status === 'fulfilled' ? skillsRes.value : [],
              education: educationRes.status === 'fulfilled' ? educationRes.value : [],
              experience: experienceRes.status === 'fulfilled' ? experienceRes.value : [],
              interests: interestsRes.status === 'fulfilled' ? interestsRes.value : [],
              aiInsights: aiInsightsRes.status === 'fulfilled' ? aiInsightsRes.value : [],
            }));
          } catch (error) {
            console.error('Error fetching user sub-data:', error);
            message.error(error.message || 'Failed to load some profile data. Please try again.');
          }
        } else if (roleDetermined === 'counselor' && profileDataFetched.counselor) {
          const counselorProfile = profileDataFetched.counselor;
          setProfileData(prev => ({
            ...prev,
            name: counselorProfile.name,
            email: counselorProfile.email,
            phone: counselorProfile.phone || '',
            bio: counselorProfile.bio || '',
            specialization: counselorProfile.specialization || '',
            experience_years: counselorProfile.experience || null,
            rating: counselorProfile.rating || null,
            availability: counselorProfile.availability || '',
            image: counselorProfile.image || null,
          }));
          form.setFieldsValue({
            name: counselorProfile.name,
            email: counselorProfile.email,
            phone: counselorProfile.phone || '',
            bio: counselorProfile.bio || '',
          });
          counselorForm.setFieldsValue({
            specialization: counselorProfile.specialization,
            experience_years: counselorProfile.experience,
            availability: counselorProfile.availability,
          });
        } else {
          if (profileDataFetched.message) {
            message.info(profileDataFetched.message);
          }
          setProfileData({
            name: '', email: '', phone: '', bio: '',
            specialization: '', experience_years: null, rating: null, availability: '', image: null,
            skills: [], education: [], experience: [], interests: [], aiInsights: []
          });
          form.resetFields();
          counselorForm.resetFields();
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        message.error(err.message || 'Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [form, counselorForm]);

  const getCounselorImageSrc = (imageFileName) => {
    if (!imageFileName) return null;
    if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) {
      return imageFileName;
    }
    return `http://localhost/AI-CAREER-PROJECT/backend/uploads/${imageFileName}`;
  };

  const handleSave = async (values) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    if (!token) {
      message.error('Authentication error. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      let response;
      let payload;
      let apiUrl;

      if (userRole === 'user') {
        payload = {
          full_name: values.name,
          email: values.email,
          phone: values.phone,
          bio: values.bio
        };
        apiUrl = `${API_BASE_URL}/profile.php`;
      } else if (userRole === 'counselor') {
        const counselorSpecificValues = await counselorForm.validateFields();
        payload = {
          name: values.name,
          email: values.email,
          phone: values.phone,
          bio: values.bio,
          specialization: counselorSpecificValues.specialization,
          experience: counselorSpecificValues.experience_years,
          availability: counselorSpecificValues.availability,
        };
        apiUrl = `${API_BASE_URL}/counselor_profile.php`;
      }

      response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          name: values.name,
          email: values.email,
          phone: values.phone,
          bio: values.bio,
          ...(userRole === 'counselor' && {
            specialization: payload.specialization,
            experience_years: payload.experience,
            availability: payload.availability,
          })
        }));
        setEditing(false);
        message.success(data.message || 'Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      message.error(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    form.setFieldsValue({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      bio: profileData.bio,
    });
    if (userRole === 'counselor') {
      counselorForm.setFieldsValue({
        specialization: profileData.specialization,
        experience_years: profileData.experience_years,
        availability: profileData.availability,
      });
    }
    setEditing(false);
  };

  const handleAddSkill = () => {
    setCurrentSkill(null);
    skillForm.resetFields();
    setIsSkillModalOpen(true);
  };

  const handleEditSkill = (skill) => {
    setCurrentSkill(skill);
    skillForm.setFieldsValue({
      skill_name: skill.skill_name,
      proficiency: skill.proficiency,
    });
    setIsSkillModalOpen(true);
  };

  const handleDeleteSkill = async (skillId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/skills.php?id=${skillId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete skill.');
      }

      setProfileData(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== skillId) }));
      message.success('Skill deleted successfully.');
    } catch (error) {
      console.error('Error deleting skill:', error);
      message.error(error.message || 'Error deleting skill.');
    }
  };

  const handleSkillModalOk = async () => {
    try {
      const values = await skillForm.validateFields();
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication error. Please log in again.');
        return;
      }

      let response;
      let method;
      let payload;
      let successMessage;

      if (currentSkill) {
        method = 'PUT';
        payload = { id: currentSkill.id, ...values };
        successMessage = 'Skill updated successfully.';
      } else {
        method = 'POST';
        payload = values;
        successMessage = 'Skill added successfully.';
      }

      response = await fetch(`${API_BASE_URL}/skills.php`, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save skill.');
      }
      message.success(successMessage);
      setIsSkillModalOpen(false);
      skillForm.resetFields();

      const skillsResponse = await fetch(`${API_BASE_URL}/skills.php`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (skillsResponse.ok) {
        const updatedSkills = await skillsResponse.json();
        setProfileData(prev => ({ ...prev, skills: updatedSkills }));
      }
    } catch (error) {
      console.error('Error saving skill:', error);
      message.error(error.message || 'Error saving skill. Please check your input.');
    }
  };

  const handleSkillModalCancel = () => {
    setIsSkillModalOpen(false);
    skillForm.resetFields();
    setCurrentSkill(null);
  };

  const handleAddEducation = () => {
    setCurrentEducation(null);
    educationForm.resetFields();
    setIsEducationModalOpen(true);
  };

  const handleEditEducation = (edu) => {
    setCurrentEducation(edu);
    educationForm.setFieldsValue({
      degree: edu.degree,
      institution: edu.institution,
      start_year: edu.start_year,
      end_year: edu.end_year ? moment(String(edu.end_year), 'YYYY') : null,
      description: edu.description,
    });
    setIsEducationModalOpen(true);
  };

  const handleDeleteEducation = async (eduId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/education.php?id=${eduId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete education entry.');
      }

      setProfileData(prev => ({ ...prev, education: prev.education.filter(e => e.id !== eduId) }));
      message.success('Education entry deleted successfully.');
    } catch (error) {
      console.error('Error deleting education entry:', error);
      message.error(error.message || 'Error deleting education entry.');
    }
  };

  const handleEducationModalOk = async () => {
    try {
      const values = await educationForm.validateFields();
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication error. Please log in again.');
        return;
      }

      let response;
      let method;
      let payload;
      let successMessage;
      const formattedValues = { ...values, end_year: values.end_year ? values.end_year.year() : null };

      if (currentEducation) {
        method = 'PUT';
        payload = { id: currentEducation.id, ...formattedValues };
        successMessage = 'Education entry updated successfully.';
      } else {
        method = 'POST';
        payload = formattedValues;
        successMessage = 'Education entry added successfully.';
      }

      response = await fetch(`${API_BASE_URL}/education.php`, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save education entry.');
      }
      message.success(successMessage);
      setIsEducationModalOpen(false);
      educationForm.resetFields();

      const educationResponse = await fetch(`${API_BASE_URL}/education.php`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (educationResponse.ok) {
        const updatedEducation = await educationResponse.json();
        setProfileData(prev => ({ ...prev, education: updatedEducation }));
      }
    } catch (error) {
      console.error('Error saving education entry:', error);
      message.error(error.message || 'Error saving education entry. Please check your input.');
    }
  };

  const handleEducationModalCancel = () => {
    setIsEducationModalOpen(false);
    educationForm.resetFields();
    setCurrentEducation(null);
  };

  const handleAddExperience = () => {
    setCurrentExperience(null);
    experienceForm.resetFields();
    setIsExperienceModalOpen(true);
  };

  const handleEditExperience = (exp) => {
    setCurrentExperience(exp);
    experienceForm.setFieldsValue({
      title: exp.title,
      company: exp.company,
      location: exp.location,
      start_date: exp.start_date ? moment(exp.start_date) : null,
      end_date: exp.end_date ? moment(exp.end_date) : null,
      description: exp.description,
    });
    setIsExperienceModalOpen(true);
  };

  const handleDeleteExperience = async (expId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/experience.php?id=${expId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete experience entry.');
      }

      setProfileData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== expId) }));
      message.success('Experience entry deleted successfully.');
    } catch (error) {
      console.error('Error deleting experience entry:', error);
      message.error(error.message || 'Error deleting experience entry.');
    }
  };

  const handleExperienceModalOk = async () => {
    try {
      const values = await experienceForm.validateFields();
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Authentication error. Please log in again.');
        return;
      }

      let response;
      let method;
      let payload;
      let successMessage;
      const formattedValues = {
        ...values,
        start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
        end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
      };

      if (currentExperience) {
        method = 'PUT';
        payload = { id: currentExperience.id, ...formattedValues };
        successMessage = 'Experience entry updated successfully.';
      } else {
        method = 'POST';
        payload = formattedValues;
        successMessage = 'Experience entry added successfully.';
      }

      response = await fetch(`${API_BASE_URL}/experience.php`, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save experience entry.');
      }
      message.success(successMessage);
      setIsExperienceModalOpen(false);
      experienceForm.resetFields();

      const experienceResponse = await fetch(`${API_BASE_URL}/experience.php`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (experienceResponse.ok) {
        const updatedExperience = await experienceResponse.json();
        setProfileData(prev => ({ ...prev, experience: updatedExperience }));
      }
    } catch (error) {
      console.error('Error saving experience entry:', error);
      message.error(error.message || 'Error saving experience entry. Please check your input.');
    }
  };

  const handleExperienceModalCancel = () => {
    setIsExperienceModalOpen(false);
    experienceForm.resetFields();
    setCurrentExperience(null);
  };

  const handleAddInterest = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      return;
    }

    const interestName = newInterestInput.trim();
    if (!interestName) {
      message.warning('Please enter an interest name.');
      return;
    }
    if (profileData.interests.some(i => i.interest_name.toLowerCase() === interestName.toLowerCase())) {
      message.warning('This interest is already in your list.');
      setNewInterestInput('');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/interests.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ interest_name: interestName })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add interest.');
      }
      const data = await response.json();
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, { id: data.id, interest_name: interestName }].sort((a, b) => a.interest_name.localeCompare(b.interest_name))
      }));
      message.success('Interest added successfully!');
      setNewInterestInput('');
    } catch (error) {
      console.error('Error adding interest:', error);
      message.error(error.message || 'Error adding interest.');
    }
  };

  const handleRemoveInterest = async (interestId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/interests.php?id=${interestId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove interest.');
      }

      setProfileData(prev => ({ ...prev, interests: prev.interests.filter(i => i.id !== interestId) }));
      message.success('Interest removed successfully.');
    } catch (error) {
      console.error('Error removing interest:', error);
      message.error(error.message || 'Error removing interest.');
    }
  };

  const handleInterestsModalCancel = () => {
    setIsInterestsModalOpen(false);
    setNewInterestInput('');
  };

  const handleRefreshAIInsights = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      message.error('Authentication error. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      message.loading({ content: 'Generating new insights based on your profile...', key: 'ai-insights-loading', duration: 0 });
      const response = await fetch(`${API_BASE_URL}/ai_insights.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to generate AI insights: HTTP error! Status: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      const data = await response.json();
      message.success({ content: data.message || 'AI insights refreshed successfully!', key: 'ai-insights-loading' });

      setProfileData(prev => ({ ...prev, aiInsights: data.insights }));
    } catch (error) {
      message.error({ content: error.message || 'Error refreshing AI insights.', key: 'ai-insights-loading' });
      console.error('Error refreshing AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || userRole === null) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Layout className="profile-layout">
      <Content className="profile-content-area">
        <Title level={2} className="profile-page-title">My Profile</Title>

        <Card className="profile-card basic-info-card">
          <div className="profile-header-section">
            {userRole === 'counselor' && profileData.image ? (
              <Avatar size={100} src={getCounselorImageSrc(profileData.image)} className="profile-avatar" />
            ) : (
              <Avatar size={100} icon={<UserOutlined />} className="profile-avatar" />
            )}
            <Title level={3} className="profile-name">{profileData.name}</Title>
            <Text type="secondary" className="profile-email"><MailOutlined /> {profileData.email}</Text>
            {profileData.phone && <Text type="secondary" className="profile-phone"><PhoneOutlined /> {profileData.phone}</Text>}

            {userRole === 'counselor' && (
              <>
                {profileData.specialization && (
                  <Text type="secondary" className="profile-specialization"><SolutionOutlined /> {profileData.specialization}</Text>
                )}
                {profileData.experience_years !== null && (
                  <Text type="secondary" className="profile-experience"><TrophyOutlined /> {profileData.experience_years} Years Experience</Text>
                )}
                {profileData.rating !== null && (
                  <Text type="secondary" className="profile-rating"><TrophyOutlined /> Rating: {profileData.rating}/5</Text>
                )}
                {profileData.availability && (
                  <Text type="secondary" className="profile-availability"><CalendarOutlined /> Available: {profileData.availability}</Text>
                )}
              </>
            )}
            <Text className="profile-bio">{profileData.bio || 'No bio available. Click edit to add one!'}</Text>
            <Space className="social-links">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><LinkedinOutlined /></a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"><GithubOutlined /></a>
            </Space>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
            className="profile-form"
            initialValues={{
              name: profileData.name,
              email: profileData.email,
              phone: profileData.phone,
              bio: profileData.bio,
            }}
          >
            <Form.Item label="Full Name" name="name" rules={[{ required: true, message: 'Please input your name!' }]}>
              <Input prefix={<UserOutlined />} disabled={!editing} />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please input a valid email!' }]}>
              <Input prefix={<MailOutlined />} disabled={!editing} />
            </Form.Item>
            <Form.Item label="Phone Number" name="phone">
              <Input prefix={<PhoneOutlined />} disabled={!editing} />
            </Form.Item>
            <Form.Item label="Bio" name="bio">
              <Input.TextArea rows={4} disabled={!editing} />
            </Form.Item>

            {userRole === 'counselor' && editing && (
              <Form
                form={counselorForm}
                layout="vertical"
                initialValues={{
                  specialization: profileData.specialization,
                  experience_years: profileData.experience_years,
                  availability: profileData.availability,
                }}
              >
                <Form.Item label="Specialization" name="specialization" rules={[{ required: true, message: 'Please input your specialization!' }]}>
                  <Input prefix={<SolutionOutlined />} />
                </Form.Item>
                <Form.Item label="Years of Experience" name="experience_years" rules={[{ required: true, message: 'Please input your years of experience!' }]}>
                  <InputNumber prefix={<TrophyOutlined />} min={0} max={50} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="Availability" name="availability" rules={[{ required: true, message: 'Please input your availability!' }]}>
                  <Input.TextArea prefix={<CalendarOutlined />} rows={2} />
                </Form.Item>
              </Form>
            )}

            <Space>
              {editing ? (
                <>
                  <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>Save</Button>
                  <Button onClick={handleCancelEdit} disabled={loading}>Cancel</Button>
                </>
              ) : (
                <Button type="default" icon={<EditOutlined />} onClick={() => setEditing(true)}>Edit Profile</Button>
              )}
            </Space>
          </Form>
        </Card>

        {userRole === 'user' && (
          <>
            <Card className="profile-card skills-card" title={<><ReadOutlined /> Skills</>} extra={
              <Button type="primary" onClick={handleAddSkill}>Add Skill</Button>
            }>
              <Space wrap>
                {profileData.skills.length > 0 ? (
                  profileData.skills.map(skill => (
                    <Tag
                      key={skill.id}
                      closable
                      onClose={() => handleDeleteSkill(skill.id)}
                      className="profile-tag"
                    >
                      {skill.skill_name} <Progress percent={skill.proficiency} size="small" showInfo={false} style={{ width: 80, marginLeft: 8 }} />
                      <EditOutlined onClick={(e) => { e.stopPropagation(); handleEditSkill(skill); }} style={{ marginLeft: 8, cursor: 'pointer' }} />
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No skills added yet. Add some to get personalized insights!</Text>
                )}
              </Space>
            </Card>

            <Card className="profile-card education-card" title={<><ReadOutlined /> Education</>} extra={
              <Button type="primary" onClick={handleAddEducation}>Add Education</Button>
            }>
              {profileData.education.length > 0 ? (
                profileData.education.map(edu => (
                  <div key={edu.id} className="education-entry">
                    <Text strong>{edu.degree} at {edu.institution}</Text>
                    <Text type="secondary">{edu.start_year} - {edu.end_year || 'Present'}</Text>
                    <Text>{edu.description}</Text>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => handleEditEducation(edu)} />
                      <Button size="small" danger icon={<UserOutlined />} onClick={() => handleDeleteEducation(edu.id)} />
                    </Space>
                  </div>
                ))
              ) : (
                <Text type="secondary">No education entries yet. Add your academic background!</Text>
              )}
            </Card>

            <Card className="profile-card experience-card" title={<><ReadOutlined /> Work Experience</>} extra={
              <Button type="primary" onClick={handleAddExperience}>Add Experience</Button>
            }>
              {profileData.experience.length > 0 ? (
                profileData.experience.map(exp => (
                  <div key={exp.id} className="experience-entry">
                    <Text strong>{exp.title} at {exp.company}</Text>
                    <Text type="secondary">{exp.location}</Text>
                    <Text type="secondary">
                      {moment(exp.start_date).format('MMMM YYYY')} - {exp.end_date ? moment(exp.end_date).format('MMMM YYYY') : 'Present'}
                    </Text>
                    <Text>{exp.description}</Text>
                    <Space>
                      <Button size="small" icon={<EditOutlined />} onClick={() => handleEditExperience(exp)} />
                      <Button size="small" danger icon={<UserOutlined />} onClick={() => handleDeleteExperience(exp.id)} />
                    </Space>
                  </div>
                ))
              ) : (
                <Text type="secondary">No work experience entries yet. Add your professional experience!</Text>
              )}
            </Card>

            <Card className="profile-card interests-card" title={<><BulbOutlined /> Interests</>} extra={
              <Button type="primary" onClick={() => setIsInterestsModalOpen(true)}>Manage Interests</Button>
            }>
              <Space wrap>
                {profileData.interests.length > 0 ? (
                  profileData.interests.map(interest => (
                    <Tag key={interest.id} closable onClose={() => handleRemoveInterest(interest.id)} className="profile-tag">
                      {interest.interest_name}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No interests added yet. Add some to get better recommendations!</Text>
                )}
              </Space>
            </Card>

            <Card className="profile-card ai-insights-card" title={<><LineChartOutlined /> AI Insights</>} extra={
              <Button type="primary" onClick={handleRefreshAIInsights}>Refresh Insights</Button>
            }>
              {profileData.aiInsights.length > 0 ? (
                profileData.aiInsights.map((insight, index) => (
                  <div key={index} className="ai-insight-entry">
                    <Text strong>{insight.title}</Text>
                    <Text>{insight.description}</Text>
                  </div>
                ))
              ) : (
                <Text type="secondary">No AI insights generated yet. Add more profile details and refresh!</Text>
              )}
            </Card>
          </>
        )}

        {userRole === 'user' && (
          <>
            <Modal
              title={currentSkill ? "Edit Skill" : "Add New Skill"}
              open={isSkillModalOpen}
              onOk={handleSkillModalOk}
              onCancel={handleSkillModalCancel}
              okText={currentSkill ? "Update Skill" : "Add Skill"}
              cancelText="Cancel"
            >
              <Form form={skillForm} layout="vertical" name="skillForm">
                <Form.Item name="skill_name" label="Skill Name" rules={[{ required: true, message: 'Please input the skill name!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="proficiency" label="Proficiency (0-100)" rules={[{ required: true, message: 'Please input proficiency!' }]}>
                  <InputNumber min={0} max={100} style={{ width: '100%' }} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title={currentEducation ? "Edit Education" : "Add New Education Entry"}
              open={isEducationModalOpen}
              onOk={handleEducationModalOk}
              onCancel={handleEducationModalCancel}
              okText={currentEducation ? "Update Entry" : "Add Entry"}
              cancelText="Cancel"
            >
              <Form form={educationForm} layout="vertical" name="educationForm">
                <Form.Item name="degree" label="Degree/Qualification" rules={[{ required: true, message: 'Please input degree!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="institution" label="Institution" rules={[{ required: true, message: 'Please input institution!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="start_year" label="Start Year" rules={[{ required: true, message: 'Please input start year!' }]}>
                  <InputNumber min={1900} max={new Date().getFullYear()} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="end_year" label="End Year (or leave blank if ongoing)">
                  <DatePicker picker="year" style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title={currentExperience ? "Edit Experience" : "Add New Experience Entry"}
              open={isExperienceModalOpen}
              onOk={handleExperienceModalOk}
              onCancel={handleExperienceModalCancel}
              okText={currentExperience ? "Update Entry" : "Add Entry"}
              cancelText="Cancel"
            >
              <Form form={experienceForm} layout="vertical" name="experienceForm">
                <Form.Item name="title" label="Job Title" rules={[{ required: true, message: 'Please input job title!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="company" label="Company" rules={[{ required: true, message: 'Please input company!' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="location" label="Location">
                  <Input />
                </Form.Item>
                <Form.Item name="start_date" label="Start Date" rules={[{ required: true, message: 'Please input start date!' }]}>
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="end_date" label="End Date (or leave blank if current)">
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="description" label="Description">
                  <Input.TextArea rows={3} />
                </Form.Item>
              </Form>
            </Modal>

            <Modal
              title="Manage Interests"
              open={isInterestsModalOpen}
              onCancel={handleInterestsModalCancel}
              footer={[
                <Button key="back" onClick={handleInterestsModalCancel}>
                  Done
                </Button>,
                <Button key="submit" type="primary" onClick={handleAddInterest} disabled={!newInterestInput.trim()}>
                  Add Interest
                </Button>,
              ]}
            >
              <Input
                placeholder="Add new interest"
                value={newInterestInput}
                onChange={(e) => setNewInterestInput(e.target.value)}
                onPressEnter={handleAddInterest}
                style={{ marginBottom: 16 }}
              />
              <Space wrap>
                {profileData.interests.length > 0 ? (
                  profileData.interests.map(interest => (
                    <Tag key={interest.id} closable onClose={() => handleRemoveInterest(interest.id)} className="profile-tag-manage">
                      {interest.interest_name}
                    </Tag>
                  ))
                ) : (
                  <Text type="secondary">No interests added yet.</Text>
                )}
              </Space>
            </Modal>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default UserProfilePage;
