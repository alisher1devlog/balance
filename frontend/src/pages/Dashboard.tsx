import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Skeleton,
    CircularProgress,
} from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { dashboardApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const Dashboard = () => {
    const { user } = useAuthStore();
    const { language } = useLanguageStore();
    const marketId = user?.marketId || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['dashboard', marketId],
        queryFn: () => dashboardApi.getSummary(marketId),
        enabled: !!marketId || user?.role === 'SUPERADMIN',
    });

    if (isLoading) {
        return (
            <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
                                    <Skeleton variant="text" width="60%" height={40} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (error || !data) {
        return <EmptyState />;
    }

    const stats = [
        {
            label: t('dashboard.totalCustomers', language),
            value: data.totalCustomers,
            color: '#1976d2',
        },
        {
            label: t('dashboard.totalContracts', language),
            value: data.totalContracts,
            color: '#ff9800',
        },
        {
            label: t('dashboard.totalRevenue', language),
            value: `${data.totalRevenue}`,
            color: '#4caf50',
        },
        {
            label: t('dashboard.pendingPayments', language),
            value: data.pendingPayments,
            color: '#f44336',
        },
    ];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                {t('dashboard.title', language)}
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {stats.map((stat, idx) => (
                    <Grid item xs={12} sm={6} md={3} key={idx}>
                        <Card
                            sx={{
                                background: `linear-gradient(135deg, ${stat.color}20 0%, ${stat.color}05 100%)`,
                                borderLeft: `4px solid ${stat.color}`,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography color="textSecondary" variant="body2">
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="h5" sx={{ fontWeight: 700, mt: 1 }}>
                                            {stat.value}
                                        </Typography>
                                    </Box>
                                    <TrendingUpIcon sx={{ fontSize: '2rem', color: stat.color, opacity: 0.5 }} />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Top Debtors */}
            {data.topDebtors && data.topDebtors.length > 0 && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                            Top Debtors
                        </Typography>
                        {data.topDebtors.map((debtor) => (
                            <Box
                                key={debtor.id}
                                sx={{
                                    p: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    '&:last-child': { borderBottom: 'none' },
                                }}
                            >
                                <Typography variant="body2">{debtor.fullName}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {debtor.phone}
                                </Typography>
                            </Box>
                        ))}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
};
