// src/services/branchService.ts
import axios from 'axios';
import { Branch } from '../types/types';

const API_URL = 'http://localhost:8080/api';

export const getBranches = async (): Promise<Branch[]> => {
    try {
        const response = await axios.get(`${API_URL}/branches`);
        console.log("API response:", response.data);  // Add this line
        return response.data;
    } catch (error) {
        console.error("API error:", error);
        return []; // Return empty array on error
    }
};

export const getBranchById = async (id: number): Promise<Branch> => {
    const response = await axios.get(`${API_URL}/branches/${id}`);
    return response.data;
};

export const createBranch = async (branch: Branch): Promise<Branch> => {
    const response = await axios.post(`${API_URL}/branches`, branch);
    return response.data;
};

export const updateBranch = async (id: number, branch: Branch): Promise<void> => {
    await axios.put(`${API_URL}/branches/${id}`, branch);
};

export const deleteBranch = async (id: number): Promise<void> => {
    await axios.delete(`${API_URL}/branches/${id}`);
};