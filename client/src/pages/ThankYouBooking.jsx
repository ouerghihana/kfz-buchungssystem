// src/pages/ThankYouBooking.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const ThankYouBooking = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('bookingSuccess')) {
      navigate('/');
    } else {
      localStorage.removeItem('bookingSuccess'); // Empêche d'accéder à la page sans réservation
    }
  }, [navigate]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Buchung erfolgreich!
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Ihre Buchung wurde erfolgreich gespeichert. Sie können Ihre Termine im Bereich „Meine Buchungen“ einsehen.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate('/meine-buchungen')}
      >
        Zu Meine Buchungen
      </Button>
    </Container>
  );
};

export default ThankYouBooking;
