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
} from '@mui/material';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { contractsApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import { LoadingTable } from '@/components/Loading';
import AddIcon from '@mui/icons-material/Add';

export const Contracts = () => {
    const { user, canAccess } = useAuthStore();
    const { language } = useLanguageStore();
    const marketId = user?.marketId || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['contracts', marketId],
        queryFn: () => contractsApi.getAll(marketId),
        enabled: !!marketId,
    });

    const canCreate = canAccess(['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']);

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
                            <TableCell>Contract ID</TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Amount</TableCell>
                            <TableCell>{t('field.createdAt', language)}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((contract) => (
                            <TableRow key={contract.id} hover>
                                <TableCell>{contract.id.substring(0, 8)}</TableCell>
                                <TableCell>{contract.customerId}</TableCell>
                                <TableCell>{contract.status}</TableCell>
                                <TableCell>{contract.totalAmount}</TableCell>
                                <TableCell>
                                    {new Date(contract.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
