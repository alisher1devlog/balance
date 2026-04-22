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
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { customersApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import { LoadingTable } from '@/components/Loading';
import AddIcon from '@mui/icons-material/Add';

export const Customers = () => {
    const { user, canAccess } = useAuthStore();
    const { language } = useLanguageStore();
    const marketId = user?.marketId || '';

    const { data, isLoading, error } = useQuery({
        queryKey: ['customers', marketId],
        queryFn: () => customersApi.getAll(marketId),
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
                            <TableCell>{t('field.name', language)}</TableCell>
                            <TableCell>{t('field.email', language)}</TableCell>
                            <TableCell>{t('field.phone', language)}</TableCell>
                            <TableCell>{t('field.createdAt', language)}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((customer) => (
                            <TableRow key={customer.id} hover>
                                <TableCell>{customer.fullName}</TableCell>
                                <TableCell>{customer.email || '-'}</TableCell>
                                <TableCell>{customer.phone}</TableCell>
                                <TableCell>
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
