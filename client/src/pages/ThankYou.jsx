import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const ThankYou  = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('workshopCreated')) {
      navigate('/');
    } else {
      localStorage.removeItem('workshopCreated'); // Sicherheit: nur nach Erstellung sichtbar
    }
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Werkstatt erfolgreich erstellt!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Ihre Werkstatt wurde erfolgreich gespeichert. Sie können sie jetzt im Dashboard verwalten.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/provider/dashboard')}
      >
        Zum Dashboard
      </Button>
    </Container>
  );
};

export default ThankYou;
