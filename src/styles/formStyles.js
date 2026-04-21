import theme from './theme';
export const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
        bgcolor: '#1E293B',
        borderRadius: 1.5,
        '& fieldset': {
            borderColor: '#374151',
        },
        '&:hover fieldset': {
            borderColor: '#4B5563',
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.colors.brand,
        },
    },
    '& .MuiInputBase-input': {
        py: 1.25,
        fontSize: '0.875rem',
        color: '#FFFFFF',
        border: 'none',
        '&::placeholder': {
            color: '#9CA3AF',
            opacity: 1,
        },
    },
};

export const selectStyle = {
    bgcolor: '#1E293B',
    borderRadius: 1.5,
    color: '#FFFFFF',
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#374151',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4B5563',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.colors.brand,
    },
    '& .MuiSvgIcon-root': {
        color: '#9CA3AF'
    }
};

export const selectMenuProps = {
    PaperProps: {
        sx: {
            bgcolor: '#1E293B',
            color: '#fff',
            border: '1px solid #374151',
            borderRadius: 1.5,
            mt: 0.5,
            '& .MuiMenuItem-root': {
                '&:hover': {
                    bgcolor: '#374151',
                },
            },
        },
    },
};

export const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: '#1A2230',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 4,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    outline: 'none',
};

export const scrollableModalBody = {
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: '#0C1322',
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: '#374151',
        borderRadius: '4px',
        '&:hover': {
            background: '#4B5563',
        },
    },
};

export const searchBarStyle = {
    bgcolor: "#1F2937",
    borderRadius: 1,
    px: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    width: '100%',
    height: '40px',
};

export const searchInputStyle = {
    color: "#FFFFFF",
    fontSize: '0.9rem',
    width: '100%',
    '& input': {
        border: 'none',
        outline: 'none',
        '&::placeholder': {
            color: '#6B7280'
        },
    },
};

export const primaryButtonStyle = {
    bgcolor: theme.colors.brand,
    '&:hover': { bgcolor: '#0D42AF' },
    boxShadow: '0 4px 14px rgba(17, 82, 212, 0.4)',
};

export const dangerButtonStyle = {
    color: '#EF4444',
    bgcolor: 'rgba(239, 68, 68, 0.1)',
    '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
};

// Success button styling
export const successButtonStyle = {
    color: '#10B981',
    bgcolor: 'rgba(16, 185, 129, 0.1)',
    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.2)' },
};

// Table header cell styling
export const tableHeaderCellStyle = {
    color: '#9CA3AF',
    borderBottom: '1px solid #374151',
    fontWeight: 600,
};

// Table body cell styling
export const tableBodyCellStyle = {
    borderBottom: '1px solid #374151',
};

// Paper/Card styling
export const paperStyle = {
    bgcolor: '#1A2230',
    borderRadius: 2,
    border: '1px solid #374151',
};
