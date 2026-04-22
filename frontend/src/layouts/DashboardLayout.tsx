import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

const DRAWER_WIDTH = 280;
const HEADER_HEIGHT = 64;

export const DashboardLayout = () => {
    return (
        <Box sx={{ display: 'flex' }}>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    ml: `${DRAWER_WIDTH}px`,
                }}
            >
                {/* Header */}
                <Header />

                {/* Page Content */}
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        p: 3,
                        mt: `${HEADER_HEIGHT}px`,
                        overflow: 'auto',
                        backgroundColor: 'background.default',
                        minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};
