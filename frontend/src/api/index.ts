import { apiClient } from './client';
import {
    User,
    Customer,
    Product,
    Category,
    Contract,
    DashboardSummary,
    AuthResponse,
} from './types';

/* ========================================
 * AUTH SERVICES
 * ======================================== */

export const authApi = {
    login: (email: string, password: string) =>
        apiClient.post<AuthResponse>('/api/auth/login', { email, password }),

    logout: () => apiClient.post('/api/auth/logout', {}),

    getProfile: () => apiClient.get<User>('/api/auth/profile'),
};

/* ========================================
 * USERS SERVICES
 * ======================================== */

export const usersApi = {
    getAll: () => apiClient.get<User[]>('/api/users'),

    getOne: (id: string) => apiClient.get<User>(`/api/users/${id}`),

    create: (data: Partial<User>) => apiClient.post<User>('/api/users', data),

    update: (id: string, data: Partial<User>) =>
        apiClient.patch<User>(`/api/users/${id}`, data),

    delete: (id: string) => apiClient.delete(`/api/users/${id}`),

    updateStatus: (id: string, status: string) =>
        apiClient.patch(`/api/users/${id}/status`, { status }),
};

/* ========================================
 * CUSTOMERS SERVICES
 * ======================================== */

export const customersApi = {
    getAll: (marketId: string) =>
        apiClient.get<Customer[]>(`/api/customers?marketId=${marketId}`),

    getOne: (id: string) => apiClient.get<Customer>(`/api/customers/${id}`),

    create: (data: Partial<Customer>) =>
        apiClient.post<Customer>('/api/customers', data),

    update: (id: string, data: Partial<Customer>) =>
        apiClient.patch<Customer>(`/api/customers/${id}`, data),

    delete: (id: string) => apiClient.delete(`/api/customers/${id}`),
};

/* ========================================
 * PRODUCTS SERVICES
 * ======================================== */

export const productsApi = {
    getAll: (marketId: string) =>
        apiClient.get<Product[]>(`/api/products?marketId=${marketId}`),

    getOne: (id: string) => apiClient.get<Product>(`/api/products/${id}`),

    create: (data: Partial<Product>) =>
        apiClient.post<Product>('/api/products', data),

    update: (id: string, data: Partial<Product>) =>
        apiClient.patch<Product>(`/api/products/${id}`, data),

    delete: (id: string) => apiClient.delete(`/api/products/${id}`),
};

/* ========================================
 * CATEGORIES SERVICES
 * ======================================== */

export const categoriesApi = {
    getAll: (marketId: string) =>
        apiClient.get<Category[]>(`/api/categories?marketId=${marketId}`),

    getOne: (id: string) => apiClient.get<Category>(`/api/categories/${id}`),

    create: (data: Partial<Category>) =>
        apiClient.post<Category>('/api/categories', data),

    update: (id: string, data: Partial<Category>) =>
        apiClient.patch<Category>(`/api/categories/${id}`, data),

    delete: (id: string) => apiClient.delete(`/api/categories/${id}`),
};

/* ========================================
 * CONTRACTS SERVICES
 * ======================================== */

export const contractsApi = {
    getAll: (marketId: string) =>
        apiClient.get<Contract[]>(`/api/contracts?marketId=${marketId}`),

    getOne: (id: string) => apiClient.get<Contract>(`/api/contracts/${id}`),

    create: (data: Partial<Contract>) =>
        apiClient.post<Contract>('/api/contracts', data),

    update: (id: string, data: Partial<Contract>) =>
        apiClient.patch<Contract>(`/api/contracts/${id}`, data),

    delete: (id: string) => apiClient.delete(`/api/contracts/${id}`),
};

/* ========================================
 * DASHBOARD SERVICES
 * ======================================== */

export const dashboardApi = {
    getSummary: (marketId: string) =>
        apiClient.get<DashboardSummary>(
            `/api/dashboard/summary?marketId=${marketId}`
        ),
};

/* ========================================
 * SUBSCRIPTIONS SERVICES
 * ======================================== */

export const subscriptionsApi = {
    getPlans: () =>
        apiClient.get('/api/subscriptions/plans'),
};
