import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { createAppTheme } from '@/theme/theme';

import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Users } from '@/pages/Users';
import { Customers } from '@/pages/Customers';
import { Products } from '@/pages/Products';
import { Categories } from '@/pages/Categories';
import { Contracts } from '@/pages/Contracts';
import { Subscriptions } from '@/pages/Subscriptions';

// Create query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            gcTime: 10 * 60 * 1000, // 10 minutes
        },
    },
});

/**
 * Protected Route Wrapper
 */
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export const App = () => {
    const { mode } = useThemeStore();
    const theme = createAppTheme(mode);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Routes>
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route
                            element={
                                <ProtectedRoute>
                                    <DashboardLayout />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/contracts" element={<Contracts />} />
                            <Route path="/products" element={<Products />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                        </Route>

                        {/* Redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>

            {/* React Query DevTools (Development) */}
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
    );
};
