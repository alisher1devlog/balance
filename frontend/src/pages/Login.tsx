import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import {
    Box,
    Container,
    Paper,
    TextField,
    Button,
    Typography,
    Alert,
    CircularProgress,
    Stack,
} from '@mui/material';
import { authApi } from '@/api';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const { language } = useLanguageStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const mutation = useMutation({
        mutationFn: () => authApi.login(email, password),
        onSuccess: (data) => {
            login(data.user, data.access_token);
            navigate('/dashboard');
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || 'Login failed');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill all fields');
            return;
        }

        mutation.mutate();
    };

    return (
        <Container maxWidth="sm">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                }}
            >
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    {/* Logo */}
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h3" sx={{ fontWeight: 700 }}>
                            Balance
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            SaaS Platform
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                label={t('auth.email', language)}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                fullWidth
                                autoFocus
                                disabled={mutation.isPending}
                            />

                            <TextField
                                label={t('auth.password', language)}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                fullWidth
                                disabled={mutation.isPending}
                            />

                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                size="large"
                                disabled={mutation.isPending}
                                sx={{
                                    mt: 2,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                }}
                            >
                                {mutation.isPending ? (
                                    <CircularProgress size={24} />
                                ) : (
                                    t('auth.login', language)
                                )}
                            </Button>
                        </Stack>
                    </form>

                    {/* Demo Credentials */}
                    <Box sx={{ mt: 4, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Demo Credentials:
                        </Typography>
                        <Typography variant="caption" display="block">
                            Email: admin@example.com
                        </Typography>
                        <Typography variant="caption" display="block">
                            Password: password
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};
