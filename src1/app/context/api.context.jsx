import { createContext, useContext, useMemo } from 'react';
import axios from "axios";
import { BASE_URI, TIME_OUT, STORAGE_KEYS } from "../config"


// Create Context
const ApiContext = createContext(null);
// Axios Instance Setup
const createAxiosInstance = () => {
    const baseURL = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_API_URL : BASE_URI;

    const instance = axios.create({
        baseURL,
        timeout: TIME_OUT,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request Interceptor — attach token automatically
    instance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor — handle errors globally
    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                console.warn('Unauthorized! Token may be expired.');
                localStorage.removeItem(STORAGE_KEYS.TOKEN);
                localStorage.removeItem(STORAGE_KEYS.USER);
                window.location.href = '/login'; // redirect to login
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

// CRUD Helper Methods
const createApiMethods = (instance) => ({
    get: (url, config) => instance.get(url, config).then(res => res.data),
    post: (url, data, config) => instance.post(url, data, config).then(res => res.data),
    put: (url, data, config) => instance.put(url, data, config).then(res => res.data),
    patch: (url, data, config) => instance.patch(url, data, config).then(res => res.data),
    delete: (url, config) => instance.delete(url, config).then(res => res.data),
});

// Context Provider
export const ApiProvider = ({ children }) => {
    const apiInstance = useMemo(() => createAxiosInstance(), []);
    const api = useMemo(() => createApiMethods(apiInstance), [apiInstance]);
    
    return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
};

// Hook to use API easily in components
export const useApi = () => {
    const ctx = useContext(ApiContext);
    if (!ctx) {
        throw new Error('useApi must be used within an ApiProvider');
    }
    return ctx;
};