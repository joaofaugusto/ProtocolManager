// Update your App.js to include the Protocols route
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Customers from './pages/Customers.tsx';
import Personnel from './pages/Personnel.tsx';
import Branches from './pages/Branches.tsx';
import Protocols from './pages/Protocols.tsx';
import ProtocolDetail from './pages/ProtocolDetail.tsx';

function App() {
    return (
        <BrowserRouter>
            <div className="app">
                <nav className="main-nav">
                    <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><Link to="/customers">Customers</Link></li>
                        <li><Link to="/personnel">Personnel</Link></li>
                        <li><Link to="/branches">Branches</Link></li>
                        <li><Link to="/protocols">Protocols</Link></li>
                    </ul>
                </nav>

                <main className="content">
                    <Routes>
                        <Route path="/" element={<div className="home-page"><h1>Protocol Manager Home</h1></div>} />
                        <Route path="/customers" element={<Customers />} />
                        <Route path="/personnel" element={<Personnel />} />
                        <Route path="/branches" element={<Branches />} />
                        <Route path="/protocols" element={<Protocols />} />
                        <Route path="/protocols/:id" element={<ProtocolDetail />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default App;