import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Skeleton,
    Stack,
} from '@mui/material';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { subscriptionsApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import CheckIcon from '@mui/icons-material/Check';

interface SubscriptionPlan {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
}

export const Subscriptions = () => {
    const { language } = useLanguageStore();

    const { data, isLoading, error } = useQuery({
        queryKey: ['subscriptions', 'plans'],
        queryFn: () => subscriptionsApi.getPlans(),
    });

    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {[1, 2, 3].map((i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <Card>
                            <CardContent>
                                <Skeleton variant="text" width="80%" sx={{ mb: 2 }} />
                                <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
                                <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
                                <Skeleton variant="text" width="100%" sx={{ mb: 1 }} />
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (error || !data || (Array.isArray(data) && data.length === 0)) {
        return <EmptyState />;
    }

    const plans: SubscriptionPlan[] = Array.isArray(data) ? data : [];

    return (
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
                {t('nav.subscriptions', language)}
            </Typography>

            <Grid container spacing={3}>
                {plans.map((plan) => (
                    <Grid item xs={12} sm={6} md={4} key={plan.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                },
                            }}
                        >
                            <CardContent sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                    {plan.name}
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                        ${plan.price}
                                        <Typography component="span" variant="body2" color="textSecondary">
                                            /mo
                                        </Typography>
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                    {plan.description}
                                </Typography>

                                {/* Features */}
                                <Stack spacing={1}>
                                    {plan.features && plan.features.map((feature, idx) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <CheckIcon
                                                sx={{
                                                    fontSize: '1.2rem',
                                                    color: 'success.main',
                                                }}
                                            />
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </CardContent>

                            <CardActions>
                                <Button fullWidth variant="contained">
                                    {t('btn.create', language)}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};
