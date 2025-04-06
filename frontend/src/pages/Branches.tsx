// src/pages/Branches.tsx
import React, { useState, useEffect } from 'react';
import { Button, Form, Table, Modal, Message } from 'semantic-ui-react';
import { Branch } from '../types/types';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../services/branchService.ts';
const Branches: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [formData, setFormData] = useState<Branch>({ branch_name: '', branch_code: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load branches on component mount
    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        try {
            setLoading(true);
            const data = await getBranches();
            // Ensure we always set an array, even if the API returns null
            setBranches(data || []);
            setError(null);
        } catch (err) {
            console.error("Error loading branches:", err);
            setError('Failed to load branches');
            // Set empty array on error to prevent null/undefined issues
            setBranches([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (branch?: Branch) => {
        if (branch) {
            setCurrentBranch(branch);
            setFormData({ branch_name: branch.branch_name, branch_code: branch.branch_code });
        } else {
            setCurrentBranch(null);
            setFormData({ branch_name: '', branch_code: '' });
        }
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setCurrentBranch(null);
        setFormData({ branch_name: '', branch_code: '' });
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            if (currentBranch) {
                await updateBranch(currentBranch.branch_id!, formData);
                setSuccess('Branch updated successfully');
            } else {
                await createBranch(formData);
                setSuccess('Branch created successfully');
            }
            closeModal();
            loadBranches();
        } catch (err) {
            setError('Failed to save branch');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            try {
                setLoading(true);
                await deleteBranch(id);
                setSuccess('Branch deleted successfully');
                loadBranches();
            } catch (err) {
                setError('Failed to delete branch');
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="branches-page">
            <div className="page-header">
                <h1>Insurance Branches</h1>
                <Button primary onClick={() => openModal()}>
                    Add Branch
                </Button>
            </div>

            {error && (
                <Message negative>
                    <Message.Header>Error</Message.Header>
                    <p>{error}</p>
                    <Button icon="close" size="mini" floated="right" onClick={() => setError(null)} />
                </Message>
            )}

            {success && (
                <Message positive>
                    <Message.Header>Success</Message.Header>
                    <p>{success}</p>
                    <Button icon="close" size="mini" floated="right" onClick={() => setSuccess(null)} />
                </Message>
            )}

            <Table celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Name</Table.HeaderCell>
                        <Table.HeaderCell>Code</Table.HeaderCell>
                        <Table.HeaderCell>Actions</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {loading && branches.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan="4">Loading...</Table.Cell>
                        </Table.Row>
                    ) : branches.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan="4">No branches found. Add a branch to get started.</Table.Cell>
                        </Table.Row>
                    ) : (
                        branches.map(branch => (
                            <Table.Row key={branch.branch_id}>
                                <Table.Cell>{branch.branch_id}</Table.Cell>
                                <Table.Cell>{branch.branch_name}</Table.Cell>
                                <Table.Cell>{branch.branch_code}</Table.Cell>
                                <Table.Cell>
                                    <Button size="tiny" primary onClick={() => openModal(branch)}>
                                        Edit
                                    </Button>
                                    <Button size="tiny" negative onClick={() => handleDelete(branch.branch_id!)}>
                                        Delete
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table>

            {modalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-header">
                            <h3>{currentBranch ? 'Edit Branch' : 'Add New Branch'}</h3>
                            <button onClick={closeModal}>×</button>
                        </div>
                        <div className="modal-content">
                            <div className="form">
                                <div className="form-field">
                                    <label>Branch Name</label>
                                    <input
                                        name="branch_name"
                                        placeholder="Enter branch name"
                                        value={formData.branch_name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="form-field">
                                    <label>Branch Code</label>
                                    <input
                                        name="branch_code"
                                        placeholder="Enter branch code"
                                        value={formData.branch_code}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button className="button negative" onClick={closeModal}>
                                Cancel
                            </button>
                            <button
                                className="button positive"
                                onClick={handleSubmit}
                                disabled={!formData.branch_name || !formData.branch_code}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Branches;