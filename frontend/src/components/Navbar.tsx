// src/components/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
    return (
        <nav className="navbar">
            <div className="logo">Insurance Protocol System</div>
            <ul className="nav-links">
                <li><Link to="/">Dashboard</Link></li>
                <li><Link to="/protocols">Protocols</Link></li>
                <li><Link to="/customers">Customers</Link></li>
                <li><Link to="/personnel">Personnel</Link></li>
                <li><Link to="/branches">Branches</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;