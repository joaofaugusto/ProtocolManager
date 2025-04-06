// src/api/customerApi.ts
import API from './client';
import { Customer } from '../types/types';

export const getCustomers = async (): Promise<Customer[]> => {
    const response = await API.get('/customers');
    return response.data;
};

export const createCustomer = async (customer: Customer): Promise<Customer> => {
    const response = await API.post('/customers', customer);
    return response.data;
};

// Add other methods as needed