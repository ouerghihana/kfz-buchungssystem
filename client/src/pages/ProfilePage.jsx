import React, { useContext } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Handle redirect back to dashboard based on role
  const handleBack = () => {
    if (user?.role === 'service_provider') {
      navigate('/dashboard/provider');
    } else if (user?.role === 'customer') {
      navigate('/dashboard/customer');
    } else {
      navigate('/');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f4f4f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 500,
          width: '100%',
          background: 'linear-gradient(to bottom right, #ffffff, #f0f0f0)',
        }}
      >
        <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold">
          Benutzerprofil
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Name: <strong>{user?.name || 'Unbekannt'}</strong>
          </Typography>
          <Typography variant="body1" gutterBottom>
            E-Mail: {user?.email}
          </Typography>
          <Typography variant="body1" gutterBottom>
            Rolle:{' '}
            {user?.role === 'customer'
              ? 'Kunde'
              : user?.role === 'service_provider'
                ? 'Werkstatt'
                : 'Unbekannt'}
          </Typography>
        </Box>

        <Button variant="contained" color="primary" fullWidth sx={{ mt: 4 }} onClick={handleBack}>
          Zurück zur Werkstatt
        </Button>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
