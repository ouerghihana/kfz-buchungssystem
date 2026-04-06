// BookingSection.jsx
import React, { useState } from 'react';
import { Box, Typography, Button, Snackbar, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import axios from 'axios';

const BookingSection = ({ workshopId }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleBooking = async () => {
    if (!selectedDate) {
      setSnackbar({ open: true, message: 'Bitte wählen Sie ein Datum.', severity: 'warning' });
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/bookings', {
        workshopId,
        date: selectedDate.toISOString(),
      });

      console.log('Booking successful:', res.data);
      setSnackbar({ open: true, message: 'Buchung erfolgreich!', severity: 'success' });
      setSelectedDate(null); // Clear selection after booking
    } catch (error) {
      console.error('Booking error:', error);
      setSnackbar({ open: true, message: 'Fehler bei der Buchung.', severity: 'error' });
    }
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" mb={2}>
        📅 Jetzt Termin buchen
      </Typography>

      <DatePicker
        label="Datum auswählen"
        value={selectedDate}
        onChange={newValue => setSelectedDate(newValue)}
        minDate={dayjs()}
        sx={{ mb: 2, width: '100%' }}
      />

      <Button variant="contained" color="primary" onClick={handleBooking} disabled={!selectedDate}>
        Jetzt buchen
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BookingSection;
