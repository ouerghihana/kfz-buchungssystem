import React, { useState, useContext, useEffect } from 'react';
import {
  AppBar, Box, Toolbar, Typography, Button, IconButton, Avatar,
  Menu, MenuItem, Divider, Snackbar, Alert, Tooltip, useMediaQuery,
  useTheme, Badge
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LoginDialog from '../pages/LoginDialog';
import RegisterDialog from '../pages/RegisterDialog';

import LogoutIcon from '@mui/icons-material/Logout';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import NotificationsIcon from '@mui/icons-material/Notifications';

import axios from 'axios';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [prevUnreadCount, setPrevUnreadCount] = useState(0);
  const [blink, setBlink] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const menuOpen = Boolean(anchorEl);
  const notifOpen = Boolean(notifAnchorEl);

  const unreadCount = notifications.filter(n => !n.read).length;

  const audio = new Audio('/sound/relax-message-tone.mp3');

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/notifications', {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      const data = res.data || [];
      const unread = data.filter(n => !n.read).length;

      if (unread > prevUnreadCount) {
        audio.play().catch(err => console.warn('🔇 Tonfehler:', err));
        if (navigator.vibrate) navigator.vibrate([200]);
        setBlink(true);
      }

      setNotifications(data);
      setPrevUnreadCount(unread);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Benachrichtigungen:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, [user]);

  const markAllAsRead = async () => {
    try {
      await axios.patch('http://localhost:5000/api/bookings/notifications/read', {}, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setBlink(false);
    } catch (err) {
      console.error('❌ Fehler beim Markieren als gelesen:', err);
    }
  };

  const handleLogout = () => {
    logout();
    setSnackbarMsg('Abmeldung erfolgreich 👋');
    setSnackbarOpen(true);
    navigate('/');
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#fff', color: '#111', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 }, minHeight: 64 }}>
        {/* Logo */}
        <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <Box component="img" src="/images/werkstatt.svg" alt="KFZ Logo" sx={{
            height: 45, width: 45, mr: 1,
            filter: 'invert(17%) sepia(94%) saturate(3496%) hue-rotate(179deg) brightness(100%) contrast(98%)'
          }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: '#039be5' }}>KFZ-Buchung</Typography>
            <Typography variant="caption" sx={{ color: '#757575' }}>Schnell. Einfach. Online...</Typography>
          </Box>
        </Box>

        {/* Navigation buttons */}
        <Box display="flex" alignItems="center" gap={2}>
          <Button color="inherit" onClick={() => navigate('/')}>Startseite</Button>
          <Button color="inherit" onClick={() => navigate('/hilfe')} startIcon={<HelpOutlineIcon />}>Hilfe-Center</Button>

          {user?.role === 'customer' && (
            <Button variant="outlined" onClick={() => navigate('/meine-buchungen')} startIcon={<BookOnlineIcon />}
              sx={{ border: '2px solid #0c9cd3', color: '#0c9cd3', fontWeight: 'bold' }}>
              Meine Buchungen
            </Button>
          )}

          {user?.role === 'service_provider' && (
            <Button component={Link} to="/werkstatt-hinzufuegen" variant="outlined" startIcon={<AddIcon />}
              sx={{ border: '2px solid #0c9cd3', color: '#0c9cd3', fontWeight: 'bold' }}>
              Werkstatt hinzufügen
            </Button>
          )}

          {/* 🔔 Notification Icon */}
          {user && (
            <Tooltip title="Benachrichtigungen">
              <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)} sx={{
                animation: blink ? 'blinker 1s linear infinite' : 'none',
                color: blink ? '#d32f2f' : '#555',
              }}>
                <Badge badgeContent={unreadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* 👤 Profil */}
          {!user ? (
            <Button onClick={() => setOpenLogin(true)} variant="outlined" sx={{ borderRadius: 3, px: 2, py: 1 }}>
              Einloggen
            </Button>
          ) : (
            <Tooltip title={user?.name}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar sx={{ bgcolor: '#039be5' }}>{user?.name?.[0]?.toUpperCase()}</Avatar>
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* 👤 Menu */}
        <Menu anchorEl={anchorEl} open={menuOpen} onClose={() => setAnchorEl(null)}
          PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 240, borderRadius: 2 } }}>
          <MenuItem disabled>
            <PersonIcon sx={{ mr: 1 }} /> Eingeloggt als: <strong style={{ marginLeft: 4 }}>{user?.role}</strong>
          </MenuItem>
          <Divider />
          {(user?.role === 'admin' || user?.role === 'service_provider') && (
            <MenuItem onClick={() => { navigate(user.role === 'admin' ? '/dashboard/admin' : '/provider/dashboard'); setAnchorEl(null); }}>
              <DashboardIcon sx={{ mr: 1 }} /> Dashboard
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
            <LogoutIcon sx={{ mr: 1 }} /> Abmelden
          </MenuItem>
        </Menu>

        {/* 🔔 Notification Menu */}
        <Menu anchorEl={notifAnchorEl} open={notifOpen} onClose={() => setNotifAnchorEl(null)}
          PaperProps={{ elevation: 3, sx: { mt: 1.5, minWidth: 280, borderRadius: 2 } }}>
          <Box px={2} pt={1}>
            <Typography variant="subtitle1" fontWeight="bold">Benachrichtigungen</Typography>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <MenuItem disabled>Keine neuen Benachrichtigungen</MenuItem>
          ) : (
            notifications.map((notif, i) => (
              <MenuItem key={i} sx={{ whiteSpace: 'normal', opacity: notif.read ? 0.5 : 1 }}>
                {notif.message}
              </MenuItem>
            ))
          )}
          {notifications.length > 0 && (
            <>
              <Divider />
              <MenuItem onClick={() => { markAllAsRead(); setNotifAnchorEl(null); setBlink(false); }}>
                Alles als gelesen markieren
              </MenuItem>
            </>
          )}
        </Menu>

        {/* 🔐 Login/Register/Dialog */}
        <LoginDialog open={openLogin} onClose={() => setOpenLogin(false)}
          onSwitchToRegister={() => { setOpenLogin(false); setOpenRegister(true); }} />
        <RegisterDialog open={openRegister} onClose={() => setOpenRegister(false)}
          onSwitchToLogin={() => { setOpenRegister(false); setOpenLogin(true); }} />

        {/* ✅ Snackbar */}
        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setSnackbarOpen(false)}>{snackbarMsg}</Alert>
        </Snackbar>
      </Toolbar>

      {/* 🔁 Blinker Keyframes */}
      <style>
        {`
          @keyframes blinker {
            50% { opacity: 0.3; transform: scale(1.1); }
          }
        `}
      </style>
    </AppBar>
  );
};

export default Navbar;
