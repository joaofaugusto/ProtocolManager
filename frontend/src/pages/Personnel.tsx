// src/pages/Personnel.tsx
import React, { useState, useEffect } from 'react';
import { Personnel, Branch } from '../types/types';
import axios from 'axios';
import { Button, Checkbox, Form, Input, Modal, Select, Table, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../styles/Personnel.css';
const { Option } = Select;

const PersonnelPage: React.FC = () => {
    const [personnel, setPersonnel] = useState([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentPersonnel, setCurrentPersonnel] = useState<Personnel | null>(null);
    const [form] = Form.useForm();

    // Fetch personnel and branches data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [personnelResponse, branchesResponse] = await Promise.all([
                    fetch('http://localhost:8080/api/personnel'),  // Use full URL with port
                    fetch('http://localhost:8080/api/branches')    // Use full URL with port
                ]);

                // Check for success before parsing JSON
                if (!personnelResponse.ok || !branchesResponse.ok) {
                    throw new Error('One or more API requests failed');
                }

                const personnelData = await personnelResponse.json();
                const branchesData = await branchesResponse.json();

                setPersonnel(personnelData);
                setBranches(branchesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOpenModal = (record?: Personnel) => {
        if (record) {
            setIsEditing(true);
            setCurrentPersonnel(record);
            form.setFieldsValue({
                ...record,
                branch_id: record.branch_id || undefined
            });
        } else {
            setIsEditing(false);
            setCurrentPersonnel(null);
            form.resetFields();
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        form.resetFields();
    };

    const handleSubmit = async (values: any) => {
        try {
            if (isEditing && currentPersonnel) {
                await axios.put(`http://localhost:8080/api/personnel/${currentPersonnel.personnel_id}`, values);
                message.success('Personnel updated successfully');

                // Update local state
                setPersonnel(personnel.map(p =>
                    p.personnel_id === currentPersonnel.personnel_id ? { ...p, ...values } : p
                ));
            } else {
                const response = await axios.post('http://localhost:8080/api/personnel', values);
                message.success('Personnel added successfully');

                // Add to local state
                setPersonnel([...personnel, response.data]);
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/personnel/${id}`);
            message.success('Personnel deleted successfully');

            // Update local state
            setPersonnel(personnel.filter(p => p.personnel_id !== id));
        } catch (error) {
            console.error('Error deleting personnel:', error);
            message.error('Delete failed');
        }
    };

    const toggleActive = async (record: Personnel) => {
        try {
            const updatedRecord = { ...record, active: !record.active };
            await axios.put(`http://localhost:8080/api/personnel/${record.personnel_id}`, updatedRecord);

            // Update local state
            setPersonnel(personnel.map(p =>
                p.personnel_id === record.personnel_id ? { ...p, active: !p.active } : p
            ));

            message.success(`Personnel ${updatedRecord.active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Status update failed');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'personnel_id',
            key: 'personnel_id',
        },
        {
            title: 'Name',
            key: 'name',
            render: (text: any, record: Personnel) => `${record.first_name} ${record.last_name}`
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'Branch',
            key: 'branch',
            render: (text: any, record: Personnel) => {
                const branch = branches.find(b => b.branch_id === record.branch_id);
                return branch ? branch.branch_name : 'Not Assigned';
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (text: any, record: Personnel) => (
                <span className={record.active ? 'status-active' : 'status-inactive'}>
                    {record.active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: Personnel) => (
                <div className="action-buttons">
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenModal(record)}
                    />
                    <Button
                        onClick={() => toggleActive(record)}
                        type={record.active ? 'default' : 'primary'}
                    >
                        {record.active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(record.personnel_id)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="personnel-page">
            <div className="page-header">
                <h1>Corretores</h1>
                <Button
                    type="primary"
                    onClick={() => handleOpenModal()}
                >
                    Add New Personnel
                </Button>
            </div>

            <Table
                dataSource={personnel}
                columns={columns}
                rowKey="personnel_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={isEditing ? 'Edit Personnel' : 'Add New Personnel'}
                open={modalOpen}
                onCancel={handleCloseModal}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="first_name"
                        label="First Name"
                        rules={[{ required: true, message: 'Please enter first name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="last_name"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please enter last name' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Please enter email address' },
                            { type: 'email', message: 'Please enter a valid email' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="Phone"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="branch_id"
                        label="Branch"
                    >
                        <Select
                            placeholder="Select branch"
                            allowClear
                        >
                            {branches.map(branch => (
                                <Option key={branch.branch_id} value={branch.branch_id}>
                                    {branch.branch_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="active"
                        valuePropName="checked"
                    >
                        <Checkbox>Active</Checkbox>
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={handleCloseModal}>Cancel</Button>
                        <Button type="primary" htmlType="submit">
                            {isEditing ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default PersonnelPage;