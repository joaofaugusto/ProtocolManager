// src/api/client.ts
import axios from 'axios';

// Create an instance of axios
const API = axios.create({
    baseURL: 'http://localhost:3001', // JSON Server URL (switch to your Go API later)
});

export default API;