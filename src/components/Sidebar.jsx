import React from 'react';
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider
} from '@mui/material';
import { ExitToApp as LogoutIcon } from '@mui/icons-material';
import logo from '../assets/images/integritas_logo.jpg';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ items = [], title = 'Dashboard', onLogout, mobileOpen, handleDrawerToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#0C1322', color: '#fff' }}>
            {/* Logo / Brand Section */}
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                    component="img"
                    src={logo}
                    alt="Integritas"
                    sx={{ width: 40, height: 40, objectFit: 'contain' }}
                />
                <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 200, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                        Integritas
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                        {title}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

            {/* Navigation Items List */}
            <Box sx={{ flex: 1, overflowY: 'auto', px: 2, pt: 2 }}>
                <List sx={{ p: 0 }}>
                    {items.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => {
                                        if (item.onClick) {
                                            item.onClick();
                                        } else {
                                            navigate(item.path);
                                        }
                                        if (mobileOpen && handleDrawerToggle) handleDrawerToggle();
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1,
                                        bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            color: '#fff',
                                        },
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
                                    />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Bottom Actions (Logout) */}
            <Box sx={{ p: 2 }}>
                <ListItemButton
                    onClick={onLogout}
                    sx={{
                        borderRadius: 2,
                        color: 'rgba(255,255,255,0.6)',
                        '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <LogoutIcon />
                    </ListItemIcon>
                    <ListItemText primary="Log Out" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                </ListItemButton>
            </Box>
        </Box>
    );
};

export default Sidebar;
