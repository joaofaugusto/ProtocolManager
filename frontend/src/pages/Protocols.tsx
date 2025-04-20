// src/pages/Protocols.tsx
import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, DatePicker,
    Tabs, Upload, message, List, Tag, Card, ConfigProvider, Popconfirm
} from 'antd';
import {
    EditOutlined, DeleteOutlined, PlusOutlined,
    UploadOutlined, FileOutlined, ClockCircleOutlined,
    BellOutlined, InboxOutlined, CheckOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { Protocol, Customer, Personnel, ProtocolStatus, ProtocolHistory, ProtocolAttachment, ProtocolReminder } from '../types/types';
import '../styles/Protocol.css';
import { Select } from 'antd';
import ptBR from 'antd/locale/pt_BR';
import 'dayjs/locale/pt-br';


const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

// Add this function to handle file viewing
const handleViewFile = (attachmentId: number, fileName: string) => {
    const fileUrl = `http://localhost:8080/api/attachments/${attachmentId}/download`;
    window.open(fileUrl, '_blank');
};

const getDefaultColorForStatus = (statusName: string): string => {
    const map: Record<string, string> = {
        'New': 'blue',
        'In Progress': 'cyan',
        'Awaiting Information': 'orange',
        'Under Review': 'purple',
        'Approved': 'green',
        'Rejected': 'red',
        'Completed': 'green',
        'Cancelled': 'gray',
    };
    const lower = statusName.toLowerCase();
    return map[lower] || 'default';
};

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
    const filteredStatuses = statuses.filter(status => status != null);

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
                setProtocols(protocolsRes.data as Protocol[]);

                // Get customers
                const customersRes = await axios.get('http://localhost:8080/api/customers');
                setCustomers(customersRes.data as Customer[]);

                // Get personnel
                const personnelRes = await axios.get('http://localhost:8080/api/personnel');
                setPersonnel(personnelRes.data as Personnel[]);

                // Get statuses
                const statusesRes = await axios.get('http://localhost:8080/api/protocol-statuses');
                const transformedStatuses = statusesRes.data.map((status: any) => ({
                    ...status,
                    color: status.color || getDefaultColorForStatus(status.status_name)
                }));

                setStatuses(transformedStatuses);
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
            // Convert string IDs to integers for Go backend
            const processedValues = {
                ...values,
                status_id: parseInt(values.status_id, 10) || 0,
                customer_id: parseInt(values.customer_id, 10),
                assigned_to: parseInt(values.assigned_to, 10)
            };

            if (isEditing && selectedProtocol) {
                // Update existing protocol
                await axios.put(`http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}`, processedValues);
                message.success('Protocolo atualizado com sucesso!');

                // Update local state
                setProtocols(protocols.map(p =>
                    p.protocol_id === selectedProtocol.protocol_id ? { ...p, ...processedValues } : p
                ));
            } else {
                // Create new protocol
                const response = await axios.post('http://localhost:8080/api/protocols', processedValues);
                message.success('Protocolo criado com sucesso!');

                // Add to local state
                setProtocols([...protocols, response.data]);
            }
            setProtocolModalVisible(false);
            protocolForm.resetFields();
        } catch (error) {
            console.error('Erro ao salvar protocolo:', error);
            message.error('Falha ao salvar protocolo');
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

            message.success('Lembrete adicionado com sucesso!');
            setProtocolReminders([...protocolReminders, response.data]);
            setReminderModalVisible(false);
            reminderForm.resetFields();
        } catch (error) {
            console.error('Erro ao adicionar lembrete:', error);
            message.error('Falha ao adicionar lembrete');
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

            message.success('Status do protocolo atualizado');
            setHistoryModalVisible(false);
            historyForm.resetFields();
        } catch (error) {
            console.error('Erro ao atualizar status do protocolo:', error);
            message.error('Falha ao atualizar status');
        }
    };

    // Handle file upload
    const handleFileUpload = async (options: any) => {
        const { file, onSuccess, onError } = options;

        if (!selectedProtocol) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('uploaded_by', '2'); // Replace with actual user ID from auth

        try {
            const response = await axios.post(
                `http://localhost:8080/api/protocols/${selectedProtocol.protocol_id}/attachments`,
                formData
            );

            setProtocolAttachments([...protocolAttachments, response.data]);
            message.success('Arquivo adicionado com sucesso!');
            onSuccess();
        } catch (error) {
            console.error('Erro ao adicionar arquivo:', error);
            message.error('Falha ao adicionar arquivo');
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

            message.success('Lembrete marcado como concluído');
        } catch (error) {
            console.error('Erro ao marcar o lembrete como concluído:', error);
            message.error('Falha ao atualizar lembrete');
        }
    };

    // Handle reminder deletion
    const handleDeleteReminder = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/reminders/${id}`);
            setProtocolReminders(protocolReminders.filter(r => r.reminder_id !== id));
            message.success('Lembrete removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover lembrete:', error);
            message.error('Falha ao remover lembrete');
        }
    };

    // Handle attachment deletion
    const handleDeleteAttachment = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/attachments/${id}`);
            setProtocolAttachments(protocolAttachments.filter(a => a.attachment_id !== id));
            message.success('Arquivo removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover arquivo:', error);
            message.error('Falha ao remover arquivo');
        }
    };

    // Handle protocol deletion
    const handleDeleteProtocol = async (id: number) => {
        try {
            await axios.delete(`http://localhost:8080/api/protocols/${id}`);
            setProtocols(protocols.filter(p => p.protocol_id !== id));
            message.success('Protocolo removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover protocolo:', error);
            message.error('Falha ao remover protocolo');
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
            title: 'Título',
            dataIndex: 'title',
            key: 'title',
            width: '20%',
        },
        {
            title: 'Cliente',
            key: 'customer',
            width: '15%',
            render: (text: any, record: Protocol) => {
                const customer = customers.find(c => c.customer_id === record.customer_id);
                return customer ? `${customer.first_name} ${customer.last_name}` : 'N/A';
            }
        },
        {
            title: 'Responsável',
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
            title: 'Prioridade',
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
            title: 'Data de Conclusão Esperada',
            dataIndex: 'expected_completion',
            key: 'expected_completion',
            width: '15%',
            render: (date: string) => date ? moment(date).format('DD/MM/YYYY') : 'Not set'
        },
        {
            title: 'Ações',
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
                        Detalhes
                    </Button>
                    <Popconfirm
                        title="Você tem certeza que deseja remover este protocolo?"
                        onConfirm={() => handleDeleteProtocol(record.protocol_id)}
                        okText="Sim"
                        cancelText="Não"
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
                <h1>Protocolos</h1>
                <Button
                    type="primary"
                    onClick={() => openProtocolModal()}
                    icon={<PlusOutlined />}
                >
                    Adicionar
                </Button>
            </div>

            <Table
                dataSource={protocols}
                columns={columns}
                rowKey="protocol_id"
                locale={{
                    emptyText: (
                        <div style={{ textAlign: 'center' }}>
                            <InboxOutlined style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }} />
                            <div>Nenhum dado encontrado</div>
                        </div>
                    )
                }}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Protocol Form Modal */}
            <Modal
                title={isEditing ? 'Editar Protocolo' : 'Adicionar'}
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
                        label="Título"
                        rules={[{ required: true, message: 'Por favor insira um título' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Descrição"
                        rules={[{ required: true, message: 'Por favor insira uma descrição' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="customer_id"
                        label="Cliente"
                        rules={[{ required: true, message: 'Por favor selecione um cliente' }]}
                    >
                        <Select placeholder="Selecione um cliente">
                            {customers.map(customer => (
                                <Option key={customer.customer_id} value={customer.customer_id}>
                                    {customer.first_name} {customer.last_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="assigned_to"
                        label="Responsável"
                        rules={[{ required: true, message: 'Por favor selecione um responsável' }]}
                    >
                        <Select placeholder="Selecione um responsável">
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
                        rules={[{ required: true, message: 'Por favor selecione um status' }]}
                    >
                        <Select placeholder="Selecione um Status">
                            {filteredStatuses.map(status => (
                                <Option
                                    key={status.status_id || `status-${Math.random()}`}
                                    value={status.status_id || undefined}
                                >
                                    {status.status_name || 'Unknown'}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="priority"
                        label="Prioridade"
                        rules={[{ required: true, message: 'Por favor selecione uma prioridade' }]}
                    >
                        <Select placeholder="Selecione a prioridade">
                            <Option value="Low">Baixa</Option>
                            <Option value="Medium">Média</Option>
                            <Option value="High">Alta</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date_required"
                        label="Data da Solicitação"
                    >
                        <ConfigProvider locale={ptBR}>
                            <DatePicker
                                placeholder="Selecione uma data"
                                style={{ width: '100%' }}
                            />
                        </ConfigProvider>
                    </Form.Item>

                    <Form.Item
                        name="expected_completion"
                        label="Data de Conclusão Esperada"
                    >
                        <ConfigProvider locale={ptBR}>
                            <DatePicker
                                placeholder="Selecione uma data"
                                style={{ width: '100%' }}
                            />
                        </ConfigProvider>
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setProtocolModalVisible(false)}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {isEditing ? 'Atualizar' : 'Criar'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Protocol Details Modal */}
            <Modal
                title="Detalhes do Protocolo"
                open={detailsModalVisible}
                onCancel={() => setDetailsModalVisible(false)}
                footer={null}
                width={1000}
            >
                {selectedProtocol && (
                    <Tabs defaultActiveKey="details">
                        <TabPane tab="Informações Básicas" key="details">
                            <div className="protocol-details">
                                <Card>
                                    <h2>{selectedProtocol.title}</h2>
                                    <p><strong>Descrição:</strong> {selectedProtocol.description}</p>
                                    <div className="detail-row">
                                        <div>
                                            <p><strong>Cliente:</strong> {
                                                customers.find(c => c.customer_id === selectedProtocol.customer_id)
                                                    ? `${customers.find(c => c.customer_id === selectedProtocol.customer_id)!.first_name} 
                                           ${customers.find(c => c.customer_id === selectedProtocol.customer_id)!.last_name}`
                                                    : 'N/A'
                                            }</p>
                                            <p><strong>Responsável:</strong> {
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
                                            <p><strong>Prioridade:</strong> <Tag color={
                                                selectedProtocol.priority === 'High' ? 'red' :
                                                    selectedProtocol.priority === 'Medium' ? 'orange' : 'green'
                                            }>
                                                {selectedProtocol.priority}
                                            </Tag></p>
                                        </div>
                                    </div>
                                    <div className="detail-row">
                                        <div>
                                            <p><strong>Data da Solicitação:</strong> {
                                                selectedProtocol.date_required
                                                    ? moment(selectedProtocol.date_required).format('DD/MM/YYYY')
                                                    : 'Not specified'
                                            }</p>
                                        </div>
                                        <div>
                                            <p><strong>Data da Conclusão Esperada:</strong> {
                                                selectedProtocol.expected_completion
                                                    ? moment(selectedProtocol.expected_completion).format('DD/MM/YYYY')
                                                    : 'Not specified'
                                            }</p>
                                        </div>
                                    </div>
                                    <div className="detail-actions">
                                        <Button
                                            type="primary"
                                            onClick={() => setHistoryModalVisible(true)}
                                        >
                                            Atualizar Status
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </TabPane>

                        <TabPane tab="Histórico" key="history">
                            <List
                                dataSource={protocolHistory}
                                locale={{
                                    emptyText: (
                                        <div style={{ textAlign: 'center' }}>
                                            <InboxOutlined style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }} />
                                            <div>Nenhum dado encontrado</div>
                                        </div>
                                    )
                                }}
                                renderItem={item => (
                                    <List.Item>
                                        <Card style={{ width: '100%' }}>
                                            <div className="history-item">
                                                <div>
                                                    <p>
                                                        Status atualizado de {' '}
                                                        <Tag color={item.previous_status?.color || 'default'}>
                                                            {item.previous_status?.status_name || 'N/A'}
                                                        </Tag>
                                                        {' '} para {' '}
                                                        <Tag color={item.new_status?.color || 'default'}>
                                                            {item.new_status?.status_name || 'N/A'}
                                                        </Tag>
                                                    </p>
                                                    {item.notes && <p><strong>Notes:</strong> {item.notes}</p>}
                                                </div>
                                                <div>
                                                    <p>
                                                        Por: {item.created_by_agent?.first_name} {item.created_by_agent?.last_name}
                                                    </p>
                                                    <p>
                                                        {moment(item.created_at).format('DD/MM/YYYY HH:mm')}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </List.Item>
                                )}
                                pagination={{ pageSize: 5 }}
                            />
                        </TabPane>

                        <TabPane tab="Arquivos" key="attachments">
                            <div className="attachments-section">
                                <Upload
                                    customRequest={handleFileUpload}
                                    showUploadList={false}
                                >
                                    <Button icon={<UploadOutlined />}>Adicionar Arquivo</Button>
                                </Upload>

                                <List
                                    dataSource={protocolAttachments}
                                    locale={{
                                        emptyText: (
                                            <div style={{ textAlign: 'center' }}>
                                                <InboxOutlined style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }} />
                                                <div>Nenhum dado encontrado</div>
                                            </div>
                                        )
                                    }}
                                    renderItem={item => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    type="primary"
                                                    icon={<FileOutlined />}
                                                    size="small"
                                                    onClick={() => handleViewFile(item.attachment_id, item.file_name)}
                                                >
                                                    Baixar
                                                </Button>,
                                                <Popconfirm
                                                    title="Você tem certeza que deseja remover este arquivo?"
                                                    onConfirm={() => handleDeleteAttachment(item.attachment_id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                                </Popconfirm>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                icon={<FileOutlined />}
                                                title={item.file_name}
                                                description={`Adicionado por ${item.uploaded_by_agent?.first_name} ${item.uploaded_by_agent?.last_name} em ${moment(item.uploaded_at).format('DD/MM/YYYY HH:mm')}`}
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </TabPane>

                        <TabPane tab="Lembretes" key="reminders">
                            <div className="reminders-section">
                                <Button
                                    type="primary"
                                    onClick={() => setReminderModalVisible(true)}
                                    icon={<BellOutlined />}
                                    style={{ marginBottom: '16px' }}
                                >
                                    Adicionar Lembrete
                                </Button>

                                <List
                                    dataSource={protocolReminders}
                                    locale={{
                                        emptyText: (
                                            <div style={{ textAlign: 'center' }}>
                                                <InboxOutlined style={{ fontSize: 28, color: '#ccc', marginBottom: 8 }} />
                                                <div>Nenhum dado encontrado</div>
                                            </div>
                                        )
                                    }}
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
                                                        Marcar como Concluído
                                                    </Button>
                                                ),
                                                <Popconfirm
                                                    title="Você tem certeza que deseja remover este lembrete?"
                                                    onConfirm={() => handleDeleteReminder(item.reminder_id)}
                                                    okText="Sim"
                                                    cancelText="Não"
                                                >
                                                    <Button danger icon={<DeleteOutlined />} size="small" />
                                                </Popconfirm>
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<ClockCircleOutlined style={{ fontSize: 24 }} />}
                                                title={
                                                    <span>
                                            {moment(item.reminder_date).format('DD/MM/YYYY HH:mm')}
                                                        {item.is_sent ?
                                                            <Tag color="green" style={{ marginLeft: 8 }}>Concluído</Tag> :
                                                            <Tag color="orange" style={{ marginLeft: 8 }}>Pendente</Tag>
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
                title="Adicionar Lembrete"
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
                        label="Data do Lembrete"
                        rules={[{ required: true, message: 'Por favor escolha uma data e um horário' }]}
                    >
                        <DatePicker showTime style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="reminder_message"
                        label="Mensagem"
                        rules={[{ required: true, message: 'Por favor escreva a mensagem do lembrete' }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="created_by"
                        label="Criado por"
                        initialValue={2} // Replace with actual user ID
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setReminderModalVisible(false)}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Adicionar Lembrete
                        </Button>
                    </div>
                </Form>
            </Modal>

            {/* Update Status Modal */}
            <Modal
                title="Atualizar Status do Protocolo"
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
                        label="Novo Status"
                        rules={[{ required: true, message: 'Por favor selecione um status' }]}
                    >
                        <Select placeholder="Selecione o novo Status">
                            {statuses.map(status => (
                                <Option key={status.status_id} value={status.status_id}>
                                    {status.status_name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="notes"
                        label="Anotações"
                    >
                        <TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        name="created_by"
                        label="Atualizado por"
                        initialValue={2} // Replace with actual user ID
                        hidden={true}
                    >
                        <Input />
                    </Form.Item>

                    <div className="form-actions">
                        <Button onClick={() => setHistoryModalVisible(false)}>
                            Cancelar
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Atualizar Status
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default ProtocolPage;