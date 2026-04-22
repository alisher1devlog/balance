import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Axios API Client
 * Barcha API requests uchun
 */
class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor - token qo'shish
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('access_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error: AxiosError) => {
                if (error.response?.status === 401) {
                    // Token expired - logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }

                if (error.response?.status === 403) {
                    console.error('Forbidden: No permission');
                }

                return Promise.reject(error);
            }
        );
    }

    /**
     * GET request
     */
    async get<T>(path: string, config?: any): Promise<T> {
        const response = await this.client.get<T>(path, config);
        return response.data;
    }

    /**
     * POST request
     */
    async post<T>(path: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.post<T>(path, data, config);
        return response.data;
    }

    /**
     * PATCH request
     */
    async patch<T>(path: string, data?: any, config?: any): Promise<T> {
        const response = await this.client.patch<T>(path, data, config);
        return response.data;
    }

    /**
     * DELETE request
     */
    async delete<T>(path: string, config?: any): Promise<T> {
        const response = await this.client.delete<T>(path, config);
        return response.data;
    }

    /**
     * Get raw client
     */
    getClient(): AxiosInstance {
        return this.client;
    }
}

export const apiClient = new ApiClient();
