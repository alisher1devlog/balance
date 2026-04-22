import { Box, Typography } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { useLanguageStore } from '@/stores/languageStore';
import { t } from '@/i18n/translations';

interface EmptyStateProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

export const EmptyState = ({
    title,
    description,
    icon = <FolderOpenIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />,
}: EmptyStateProps) => {
    const { language } = useLanguageStore();

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 2,
            }}
        >
            {icon}
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                {title || t('empty.title', language)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {description || t('empty.description', language)}
            </Typography>
        </Box>
    );
};
