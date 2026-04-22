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
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
} from '@mui/material';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { productsApi } from '@/api';
import { EmptyState } from '@/components/EmptyState';
import { LoadingTable } from '@/components/Loading';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export const Products = () => {
    const { user, canAccess } = useAuthStore();
    const { language } = useLanguageStore();
    const marketId = user?.marketId || '';

    const [open, setOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', price: 0, description: '' });

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => productsApi.getAll(marketId),
        enabled: !!marketId,
    });

    const canCreate = canAccess(['SUPERADMIN', 'OWNER', 'ADMIN', 'MANAGER']);

    const handleOpen = () => {
        setEditId(null);
        setFormData({ name: '', price: 0, description: '' });
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = async () => {
        try {
            if (editId) {
                // await productsApi.update(editId, formData);
            } else {
                // await productsApi.create({ ...formData, marketId });
            }
            handleClose();
            // Refresh query
        } catch (error) {
            console.error('Error:', error);
        }
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
                        onClick={handleOpen}
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
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpen}
                    >
                        {t('btn.add', language)}
                    </Button>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'action.hover' }}>
                            <TableCell>{t('field.name', language)}</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((product) => (
                            <TableRow key={product.id} hover>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>{product.description || '-'}</TableCell>
                                <TableCell align="right">
                                    {canCreate && (
                                        <Stack direction="row" spacing={1}>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    setEditId(product.id);
                                                    setFormData({
                                                        name: product.name,
                                                        price: product.price,
                                                        description: product.description || '',
                                                    });
                                                    setOpen(true);
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                            // onClick={() => handleDelete(product.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Stack>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>{editId ? 'Edit Product' : 'Add Product'}</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={2}>
                        <TextField
                            label={t('field.name', language)}
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                                setFormData({ ...formData, price: parseFloat(e.target.value) })
                            }
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            multiline
                            rows={3}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('btn.cancel', language)}</Button>
                    <Button onClick={handleSave} variant="contained">
                        {t('btn.save', language)}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
