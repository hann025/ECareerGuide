import React, { useState, useEffect } from 'react';
import { Layout, Typography, Form, Input, Button, Card, Space, Spin, message, Modal, InputNumber, DatePicker, Select } from 'antd';
import { ReadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import moment from 'moment'; // Import moment for date handling
import './LearningJourneyPage.css'; // Import the new CSS file

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

const API_BASE_URL = 'http://localhost/AI-CAREER-PROJECT/backend/api';

const LearningJourneyPage = () => {
    const [form] = Form.useForm(); // Form for learning item modal
    const [loading, setLoading] = useState(true);

    // State for learning item modal
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentLearningItem, setCurrentLearningItem] = useState(null); // Item being edited, null for new item

    // State to hold learning journey data
    const [learningItems, setLearningItems] = useState([]);

    useEffect(() => {
        const fetchLearningData = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                message.error('You are not logged in. Please log in to view your learning journey.');
                setLoading(false);
                // Optionally redirect to login page if not logged in
                // navigate('/login'); // Assuming you have navigate from react-router-dom
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/learning_journey.php`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setLearningItems(data);
                message.success('Learning journey loaded successfully.');
            } catch (err) {
                console.error('Failed to fetch learning journey:', err);
                message.error(err.message || 'Failed to load learning journey. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchLearningData();
    }, []); // Empty dependency array means this runs once on mount

    const handleAddLearningItem = () => {
        setCurrentLearningItem(null); // Clear for new item
        form.resetFields(); // Clear form
        setIsModalVisible(true);
    };

    const handleEditLearningItem = (item) => {
        setCurrentLearningItem(item); // Set item for editing
        form.setFieldsValue({
            title: item.title,
            platform: item.platform,
            start_date: item.start_date ? moment(item.start_date) : null,
            end_date: item.end_date ? moment(item.end_date) : null,
            progress: item.progress,
            status: item.status,
            description: item.description,
        });
        setIsModalVisible(true);
    };

    const handleDeleteLearningItem = async (itemId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            message.error('Authentication error. Please log in again.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/learning_journey.php?id=${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete learning entry.');
            }

            // Remove item from local state
            setLearningItems(prev => prev.filter(item => item.id !== itemId));
            message.success('Learning entry deleted successfully.');
        } catch (error) {
            console.error('Error deleting learning entry:', error);
            message.error(error.message || 'Error deleting learning entry.');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const token = localStorage.getItem('token');
            if (!token) {
                message.error('Authentication error. Please log in again.');
                return;
            }

            let response;
            let method;
            let payload;
            let successMessage;

            // Format dates to YYYY-MM-DD for the backend
            const formattedValues = {
                ...values,
                start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : null,
                end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : null,
            };

            if (currentLearningItem) { // Editing existing item
                method = 'PUT';
                payload = { id: currentLearningItem.id, ...formattedValues };
                successMessage = 'Learning entry updated successfully.';
            } else { // Adding new item
                method = 'POST';
                payload = formattedValues;
                successMessage = 'Learning entry added successfully.';
            }

            response = await fetch(`${API_BASE_URL}/learning_journey.php`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save learning entry.');
            }

            message.success(successMessage);
            setIsModalVisible(false);
            form.resetFields(); // Reset form after successful save

            // Re-fetch learning items to ensure state is synchronized with DB
            const updatedItemsResponse = await fetch(`${API_BASE_URL}/learning_journey.php`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (updatedItemsResponse.ok) {
                const updatedItems = await updatedItemsResponse.json();
                setLearningItems(updatedItems);
            }

        } catch (error) {
            console.error('Error saving learning entry:', error);
            message.error(error.message || 'Error saving learning entry. Please check your input.');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
        setCurrentLearningItem(null);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <Spin size="large" tip="Loading Learning Journey..." />
            </div>
        );
    }

    return (
        <Layout className="learning-journey-layout">
            <Content className="learning-journey-content-area">
                <Title level={2} className="page-title"><ReadOutlined /> My Learning Journey</Title>

                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddLearningItem}
                    className="add-learning-button"
                >
                    Add New Learning Item
                </Button>

                <div className="learning-items-grid">
                    {learningItems.length > 0 ? (
                        learningItems.map((item) => (
                            <Card
                                key={item.id}
                                className="learning-item-card"
                                actions={[
                                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditLearningItem(item)}>Edit</Button>,
                                    <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteLearningItem(item.id)}>Delete</Button>,
                                ]}
                            >
                                <Card.Meta
                                    title={<Title level={5}>{item.title}</Title>}
                                    description={
                                        <Space direction="vertical">
                                            {item.platform && <Text type="secondary">Platform: {item.platform}</Text>}
                                            {(item.start_date || item.end_date) && (
                                                <Text type="secondary">
                                                    Dates: {item.start_date ? moment(item.start_date).format('YYYY-MM-DD') : 'N/A'} - {item.end_date ? moment(item.end_date).format('YYYY-MM-DD') : 'Present'}
                                                </Text>
                                            )}
                                            {item.description && <Text>{item.description}</Text>}
                                            <div className="progress-section">
                                                <Text>Progress: {item.progress}%</Text>
                                                <InputNumber
                                                    min={0}
                                                    max={100}
                                                    value={item.progress}
                                                    formatter={value => `${value}%`}
                                                    parser={value => value.replace('%', '')}
                                                    readOnly // Make it read-only here, only editable in modal
                                                    className="progress-input-display"
                                                />
                                                <Text>Status: <Tag color={
                                                    item.status === 'Completed' ? 'green' :
                                                    item.status === 'In Progress' ? 'blue' :
                                                    item.status === 'Planned' ? 'orange' : 'red'
                                                }>{item.status}</Tag></Text>
                                            </div>
                                        </Space>
                                    }
                                />
                            </Card>
                        ))
                    ) : (
                        <Text type="secondary" className="no-items-message">No learning items added yet. Click "Add New Learning Item" to get started!</Text>
                    )}
                </div>

                {/* Add/Edit Learning Item Modal */}
                <Modal
                    title={currentLearningItem ? "Edit Learning Item" : "Add New Learning Item"}
                    visible={isModalVisible}
                    onOk={handleModalOk}
                    onCancel={handleModalCancel}
                    okText="Save"
                    cancelText="Cancel"
                    destroyOnClose={true} // Ensures form resets properly when closed
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            name="title"
                            label="Title (e.g., Course Name, Certification)"
                            rules={[{ required: true, message: 'Please enter a title!' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="platform"
                            label="Platform (e.g., Coursera, Udemy, Internal Training)"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="start_date"
                            label="Start Date"
                        >
                            <DatePicker picker="date" style={{ width: '100%' }} format="YYYY-MM-DD" />
                        </Form.Item>
                        <Form.Item
                            name="end_date"
                            label="End Date (or leave blank if ongoing)"
                        >
                            <DatePicker picker="date" style={{ width: '100%' }} allowClear format="YYYY-MM-DD" />
                        </Form.Item>
                        <Form.Item
                            name="progress"
                            label="Progress (%)"
                            rules={[{ required: true, message: 'Please enter progress!' }]}
                        >
                            <InputNumber min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select a status!' }]}
                        >
                            <Select placeholder="Select status">
                                <Option value="Planned">Planned</Option>
                                <Option value="In Progress">In Progress</Option>
                                <Option value="Completed">Completed</Option>
                                <Option value="Dropped">Dropped</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="description"
                            label="Description (e.g., key takeaways, skills learned)"
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
};

export default LearningJourneyPage;