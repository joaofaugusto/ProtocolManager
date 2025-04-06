// src/pages/Protocols.tsx
import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, DatePicker,
    Tabs, Upload, message, List, Tag, Card, Popconfirm
} from 'antd';
import {
    EditOutlined, DeleteOutlined, PlusOutlined,
    UploadOutlined, FileOutlined, ClockCircleOutlined,
    BellOutlined, CheckOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { Protocol, Customer, Personnel, ProtocolStatus, ProtocolHistory, ProtocolAttachment, ProtocolReminder } from '../types/types';
import '../styles/Protocol.css';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;


const ProtocolPage: React.FC = () => {
    // States for protocols and related entities
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const [statuses, setStatuses] = useState<ProtocolStatus[]>([]);

    // States for selected protocol and its related data
    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);
    const [protocolHistory, setProtocolHistory] = useState<ProtocolHistory[]>([]);
    const [protocolAttachments, setProtocolAttachments] = useState<ProtocolAttachment[]>([]);
    const [protocolReminders, setProtocolReminders] = useState<ProtocolReminder[]>([]);

    // Modal states
    const [protocolModalVisible, setProtocolModalVisible] = useState<boolean>(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState<boolean>(false);
    const [reminderModalVisible, setReminderModalVisible] = useState<boolean>(false);
    const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);

    // Form and loading states
    const [protocolForm] = Form.useForm();
    const [reminderForm] = Form.useForm();
    const [historyForm] = Form.useForm();
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch all necessary data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Get all protocols
                const protocolsRes = await axios.get('http://localhost:8080/api/protocols');
                setProtocols(protocolsRes.data);

                // Get customers
                const customersRes = await axios.get('http://localhost:8080/api/customers');
                setCustomers(customersRes.data);

                // Get personnel
                const personnelRes = await axios.get('http://localhost:8080/api/personnel');
                setPersonnel(personnelRes.data);

                // Get statuses
                const statusesRes = await axios.get('http://localhost:8080/api/protocol-statuses');
                setStatuses(statusesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                message.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Load protocol details when a protocol is selected
    const loadProtocolDetails = async (protocol: Protocol) => {
        setSelectedProtocol(protocol);
        setDetailsModalVisible(true);

        try {
            // Get protocol history
            const historyRes = await axios.get(`http://localhost:8080/api/protocols/${protocol.protocol_id}/history`);
            setProtocolHistory(historyRes.data);

            // Get protocol attachments
            const attachmentsRes = await axios.get(`http://localhost:8080/api/protocols/${protocol.protocol_id}/attachments`);
            setProtocolAttachments(attachmentsRes.data);

            // Get protocol reminders
            const remindersRes = await axios.get(`http://localhost:8080/api/protocols/${protocol.protocol_id}/reminders`);
            setProtocolReminders(remindersRes.data);
        } catch (error) {
            console.error('Error loading protocol details:', error);
            message.error('Failed to load protocol details');
        }
    };

    // Handle protocol form submission
    const handleProtocolSubmit = async (values: any) => {
        try {
            if (isEditing && selectedProtocol) {
                // Update existing protocol
                await axios.put(`http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}`, values);
                message.success('Protocol updated successfully');

                // Update local state
                setProtocols(protocols.map(p =>
                    p.protocol_id === selectedProtocol.protocol_id ? { ...p, ...values } : p
                ));
            } else {
                // Create new protocol
                const response = await axios.post('http://localhost:8080/api/protocols', values);
                message.success('Protocol created successfully');

                // Add to local state
                setProtocols([...protocols, response.data]);
            }
            setProtocolModalVisible(false);
            protocolForm.resetFields();
        } catch (error) {
            console.error('Error saving protocol:', error);
            message.error('Failed to save protocol');
        }
    };

    // Handle reminder form submission
    const handleReminderSubmit = async (values: any) => {
        if (!selectedProtocol) return;

        try {
            const reminderData = {
                ...values,
                reminder_date: values.reminder_date.toISOString(),
                protocol_id: selectedProtocol.protocol_id,
            };

            const response = await axios.post(
                `http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}/reminders`,
                reminderData
            );

            message.success('Reminder added successfully');
            setProtocolReminders([...protocolReminders, response.data]);
            setReminderModalVisible(false);
            reminderForm.resetFields();
        } catch (error) {
            console.error('Error adding reminder:', error);
            message.error('Failed to add reminder');
        }
    };

    // Handle history form submission
    const handleHistorySubmit = async (values: any) => {
        if (!selectedProtocol) return;

        try {
            const historyData = {
                ...values,
                protocol_id: selectedProtocol.protocol_id,
                new_status_id: values.new_status_id,
                previous_status_id: selectedProtocol.status_id,
            };

            // Create history entry
            const response = await axios.post('http://localhost:8080/api/protocol-history', historyData);

            // Update protocol status
            await axios.put(`http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}`, {
                status_id: values.new_status_id
            });

            // Update local states
            setProtocolHistory([response.data, ...protocolHistory]);
            setProtocols(protocols.map(p =>
                p.protocol_id === selectedProtocol.protocol_id ? { ...p, status_id: values.new_status_id } : p
            ));

            // Update selected protocol
            setSelectedProtocol({
                ...selectedProtocol,
                status_id: values.new_status_id
            });

            message.success('Protocol status updated');
            setHistoryModalVisible(false);
            historyForm.resetFields();
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Failed to update status');
        }
    };

    // Handle file upload
    const handleFileUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;

        if (!selectedProtocol) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaded_by', '1'); // Replace with actual user ID from auth

        try {
            const response = await axios.post(
                `http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}/attachments`,
                formData
            );

            setProtocolAttachments([...protocolAttachments, response.data]);
            message.success('File uploaded successfully');
            onSuccess();
        } catch (error) {
            console.error('Error uploading file:', error);
            message.error('Failed to upload file');
            onError();
        }
    };

    // Handle marking a reminder as sent
    const handleMarkReminderSent = async (reminder: ProtocolReminder) => {
        try {
            await axios.put(`http://localhost:8080/api/reminders/${reminder.reminder_id}/mark-sent`);

            // Update local state
            setProtocolReminders(protocolReminders.map(r =>
                r.reminder_id === reminder.reminder_id ? { ...r, is_sent: true } : r
            ));

            message.success('Reminder marked as sent');
        } catch (error) {
            console.error('Error marking reminder as sent:', error);
            message.error('Failed to update reminder');
        }
    };

    // Handle reminder deletion
    const handleDeleteReminder = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/reminders/${id}`);
            setProtocolReminders(protocolReminders.filter(r => r.reminder_id !== id));
            message.success('Reminder deleted successfully');
        } catch (error) {
            console.error('Error deleting reminder:', error);
            message.error('Failed to delete reminder');
        }
    };

    // Handle attachment deletion
    const handleDeleteAttachment = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/attachments/${id}`);
            setProtocolAttachments(protocolAttachments.filter(a => a.attachment_id !== id));
            message.success('Attachment deleted successfully');
        } catch (error) {
            console.error('Error deleting attachment:', error);
            message.error('Failed to delete attachment');
        }
    };

    // Handle protocol deletion
    const handleDeleteProtocol = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/protocols/${id}`);
            setProtocols(protocols.filter(p => p.protocol_id !== id));
            message.success('Protocol deleted successfully');
        } catch (error) {
            console.error('Error deleting protocol:', error);
            message.error('Failed to delete protocol');
        }
    };

    // Open protocol modal for editing or creation
    const openProtocolModal = (protocol?: Protocol) => {
        if (protocol) {
            setIsEditing(true);
            setSelectedProtocol(protocol);
            protocolForm.setFieldsValue({
                ...protocol,
                date_required: protocol.date_required ? moment(protocol.date_required) : undefined,
                expected_completion: protocol.expected_completion ? moment(protocol.expected_completion) : undefined,
            });
        } else {
            setIsEditing(false);
            setSelectedProtocol(null);
            protocolForm.resetFields();
        }
        setProtocolModalVisible(true);
    };

    // Columns for the protocol table
    const columns = [
        {
            title: 'ID',
            dataIndex: 'protocol_id',
            key: 'protocol_id',
            width: '5%',
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: '20%',
        },
        {
            title: 'Customer',
            key: 'customer',
            width: '15%',
            render: (text: any, record: Protocol) => {
                const customer = customers.find(c => c.customer_id === record.customer_id);
                return customer ? `${customer.first_name} ${customer.last_name}` : 'N/A';
            }
        },
        {
            title: 'Assigned To',
            key: 'assigned_to',
            width: '15%',
            render: (text: any, record: Protocol) => {
                const person = personnel.find(p => p.personnel_id === record.assigned_to);
                return person ? `${person.first_name} ${person.last_name}` : 'Unassigned';
            }
        },
        {
            title: 'Status',
            key: 'status',
            width: '10%',
            render: (text: any, record: Protocol) => {
                const status = statuses.find(s => s.status_id === record.status_id);
                return (
                    <Tag color={status?.color || 'default'}>
                        {status?.status_name || 'Unknown'}
                    </Tag>
                );
            }
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: '10%',
            render: (priority: string) => (
                <Tag color={priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green'}>
                    {priority}
                </Tag>
            )
        },
        {
            title: 'Expected Completion',
            dataIndex: 'expected_completion',
            key: 'expected_completion',
            width: '15%',
            render: (date: string) => date ? moment(date).format('YYYY-MM-DD') : 'Not set'
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '10%',
            render: (text: any, record: Protocol) => (
                <div className="action-buttons">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => openProtocolModal(record)}
                        size="small"
                    />
                    <Button
                        type="default"
                        onClick={() => loadProtocolDetails(record)}
                        size="small"
                    >
                        Details
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this protocol?"
                        onConfirm={() => handleDeleteProtocol(record.protocol_id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        />
                    </Popconfirm>
                </div>
            )
        }
    ];

    return (
        <div className="protocol-page">
            <div className="page-header">
                <h1>Protocol Management</h1>
                <Button
                    type="primary"
                    onClick={() => openProtocolModal()}
                    icon={<PlusOutlined />}
                >
                    Add New Protocol
                </Button>
            </div>

            <Table
                dataSource={protocols}
                columns={columns}
                rowKey="protocol_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Protocol Form Modal */}
            <Modal
                title={isEditing ? 'Edit Protocol' : 'Add New Protocol'}
                open={protocolModalVisible}
                onCancel={() => setProtocolModalVisible(false)}
                footer={null}
                width={800}
            >
                <Form
                    form={protocolForm}
                    layout="vertical"
                    onFinish={handleProtocolSubmit}
                >
                    <Form.Item
                        name="title"
                        label="Title"
                        rules={[{ required: true, message: 'Please enter a title' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter a description' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="customer_id"
                        label="Customer"
                        rules={[{ required: true, message: 'Please select a customer' }]}
                    >
                        <Select placeholder="Select a customer">
                            {customers.map(customer => (
                                <Select.Option key={customer.customer_id} value={customer.customer_id}>
                                    {customer.first_name} {customer.last_name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="assigned_to"
                        label="Assigned To"
                        rules={[{ required: true, message: 'Please select a staff member' }]}
                    >
                        <Select placeholder="Select staff member">
                            {personnel.map(person => (
                                <Option key={person.personnel_id} value={person.personnel_id}>
                                    {person.first_name} {person.last_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="status_id"
                        label="Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select placeholder="Select status">
                            {statuses.map(status => (
                                <Option key={status.status_id} value={status.status_id}>
                                    {status.status_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Priority"
                        rules={[{ required: true, message: 'Please select a priority' }]}
                    >
                        <Select placeholder="Select priority">
                            <Option value="Low">Low</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="High">High</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date_required"
                        label="Date Required"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="expected_completion"
                        label="Expected Completion Date"
                    >
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setProtocolModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {isEditing ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Protocol Details Modal */}
            <Modal
                title="Protocol Details"
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={null}
                width={1000}
            >
                {selectedProtocol && (
                    <Tabs defaultActiveKey="details">
                        <TabPane tab="Basic Information" key="details">
                            <div className="protocol-details">
                                <Card>
                                    <h2>{selectedProtocol.title}</h2>
                                    <p><strong>Description:</strong> {selectedProtocol.description}</p>
                                    <div className="detail-row">
                                        <div>
                                            <p><strong>Customer:</strong> {
                                                customers.find(c => c.customer_id === selectedProtocol.customer_id)
                                                    ? `${customers.find(c => c.customer_id === selectedProtocol.customer_id)!.first_name} 
                                           ${customers.find(c => c.customer_id === selectedProtocol.customer_id)!.last_name}`
                                                    : 'N/A'
                                            }</p>
                                            <p><strong>Assigned To:</strong> {
                                                personnel.find(p => p.personnel_id === selectedProtocol.assigned_to)
                                                    ? `${personnel.find(p => p.personnel_id === selectedProtocol.assigned_to)!.first_name} 
                                           ${personnel.find(p => p.personnel_id === selectedProtocol.assigned_to)!.last_name}`
                                                    : 'Unassigned'
                                            }</p>
                                        </div>
                                        <div>
                                            <p><strong>Status:</strong> <Tag color={
                                                statuses.find(s => s.status_id === selectedProtocol.status_id)?.color || 'default'
                                            }>
                                                {statuses.find(s => s.status_id === selectedProtocol.status_id)?.status_name || 'Unknown'}
                                            </Tag></p>
                                            <p><strong>Priority:</strong> <Tag color={
                                                selectedProtocol.priority === 'High' ? 'red' :
                                                    selectedProtocol.priority === 'Medium' ? 'orange' : 'green'
                                            }>
                                                {selectedProtocol.priority}
                                            </Tag></p>
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div>
                                            <p><strong>Date Required:</strong> {
                                                selectedProtocol.date_required
                                                    ? moment(selectedProtocol.date_required).format('YYYY-MM-DD')
                                                    : 'Not specified'
                                            }</p>
                                        </div>
                                        <div>
                                            <p><strong>Expected Completion:</strong> {
                                                selectedProtocol.expected_completion
                                                    ? moment(selectedProtocol.expected_completion).format('YYYY-MM-DD')
                                                    : 'Not specified'
                                            }</p>
                                        </div>
                                    </div>
                                    <div className="detail-actions">
                                        <Button
                                            type="primary"
                                            onClick={() => setHistoryModalVisible(true)}
                                        >
                                            Update Status
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </TabPane>

                        <TabPane tab="History" key="history">
                            <List
                                dataSource={protocolHistory}
                                renderItem={item => (
                                    <List.Item>
                                        <Card style={{ width: '100%' }}>
                                            <div className="history-item">
                                                <div>
                                                    <p>
                                                        Status changed from {' '}
                                                        <Tag color={item.previous_status?.color || 'default'}>
                                                            {item.previous_status?.status_name || 'N/A'}
                                                        </Tag>
                                                        {' '} to {' '}
                                                        <Tag color={item.new_status?.color || 'default'}>
                                                            {item.new_status?.status_name || 'N/A'}
                                                        </Tag>
                                                    </p>
                                                    {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                                                </div>
                                                <div>
                                                    <p>
                                                        By: {item.created_by_agent?.first_name} {item.created_by_agent?.last_name}
                                                    </p>
                                                    <p>
                                                        {moment(item.created_at).format('YYYY-MM-DD HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </List.Item>
                                )}
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPane>

                        <TabPane tab="Attachments" key="attachments">
                            <div className="attachments-section">
                                <Upload
                                    customRequest={handleFileUpload}
                                    showUploadList={false}
                                >
                                    <Button icon={<UploadOutlined />}>Upload File</Button>
                                </Upload>

                                <List
                                    dataSource={protocolAttachments}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Popconfirm
                                                    title="Are you sure you want to delete this file?"
                                                    onConfirm={() => handleDeleteAttachment(item.attachment_id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                                </Popconfirm>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                icon={<FileOutlined />}
                                                title={item.file_name}
                                                description={`Uploaded by ${item.uploaded_by_agent?.first_name} ${item.uploaded_by_agent?.last_name} on ${moment(item.uploaded_at).format('YYYY-MM-DD HH:mm')}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </TabPane>

                        <TabPane tab="Reminders" key="reminders">
                            <div className="reminders-section">
                                <Button
                                    type="primary"
                                    onClick={() => setReminderModalVisible(true)}
                                    icon={<BellOutlined />}
                                    style={{ marginBottom: '16px' }}
                                >
                                    Add Reminder
                                </Button>

                                <List
                                    dataSource={protocolReminders}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                !item.is_sent && (
                                                    <Button
                                                        type="primary"
                                                        icon={<CheckOutlined />}
                                                        size="small"
                                                        onClick={() => handleMarkReminderSent(item)}
                                                    >
                                                        Mark Sent
                                                    </Button>
                                                ),
                                                <Popconfirm
                                                    title="Are you sure you want to delete this reminder?"
                                                    onConfirm={() => handleDeleteReminder(item.reminder_id)}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                                </Popconfirm>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<ClockCircleOutlined style={{ fontSize: 24 }} />}
                                                title={
                                                    <span>
                                            {moment(item.reminder_date).format('YYYY-MM-DD HH:mm')}
                                                        {item.is_sent ?
                                                            <Tag color="green" style={{ marginLeft: 8 }}>Sent</Tag> :
                                                            <Tag color="orange" style={{ marginLeft: 8 }}>Pending</Tag>
                                                        }
                                        </span>
                                                }
                                                description={item.reminder_message}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </TabPane>
                    </Tabs>
                )}
            </Modal>

            {/* Add Reminder Modal */}
            <Modal
                title="Add Reminder"
                open={reminderModalVisible}
                onCancel={() => setReminderModalVisible(false)}
                footer={null}
            >
                <Form
                    form={reminderForm}
                    layout="vertical"
                    onFinish={handleReminderSubmit}
                >
                    <Form.Item
                        name="reminder_date"
                        label="Reminder Date"
                        rules={[{ required: true, message: 'Please select a date and time' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="reminder_message"
                        label="Message"
                        rules={[{ required: true, message: 'Please enter a reminder message' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="created_by"
                        label="Created By"
                        initialValue={1} // Replace with actual user ID
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setReminderModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Add Reminder
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                title="Update Protocol Status"
                open={historyModalVisible}
                onCancel={() => setHistoryModalVisible(false)}
                footer={null}
            >
                <Form
                    form={historyForm}
                    layout="vertical"
                    onFinish={handleHistorySubmit}
                >
                    <Form.Item
                        name="new_status_id"
                        label="New Status"
                        rules={[{ required: true, message: 'Please select a status' }]}
                    >
                        <Select placeholder="Select new status">
                            {statuses.map(status => (
                                <Option key={status.status_id} value={status.status_id}>
                                    {status.status_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Notes"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="created_by"
                        label="Updated By"
                        initialValue={1} // Replace with actual user ID
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setHistoryModalVisible(false)}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Update Status
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProtocolPage;