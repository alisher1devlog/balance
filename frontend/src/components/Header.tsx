import { Box, AppBar, Toolbar, IconButton, Select, MenuItem } from '@mui/material';
import { useThemeStore } from '@/stores/themeStore';
import { useLanguageStore, Language } from '@/stores/languageStore';
import { useAuthStore } from '@/stores/authStore';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const DRAWER_WIDTH = 280;

export const Header = () => {
    const { mode, toggle } = useThemeStore();
    const { language, setLanguage } = useLanguageStore();
    const { user } = useAuthStore();

    const languages: Language[] = ['uz', 'en', 'ru'];

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${DRAWER_WIDTH}px)`,
                ml: `${DRAWER_WIDTH}px`,
                backgroundColor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Left Side - Title */}
                <Box sx={{ fontSize: '1.25rem', fontWeight: 600 }}>
                    {user?.fullName || 'Balance'}
                </Box>

                {/* Right Side - Actions */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* Language Selector */}
                    <Select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value as Language)}
                        sx={{
                            width: 80,
                            height: 40,
                            fontSize: '0.875rem',
                        }}
                        variant="outlined"
                        size="small"
                    >
                        {languages.map((lang) => (
                            <MenuItem key={lang} value={lang}>
                                {lang.toUpperCase()}
                            </MenuItem>
                        ))}
                    </Select>

                    {/* Theme Toggle */}
                    <IconButton
                        onClick={toggle}
                        color="inherit"
                        sx={{ ml: 1 }}
                    >
                        {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
