import { useState, useEffect } from 'react';
import { Card, Input, Button, Form, Typography, message, Avatar, Modal, Tooltip, Divider, Space } from 'antd';
import {
    LockOutlined,
    MailOutlined,
    LoginOutlined,
    UserAddOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    CloseCircleOutlined,
    GoogleOutlined,
    FacebookOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Logo = () => (
    <svg width="200" height="40" viewBox="0 0 300 40" className="text-center mb-6">
        <rect width="40" height="40" rx="8" fill="#1890ff" />
        <text x="50" y="28" fontFamily="Arial" fontSize="24" fontWeight="bold" fill="#1890ff">
            ProtocolManager
        </text>
    </svg>
);

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [lastEmail, setLastEmail] = useState<string | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [recentUsers, setRecentUsers] = useState<{ email: string; avatar: string }[]>([]);
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    useEffect(() => {
        const savedEmail = localStorage.getItem('last_email');
        if (savedEmail) {
            setLastEmail(savedEmail);
            form.setFieldsValue({ email: savedEmail });
        }
        const savedUsers = localStorage.getItem('recent_users');
        if (savedUsers) {
            const parsed = JSON.parse(savedUsers);
            if (Array.isArray(parsed)) {
                setRecentUsers(parsed.slice(0, 3));
            }
        }
    }, [form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            if (isRegistering) {
                const response = await axios.post(`${API_BASE}/api/login`, values);
                message.success('Cadastro realizado com sucesso!');
                setIsRegistering(false);
            } else {
                const response = await axios.post(`${API_BASE}/api/login`, values);
                const { token, user } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('last_email', values.email);
                // Atualiza lista de usuários recentes
                const newUser = {
                    email: values.email,
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        values.email.split('@')[0]
                    )}&background=random`
                };
                const currentUsers = JSON.parse(localStorage.getItem('recent_users') || '[]');
                const updatedUsers = [newUser, ...currentUsers.filter((u: any) => u.email !== newUser.email)].slice(0, 3);
                localStorage.setItem('recent_users', JSON.stringify(updatedUsers));
                message.success(`Bem-vindo, ${user.email}`);
                navigate('/protocols');
            }
        } catch (error: any) {
            message.error(error.response?.data?.error || 'Ocorreu um erro.');
        } finally {
            setLoading(false);
        }
    };

    const handleUseLastEmail = (email: string) => {
        form.setFieldsValue({ email });
        message.info(`Usando o login: ${email}`);
    };

    const handleRemoveUser = (e: React.MouseEvent, email: string) => {
        e.stopPropagation(); // Impede o clique de propagar para o avatar
        const currentUsers = JSON.parse(localStorage.getItem('recent_users') || '[]');
        const updatedUsers = currentUsers.filter((user: any) => user.email !== email);
        localStorage.setItem('recent_users', JSON.stringify(updatedUsers));
        setRecentUsers(updatedUsers);
        message.success(`Usuário ${email} removido dos logins recentes`);
    };

    const handleClearEmail = () => {
        form.setFieldsValue({ email: '' });
        form.validateFields(['email']);
    };

    // Variações para efeitos de entrada e saída
    const containerVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
        exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
    };

    const formVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.2 } },
        exit: { opacity: 0, x: 30, transition: { duration: 0.3 } }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4"
             style={{
                 backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
                 backgroundSize: 'cover'
             }}>
            <motion.div
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="w-full max-w-md"
            >
                <Card className="shadow-2xl rounded-2xl p-6 w-full overflow-hidden"
                      bordered={false}
                      style={{ boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                >
                    <Logo />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isRegistering ? 'register' : 'login'}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={formVariants}
                        >
                            <Title level={3} className="text-center mb-4">
                                {isRegistering ? 'Crie sua Conta' : 'Bem-vindo de volta'}
                            </Title>

                            {!isRegistering && recentUsers.length > 0 && (
                                <div className="mb-6">
                                    <Text className="text-gray-500 text-center block mb-2">Logins recentes</Text>
                                    <div className="flex justify-center gap-6" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                        {recentUsers.map((user) => (
                                            <Tooltip title={user.email} key={user.email}>
                                                <div
                                                    onClick={() => handleUseLastEmail(user.email)}
                                                    className="relative group"
                                                    style={{
                                                        cursor: 'pointer',
                                                        textAlign: 'center',
                                                        transition: 'transform 0.2s',
                                                        width: '80px',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    <div className="group-hover:scale-110 transition-transform">
                                                        <Avatar
                                                            src={user.avatar}
                                                            size={54}
                                                            style={{
                                                                marginBottom: 4,
                                                                border: '2px solid transparent',
                                                                transition: 'border-color 0.2s, transform 0.2s'
                                                            }}
                                                            className="group-hover:border-blue-400"
                                                        />
                                                        <div
                                                            style={{
                                                                fontSize: 12,
                                                                color: '#555',
                                                                width: '100%',
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis'
                                                            }}
                                                        >
                                                            {user.email.split('@')[0]}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleRemoveUser(e, user.email)}
                                                        className="absolute -top-2 -right-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                        style={{ border: '1px solid #eee', padding: '2px' }}
                                                    >
                                                        <CloseCircleOutlined style={{ fontSize: '14px', color: '#ff4d4f' }} />
                                                    </button>
                                                </div>
                                            </Tooltip>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Form layout="vertical" onFinish={onFinish} form={form}>
                                <Form.Item
                                    name="email"
                                    label="E-mail"
                                    rules={[
                                        { required: true, message: 'Por favor insira seu e-mail' },
                                        { type: 'email', message: 'E-mail inválido' }
                                    ]}
                                >
                                    <Input
                                        prefix={<MailOutlined className="text-gray-400" />}
                                        placeholder="seu@email.com"
                                        suffix={
                                            form.getFieldValue('email') ?
                                                <CloseCircleOutlined
                                                    onClick={handleClearEmail}
                                                    style={{ cursor: 'pointer', color: '#999' }}
                                                /> : null
                                        }
                                        onChange={() => form.validateFields(['email'])}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="password"
                                    label="Senha"
                                    rules={[
                                        { required: true, message: 'Por favor insira sua senha' },
                                        isRegistering ? { min: 6, message: 'A senha deve ter no mínimo 6 caracteres' } : {}
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password
                                        prefix={<LockOutlined className="text-gray-400" />}
                                        placeholder="********"
                                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                    />
                                </Form.Item>

                                {isRegistering && (
                                    <Form.Item
                                        name="confirmPassword"
                                        label="Confirme a Senha"
                                        dependencies={['password']}
                                        hasFeedback
                                        rules={[
                                            { required: true, message: 'Por favor confirme sua senha' },
                                            ({ getFieldValue }) => ({
                                                validator(_, value) {
                                                    if (!value || getFieldValue('password') === value) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error('As senhas não coincidem'));
                                                },
                                            }),
                                        ]}
                                    >
                                        <Input.Password
                                            prefix={<LockOutlined className="text-gray-400" />}
                                            placeholder="********"
                                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                        />
                                    </Form.Item>
                                )}

                                {!isRegistering && (
                                    <Form.Item name="remember" valuePropName="checked">
                                        <div className="flex justify-between items-center">
                                            <Button type="link" onClick={() => setForgotModalVisible(true)} style={{ padding: 0 }}>
                                                Esqueci minha senha
                                            </Button>
                                        </div>
                                    </Form.Item>
                                )}

                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        icon={isRegistering ? <UserAddOutlined /> : <LoginOutlined />}
                                        className="w-full mt-2"
                                        size="large"
                                    >
                                        {isRegistering ? 'Cadastrar' : 'Entrar'}
                                    </Button>
                                </Form.Item>

                                <Divider plain>ou continue com</Divider>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                                    <Button
                                        shape="circle"
                                        size="large"
                                        icon={<GoogleOutlined />}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    />
                                    <Button
                                        shape="circle"
                                        size="large"
                                        icon={<FacebookOutlined />}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    />
                                </div>

                                <div className="text-center">
                                    <Button
                                        type="link"
                                        onClick={() => setIsRegistering(!isRegistering)}
                                        className="hover:text-blue-600"
                                    >
                                        {isRegistering ? 'Já tem conta? Fazer login' : 'Ainda não tem conta? Cadastre-se'}
                                    </Button>
                                </div>
                            </Form>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </motion.div>

            <Modal
                title="Recuperar senha"
                open={forgotModalVisible}
                onCancel={() => setForgotModalVisible(false)}
                onOk={async () => {
                    if (!forgotEmail) return message.warning('Digite seu e-mail');
                    setForgotLoading(true);
                    try {
                        await axios.post('http://localhost:8080/api/forgot-password', { email: forgotEmail });
                        message.success('Se o e-mail estiver cadastrado, enviaremos instruções.');
                        setForgotModalVisible(false);
                        setForgotEmail('');
                    } catch (error: any) {
                        message.error(error.response?.data?.error || 'Erro ao tentar recuperar senha.');
                    } finally {
                        setForgotLoading(false);
                    }
                }}
                confirmLoading={forgotLoading}
                okText="Enviar"
                cancelText="Cancelar"
            >
                <Input
                    placeholder="Digite seu e-mail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    prefix={<MailOutlined className="text-gray-400" />}
                />
            </Modal>
        </div>
    );
}