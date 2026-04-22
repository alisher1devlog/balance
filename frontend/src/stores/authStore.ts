import { create } from 'zustand';
import { User, Role } from '@/api/types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;

    // Actions
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    logout: () => void;
    login: (user: User, token: string) => void;

    // Helpers
    canAccess: (roles: Role[]) => boolean;
    isSuperAdmin: () => boolean;
    isOwner: () => boolean;
    isAdmin: () => boolean;
    isManager: () => boolean;
    isSeller: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => {
    // Load from localStorage
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('access_token');

    return {
        user: savedUser ? JSON.parse(savedUser) : null,
        token: savedToken || null,
        isAuthenticated: !!(savedToken && savedUser),

        setUser: (user) => {
            set({ user });
            localStorage.setItem('user', JSON.stringify(user));
        },

        setToken: (token) => {
            set({ token });
            localStorage.setItem('access_token', token);
        },

        logout: () => {
            set({ user: null, token: null, isAuthenticated: false });
            localStorage.removeItem('user');
            localStorage.removeItem('access_token');
        },

        login: (user, token) => {
            set({ user, token, isAuthenticated: true });
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('access_token', token);
        },

        canAccess: (roles) => {
            const { user } = get();
            return user ? roles.includes(user.role) : false;
        },

        isSuperAdmin: () => get().user?.role === Role.SUPERADMIN,
        isOwner: () => get().user?.role === Role.OWNER,
        isAdmin: () => get().user?.role === Role.ADMIN,
        isManager: () => get().user?.role === Role.MANAGER,
        isSeller: () => get().user?.role === Role.SELLER,
    };
});
