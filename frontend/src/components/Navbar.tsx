import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';

const { Header } = Layout;

const Navbar: React.FC = () => {
    return (
        <Header style={{ backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)' }}>
            <div className="logo" style={{ float: 'left', fontWeight: 600, color: '#1890ff' }}>
                ProtocolManager
            </div>
            <Menu mode="horizontal" defaultSelectedKeys={['/']} style={{ marginLeft: 200 }}>
                <Menu.Item key="/pagina-inicial"><Link to="/pagina-inicial">Dashboard</Link></Menu.Item>
                <Menu.Item key="/protocols"><Link to="/protocols">Protocolos</Link></Menu.Item>
                <Menu.Item key="/customers"><Link to="/customers">Clientes</Link></Menu.Item>
                <Menu.Item key="/personnel"><Link to="/personnel">Corretores</Link></Menu.Item>
                <Menu.Item key="/branches"><Link to="/branches">Seguradoras</Link></Menu.Item>
                <Menu.Item key="/"><Link to="/">Sair</Link></Menu.Item>
            </Menu>
        </Header>
    );
};

export default Navbar;
