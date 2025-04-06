// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Protocol, ProtocolStatus } from '../types/types';

const Dashboard: React.FC = () => {
    const [recentProtocols, setRecentProtocols] = useState<Protocol[]>([]);
    const [statusCounts, setStatusCounts] = useState<{[key: string]: number}>({});

    // In a real app, fetch this data from your API
    useEffect(() => {
        // Mock data for demonstration
        setRecentProtocols([
            { protocol_id: 1, protocol_number: 'P001', title: 'New Auto Insurance',
                type_id: 2, status_id: 1, created_by: 1, priority: 'Normal' }
        ]);

        setStatusCounts({
            'New': 5,
            'In Progress': 10,
            'Awaiting Information': 3,
            'Under Review': 2,
            'Approved': 15,
            'Rejected': 1,
            'Completed': 20
        });
    }, []);

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="status-summary">
                <h2>Protocol Status Summary</h2>
                <div className="status-cards">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <div key={status} className="status-card">
                            <h3>{status}</h3>
                            <div className="count">{count}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="recent-protocols">
                <h2>Recent Protocols</h2>
                <table>
                    <thead>
                    <tr>
                        <th>Number</th>
                        <th>Title</th>
                        <th>Priority</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recentProtocols.map(protocol => (
                        <tr key={protocol.protocol_id}>
                            <td>{protocol.protocol_number}</td>
                            <td>{protocol.title}</td>
                            <td>{protocol.priority}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;