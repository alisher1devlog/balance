import { useQuery } from '@tanstack/react-query';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
} from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { usersApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import { LoadingTable } from '@/components/Loading';
import AddIcon from '@mui/icons-material/Add';

export const Users = () => {
    const { canAccess } = useAuthStore();
    const { language } = useLanguageStore();

    const { data, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: () => usersApi.getAll(),
    });

    const canCreate = canAccess(['SUPERADMIN', 'OWNER', 'ADMIN']);

    const statusColor: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
        ACTIVE: 'success',
        INACTIVE: 'default',
        SUSPENDED: 'error',
    };

    if (isLoading) {
        return <LoadingTable />;
    }

    if (error || !data || data.length === 0) {
        return (
            <Box>
                {canCreate && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ mb: 2 }}
                    >
                        {t('btn.add', language)}
                    </Button>
                )}
                <EmptyState />
            </Box>
        );
    }

    return (
        <Box>
            {canCreate && (
                <Box sx={{ mb: 2 }}>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        {t('btn.add', language)}
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell>{t('field.name', language)}</TableCell>
                            <TableCell>{t('field.email', language)}</TableCell>
                            <TableCell>{t('field.role', language)}</TableCell>
                            <TableCell>{t('field.status', language)}</TableCell>
                            <TableCell>{t('field.createdAt', language)}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>{user.fullName}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={user.role} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={user.status}
                                        size="small"
                                        color={statusColor[user.status]}
                                    />
                                </TableCell>
                                <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
