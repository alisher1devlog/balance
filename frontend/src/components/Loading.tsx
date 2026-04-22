import { Box, Skeleton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

interface LoadingTableProps {
    rows?: number;
    columns?: number;
}

export const LoadingTable = ({ rows = 5, columns = 5 }: LoadingTableProps) => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {Array.from({ length: columns }).map((_, i) => (
                            <TableCell key={i}>
                                <Skeleton variant="text" width="80%" />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: rows }).map((_, rowIdx) => (
                        <TableRow key={rowIdx}>
                            {Array.from({ length: columns }).map((_, colIdx) => (
                                <TableCell key={colIdx}>
                                    <Skeleton variant="text" width="90%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export const LoadingCard = () => {
    return (
        <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={30} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={30} />
        </Box>
    );
};
