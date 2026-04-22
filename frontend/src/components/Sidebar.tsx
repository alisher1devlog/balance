import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';
import { Role } from '@/api/types';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import ProductionQuantityLimitsIcon from '@mui/icons-material/ProductionQuantityLimits';
import CategoryIcon from '@mui/icons-material/Category';
import LogoutIcon from '@mui/icons-material/Logout';

const DRAWER_WIDTH = 280;

export const Sidebar = () => {
    const navigate = useNavigate();
    const { user, logout, canAccess } = useAuthStore();
    const { language } = useLanguageStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        {
            label: t('nav.dashboard', language),
            icon: <DashboardIcon />,
            path: '/dashboard',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER],
        },
        {
            label: t('nav.users', language),
            icon: <PeopleIcon />,
            path: '/users',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN],
        },
        {
            label: t('nav.customers', language),
            icon: <PeopleIcon />,
            path: '/customers',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER],
        },
        {
            label: t('nav.contracts', language),
            icon: <DescriptionIcon />,
            path: '/contracts',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER],
        },
        {
            label: t('nav.products', language),
            icon: <ProductionQuantityLimitsIcon />,
            path: '/products',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER],
        },
        {
            label: t('nav.categories', language),
            icon: <CategoryIcon />,
            path: '/categories',
            roles: [Role.SUPERADMIN, Role.OWNER, Role.ADMIN, Role.MANAGER, Role.SELLER],
        },
    ];

    return (
        <Drawer
            sx={{
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
            variant="permanent"
            anchor="left"
        >
            {/* Logo / Header */}
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Box sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Balance</Box>
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
                    {user?.role}
                </Box>
            </Box>

            <Divider />

            {/* Menu Items */}
            <List sx={{ flex: 1 }}>
                {menuItems.map((item) =>
                    canAccess(item.roles) ? (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                onClick={() => navigate(item.path)}
                                sx={{ py: 1.5 }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ) : null
                )}
            </List>

            <Divider />

            {/* Logout Button */}
            <Box sx={{ p: 2 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    sx={{ textTransform: 'none' }}
                >
                    {t('btn.logout', language)}
                </Button>
            </Box>
        </Drawer>
    );
};
