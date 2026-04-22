/* ========================================
 * API TYPES & INTERFACES
 * ======================================== */

export enum Role {
    SUPERADMIN = 'SUPERADMIN',
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    SELLER = 'SELLER',
}

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: Role;
    status: UserStatus;
    marketId?: string;
    createdAt: string;
    workMarket?: Market;
}

export interface Market {
    id: string;
    name: string;
    status: string;
    ownerId: string;
    location?: string;
    phone?: string;
    createdAt: string;
}

export interface Customer {
    id: string;
    fullName: string;
    email?: string;
    phone: string;
    marketId: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    marketId: string;
    createdAt: string;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    marketId: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    customerId: string;
    marketId: string;
    status: string;
    totalAmount: number;
    createdAt: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    user: User;
}

export interface DashboardSummary {
    totalCustomers: number;
    totalContracts: number;
    totalRevenue: number;
    pendingPayments: number;
    topDebtors: Customer[];
    overdueContracts: Contract[];
}

export interface ApiResponse<T> {
    data: T;
    message?: string;
    statusCode: number;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}
