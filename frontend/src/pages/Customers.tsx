// src/pages/Customer.tsx
import React, { useState, useEffect } from 'react';
import { Customer, Branch } from '../types/types';
import axios from 'axios';
import { Button, Form, Input, Modal, Select, Table, message, Switch } from 'antd';import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../styles/Customer.css';

const CustomerPage: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
    const [form] = Form.useForm();

    // Fetch customers and branches data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                try {
                    const branchesRes = await axios.get('http://localhost:8080/api/branches');
                    setBranches(branchesRes.data);
                } catch (error) {
                    console.error('Error fetching branches:', error);
                    message.warning('Could not load branch data');
                    setBranches([]);
                }

                try {
                    const customersRes = await axios.get('http://localhost:8080/api/customers');
                    setCustomers(customersRes.data);
                } catch (error) {
                    console.error('Error fetching customers:', error);
                    message.error('Could not load customer data');
                    setCustomers([]);
                }

                setLoading(false);
            } catch (error) {
                console.error('Error in fetchData:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOpenModal = (record?: Customer) => {
        if (record) {
            setIsEditing(true);
            setCurrentCustomer(record);
            form.setFieldsValue({
                ...record,
                branch_id: record.branch_id || undefined
            });
        } else {
            setIsEditing(false);
            setCurrentCustomer(null);
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
            if (isEditing && currentCustomer) {
                await axios.put(`http://localhost:8080/api/customers/${currentCustomer.customer_id}`, values);
                message.success('Customer updated successfully');

                // Update local state
                setCustomers(customers.map(c =>
                    c.customer_id === currentCustomer.customer_id ? { ...c, ...values } : c
                ));
            } else {
                const response = await axios.post('http://localhost:8080/api/customers', values);
                message.success('Customer added successfully');

                // Add to local state
                setCustomers([...customers, response.data]);
            }

            handleCloseModal();
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Operation failed');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/customers/${id}`);
            message.success('Customer deleted successfully');

            // Update local state
            setCustomers(customers.filter(c => c.customer_id !== id));
        } catch (error) {
            console.error('Error deleting customer:', error);
            message.error('Delete failed');
        }
    };

    const toggleActive = async (record: Customer) => {
        try {
            const updatedRecord = { ...record, active: !record.active };
            await axios.put(`http://localhost:8080/api/customers/${record.customer_id}`, updatedRecord);

            // Update local state
            setCustomers(customers.map(c =>
                c.customer_id === record.customer_id ? { ...c, active: !c.active } : c
            ));

            message.success(`Customer ${updatedRecord.active ? 'activated' : 'deactivated'} successfully`);
        } catch (error) {
            console.error('Error updating status:', error);
            message.error('Status update failed');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'customer_id',
            key: 'customer_id',
        },
        {
            title: 'Name',
            key: 'name',
            render: (text: any, record: Customer) => `${record.first_name} ${record.last_name}`
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
            title: 'Address',
            key: 'address',
            render: (text: any, record: Customer) =>
                `${record.address || ''}, ${record.city || ''}, ${record.state || ''} ${record.postal_code || ''}`
        },
        {
            title: 'Branch',
            key: 'branch',
            render: (text: any, record: Customer) => {
                const branch = branches.find(b => b.branch_id === record.branch_id);
                return branch ? branch.branch_name : 'Not Assigned';
            }
        },
        {
            title: 'Status',
            key: 'status',
            render: (text: any, record: Customer) => (
                <span className={record.active ? 'status-active' : 'status-inactive'}>
                    {record.active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: Customer) => (
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
                        onClick={() => handleDelete(record.customer_id)}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="customer-page">
            <div className="page-header">
                <h1>Clientes</h1>
                <Button
                    type="primary"
                    onClick={() => handleOpenModal()}
                >
                    Add New Customer
                </Button>
            </div>

            <Table
                dataSource={customers}
                columns={columns}
                rowKey="customer_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={isEditing ? 'Edit Customer' : 'Add New Customer'}
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
                        name="address"
                        label="Address"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="city"
                        label="City"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="state"
                        label="State"
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="postal_code"
                        label="Postal Code"
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
                            options={branches.map(branch => ({
                                value: branch.branch_id,
                                label: branch.branch_name
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="active"
                        label="Active"
                        valuePropName="checked"
                        initialValue={true}
                    >
                        <Switch />
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

export default CustomerPage;