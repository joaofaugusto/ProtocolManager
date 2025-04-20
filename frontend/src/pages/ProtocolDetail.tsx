// src/pages/ProtocolDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Protocol, Customer, Personnel, Branch, ProtocolType, ProtocolStatus } from '../types/types';

// Additional interfaces for the detail view
interface Comment {
    id: number;
    protocol_id: number;
    content: string;
    created_by: number;
    created_at: string;
}

interface Attachment {
    id: number;
    protocol_id: number;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_by: number;
    uploaded_at: string;
    url: string;
}

interface StatusChange {
    id: number;
    protocol_id: number;
    old_status_id: number;
    new_status_id: number;
    changed_by: number;
    changed_at: string;
    notes?: string;
}

interface TimelineItem {
    id: number;
    type: 'comment' | 'status' | 'attachment';
    timestamp: string;
    content: string;
    user_id: number;
    metadata?: any;
}

const ProtocolDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [protocol, setProtocol] = useState<Protocol | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [branch, setBranch] = useState<Branch | null>(null);
    const [assignedTo, setAssignedTo] = useState<Personnel | null>(null);
    const [protocolType, setProtocolType] = useState<ProtocolType | null>(null);
    const [currentStatus, setCurrentStatus] = useState<ProtocolStatus | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [statusHistory, setStatusHistory] = useState<StatusChange[]>([]);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [newComment, setNewComment] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [newStatus, setNewStatus] = useState<number | ''>('');
    const [statuses, setStatuses] = useState<ProtocolStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const API_BASE = process.env.REACT_APP_API_BASE_URL;
    useEffect(() => {
        // In a real app, fetch actual data from your API
        setTimeout(() => {
            // Mock protocol data
            const mockProtocol: Protocol = {
                protocol_id: Number(id),
                protocol_number: `P00${id}`,
                title: 'Car Insurance Policy Update',
                description: 'Customer wants to add a new driver to their auto policy',
                type_id: 2,
                status_id: 2,
                requestor_id: 1,
                customer_id: 1,
                branch_id: 1,
                assigned_to: 2,
                deadline: '2023-12-31',
                created_by: 1,
                priority: 'High',
            };

            const mockCustomer: Customer = {
                customer_id: 1,
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                phone: '555-1234',
                address: '123 Main St'
            };

            const mockBranch: Branch = {
                branch_id: 1,
                branch_name: 'Downtown Office',
                branch_code: 'DT01'
            };

            const mockPersonnel: Personnel[] = [
                {
                    personnel_id: 1,
                    first_name: 'Alex',
                    last_name: 'Johnson',
                    email: 'alex@company.com',
                    phone: '555-5678',
                    active: true
                },
                {
                    personnel_id: 2,
                    first_name: 'Sarah',
                    last_name: 'Williams',
                    email: 'sarah@company.com',
                    phone: '555-9012',
                    active: true
                }
            ];

            const mockType: ProtocolType = {
                type_id: 2,
                type_name: 'Policy Update',
                default_deadline_days: 7
            };

            const mockStatuses: ProtocolStatus[] = [
                { status_id: 1, status_name: 'New', is_terminal: false, order_sequence: 1 },
                { status_id: 2, status_name: 'In Progress', is_terminal: false, order_sequence: 2 },
                { status_id: 3, status_name: 'Pending Customer', is_terminal: false, order_sequence: 3 },
                { status_id: 4, status_name: 'Completed', is_terminal: true, order_sequence: 4 },
                { status_id: 5, status_name: 'Cancelled', is_terminal: true, order_sequence: 5 }
            ];

            const mockComments: Comment[] = [
                {
                    id: 1,
                    protocol_id: Number(id),
                    content: 'Initial request received from customer via phone.',
                    created_by: 1,
                    created_at: '2023-11-01T10:30:00Z'
                },
                {
                    id: 2,
                    protocol_id: Number(id),
                    content: 'Called customer to get additional information on the new driver.',
                    created_by: 2,
                    created_at: '2023-11-02T14:15:00Z'
                }
            ];

            const mockAttachments: Attachment[] = [
                {
                    id: 1,
                    protocol_id: Number(id),
                    file_name: 'driver_license.pdf',
                    file_size: 1024 * 1024,
                    file_type: 'application/pdf',
                    uploaded_by: 1,
                    uploaded_at: '2023-11-01T10:35:00Z',
                    url: '#'
                }
            ];

            const mockStatusHistory: StatusChange[] = [
                {
                    id: 1,
                    protocol_id: Number(id),
                    old_status_id: 1,
                    new_status_id: 2,
                    changed_by: 2,
                    changed_at: '2023-11-01T11:00:00Z',
                    notes: 'Started working on policy update'
                }
            ];

            // Build timeline from all activities
            const timelineItems: TimelineItem[] = [
                ...mockComments.map(comment => ({
                    id: comment.id,
                    type: 'comment' as const,
                    timestamp: comment.created_at,
                    content: comment.content,
                    user_id: comment.created_by
                })),
                ...mockStatusHistory.map(status => ({
                    id: status.id + 100, // Avoid ID collision
                    type: 'status' as const,
                    timestamp: status.changed_at,
                    content: `Status changed from ${mockStatuses.find(s => s.status_id === status.old_status_id)?.status_name} to ${mockStatuses.find(s => s.status_id === status.new_status_id)?.status_name}`,
                    user_id: status.changed_by,
                    metadata: {
                        old_status_id: status.old_status_id,
                        new_status_id: status.new_status_id,
                        notes: status.notes
                    }
                })),
                ...mockAttachments.map(file => ({
                    id: file.id + 200, // Avoid ID collision
                    type: 'attachment' as const,
                    timestamp: file.uploaded_at,
                    content: `File uploaded: ${file.file_name}`,
                    user_id: file.uploaded_by,
                    metadata: {
                        file_name: file.file_name,
                        file_size: file.file_size,
                        file_type: file.file_type
                    }
                }))
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

            setProtocol(mockProtocol);
            setCustomer(mockCustomer);
            setBranch(mockBranch);
            setAssignedTo(mockPersonnel.find(p => p.personnel_id === mockProtocol.assigned_to) || null);
            setProtocolType(mockType);
            setCurrentStatus(mockStatuses.find(s => s.status_id === mockProtocol.status_id) || null);
            setComments(mockComments);
            setAttachments(mockAttachments);
            setStatusHistory(mockStatusHistory);
            setTimeline(timelineItems);
            setStatuses(mockStatuses);
            setPersonnel(mockPersonnel);
            setLoading(false);
        }, 500);
    }, [id]);

    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        // In a real app, send to your API
        const newCommentObj: Comment = {
            id: comments.length + 1,
            protocol_id: Number(id),
            content: newComment,
            created_by: 1, // Assuming current user ID is 1
            created_at: new Date().toISOString()
        };

        // Add to local state
        setComments([...comments, newCommentObj]);

        // Add to timeline
        const timelineItem: TimelineItem = {
            id: timeline.length + 1,
            type: 'comment',
            timestamp: newCommentObj.created_at,
            content: newCommentObj.content,
            user_id: newCommentObj.created_by
        };

        setTimeline([timelineItem, ...timeline]);

        // Clear input
        setNewComment('');
    };

    const handleFileUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFiles || selectedFiles.length === 0) return;

        // In a real app, send files to your API

        // For demo, create mock attachments
        // @ts-ignore
        // @ts-ignore
        // @ts-ignore
        const newAttachments: Attachment[] = Array.from(selectedFiles).map((file, index) => ({
            id: attachments.length + index + 1,
            protocol_id: Number(id),
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            uploaded_by: 1, // Assuming current user ID is 1
            uploaded_at: new Date().toISOString(),
            url: '#' // Mock URL
        }));

        // Add to local state
        setAttachments([...attachments, ...newAttachments]);

        // Add to timeline
        const newTimelineItems: TimelineItem[] = newAttachments.map(att => ({
            id: timeline.length + att.id,
            type: 'attachment',
            timestamp: att.uploaded_at,
            content: `File uploaded: ${att.file_name}`,
            user_id: att.uploaded_by,
            metadata: {
                file_name: att.file_name,
                file_size: att.file_size,
                file_type: att.file_type
            }
        }));

        setTimeline([...newTimelineItems, ...timeline].sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));

        // Clear input
        setSelectedFiles(null);

        // Reset the file input by clearing its value
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleStatusChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStatus || !protocol) return;

        const oldStatusId = protocol.status_id;
        const newStatusId = Number(newStatus);

        // Don't proceed if status hasn't changed
        if (oldStatusId === newStatusId) return;

        // In a real app, send to your API

        // For demo, update protocol status
        setProtocol({...protocol, status_id: newStatusId});
        setCurrentStatus(statuses.find(s => s.status_id === newStatusId) || null);

        // Add to status history
        const statusChange: StatusChange = {
            id: statusHistory.length + 1,
            protocol_id: Number(id),
            old_status_id: oldStatusId,
            new_status_id: newStatusId,
            changed_by: 1, // Assuming current user ID is 1
            changed_at: new Date().toISOString(),
        };

        setStatusHistory([...statusHistory, statusChange]);

        // Add to timeline
        const timelineItem: TimelineItem = {
            id: timeline.length + 1,
            type: 'status',
            timestamp: statusChange.changed_at,
            content: `Status changed from ${statuses.find(s => s.status_id === oldStatusId)?.status_name} to ${statuses.find(s => s.status_id === newStatusId)?.status_name}`,
            user_id: statusChange.changed_by,
            metadata: {
                old_status_id: oldStatusId,
                new_status_id: newStatusId
            }
        };

        setTimeline([timelineItem, ...timeline]);

        // Reset select
        setNewStatus('');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(e.target.files);
        }
    };

    const formatDate = (dateString: string): string => {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const getUserName = (userId: number): string => {
        const person = personnel.find(p => p.personnel_id === userId);
        return person ? `${person.first_name} ${person.last_name}` : 'Unknown User';
    };

    const getStatusColor = (priority: string): string => {
        switch (priority) {
            case 'Low': return 'status-low';
            case 'High': return 'status-high';
            case 'Urgent': return 'status-urgent';
            default: return 'status-normal';
        }
    };

    if (loading) {
        return <div>Loading protocol details...</div>;
    }

    if (!protocol || !currentStatus) {
        return <div>Protocol not found</div>;
    }

    return (
        <div className="protocol-detail">
            <div className="detail-header">
                <div className="back-link">
                    <Link to="/protocols">← Back to Protocols</Link>
                </div>

                <div className="protocol-title">
                    <h1>
                        {protocol.protocol_number}: {protocol.title}
                        <span className={`priority-badge ${getStatusColor(protocol.priority)}`}>
              {protocol.priority}
                    </span>
                    </h1>
                </div>

                <div className="protocol-status">
                    <h3>Current Status: <span className="status-badge">{currentStatus.status_name}</span></h3>
                </div>
            </div>

            <div className="protocol-content">
                <div className="main-details">
                    <div className="detail-card">
                        <h3>Protocol Information</h3>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <div className="detail-label">Type:</div>
                                <div className="detail-value">{protocolType?.type_name || 'Unknown'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Customer:</div>
                                <div className="detail-value">
                                    {customer ? `${customer.first_name} ${customer.last_name}` : 'Not assigned'}
                                    {customer && (
                                        <span className="contact-info">
                                            {customer.email && <div>Email: {customer.email}</div>}
                                            {customer.phone && <div>Phone: {customer.phone}</div>}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Branch:</div>
                                <div className="detail-value">{branch?.branch_name || 'Not assigned'}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Assigned To:</div>
                                <div className="detail-value">
                                    {assignedTo ? `${assignedTo.first_name} ${assignedTo.last_name}` : 'Not assigned'}
                                    {assignedTo && assignedTo.email && (
                                        <span className="contact-info">
                                            <div>Email: {assignedTo.email}</div>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Deadline:</div>
                                <div className="detail-value">
                                    {protocol.deadline ? formatDate(protocol.deadline) : 'No deadline set'}
                                </div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Description:</div>
                                <div className="detail-value description">
                                    {protocol.description || 'No description provided'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="action-panels">
                        <div className="detail-card">
                            <h3>Update Status</h3>
                            <form onSubmit={handleStatusChange} className="action-form">
                                <div className="form-group">
                                    <select
                                        value={newStatus}
                                        onChange={(e) => setNewStatus(e.target.value)}
                                        required
                                    >
                                        <option value="">Select New Status</option>
                                        {statuses
                                            .filter(status => status.status_id !== protocol.status_id)
                                            .map(status => (
                                                <option key={status.status_id} value={status.status_id}>
                                                    {status.status_name}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                                <button type="submit" disabled={!newStatus}>Update Status</button>
                            </form>
                        </div>

                        <div className="detail-card">
                            <h3>Upload Files</h3>
                            <form onSubmit={handleFileUpload} className="action-form">
                                <div className="form-group">
                                    <input
                                        id="file-upload"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={!selectedFiles}>Upload</button>
                            </form>
                        </div>

                        <div className="detail-card">
                            <h3>Add Comment</h3>
                            <form onSubmit={handleCommentSubmit} className="action-form">
                                <div className="form-group">
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Enter your comment..."
                                        rows={3}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={!newComment.trim()}>Add Comment</button>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="timeline-section">
                    <div className="detail-card timeline">
                        <h3>Activity Timeline</h3>
                        <div className="timeline-list">
                            {timeline.length === 0 ? (
                                <div className="no-activity">No activity recorded yet.</div>
                            ) : (
                                timeline.map((item) => (
                                    <div key={item.id} className={`timeline-item ${item.type}`}>
                                        <div className="timeline-time">
                                            {formatDate(item.timestamp)}
                                        </div>
                                        <div className="timeline-icon">
                                            {item.type === 'comment' && '💬'}
                                            {item.type === 'status' && '🔄'}
                                            {item.type === 'attachment' && '📎'}
                                        </div>
                                        <div className="timeline-content">
                                            <div className="timeline-user">
                                                {getUserName(item.user_id)}
                                            </div>
                                            <div className="timeline-details">
                                                {item.content}

                                                {item.type === 'attachment' && item.metadata && (
                                                    <div className="file-info">
                                                        <div className="file-size">
                                                            Size: {Math.round(item.metadata.file_size / 1024)} KB
                                                        </div>
                                                        <a href="#" className="download-link">Download</a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProtocolDetail;