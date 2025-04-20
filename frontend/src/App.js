import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Customers from './pages/Customers.tsx';
import Personnel from './pages/Personnel.tsx';
import Branches from './pages/Branches.tsx';
import Protocols from './pages/Protocols.tsx';
import ProtocolDetail from './pages/ProtocolDetail.tsx';
import Login from './pages/Login.tsx';
import Navbar from './components/Navbar.tsx';

function AppLayout() {
    const location = useLocation();
    const hideNavbarOnRoutes = ['/login'];
    const shouldHideNavbar = hideNavbarOnRoutes.includes(location.pathname);

    return (
        <div className="app">
            {!shouldHideNavbar && <Navbar />}
            <main className="content">
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/personnel" element={<Personnel />} />
                    <Route path="/branches" element={<Branches />} />
                    <Route path="/protocols" element={<Protocols />} />
                    <Route path="/protocols/:id" element={<ProtocolDetail />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/pagina-inicial" element={<div className="home-page"><h1>Página Inicial</h1></div>} />
                </Routes>
            </main>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}

export default App;
