import axios from 'axios';

// 1. Adicione 'export' aqui para poder usar essa string em outros lugares
export const API_BASE_URL = import.meta.env.PROD
    ? ''
    : 'http://localhost:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

export default api;
