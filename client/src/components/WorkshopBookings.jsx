import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';

const WorkshopBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bookings/workshop-bookings', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      setBookings(res.data.bookings);
    } catch (err) {
      console.error('❌ Fehler beim Laden der Buchungen:', err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/bookings/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      setSnackbar({ open: true, message: `Buchung ${status}`, severity: 'success' });
      setBookings(prev => prev.map(b => (b._id === id ? res.data.booking : b)));
    } catch (err) {
      console.error('❌ Fehler beim Aktualisieren:', err.message);
      setSnackbar({ open: true, message: 'Aktualisierung fehlgeschlagen', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.token]);

  const filteredBookings = () => {
    switch (tab) {
      case 1:
        return bookings.filter(b => b.status === 'confirmed');
      case 2:
        return bookings.filter(b => b.status === 'canceled');
      default:
        return bookings;
    }
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} sx={{ mb: 2 }}>
        <Tab label="Alle" />
        <Tab label="Bestätigt" />
        <Tab label="Storniert" />
      </Tabs>

      {filteredBookings().length === 0 ? (
        <Typography variant="body2" color="text.secondary">Keine Buchungen gefunden.</Typography>
      ) : (
        filteredBookings().map((booking) => (
          <Paper key={booking._id} sx={{ mb: 2, p: 2, borderLeft: '4px solid #1976d2' }}>
            <Typography fontWeight="bold">{booking.service.title}</Typography>
            <Typography variant="body2">
  Kunde: <strong>{booking.customer?.name || 'Unbekannt'}</strong>
</Typography>

            <Typography variant="body2">Datum: {dayjs(booking.dateTime).format('DD.MM.YYYY')}</Typography>
            <Typography variant="body2">Uhrzeit: {dayjs(booking.dateTime).format('HH:mm')}</Typography>
            <Typography variant="body2">Kunde: {booking.customer?.name}</Typography>
            <Typography variant="body2">Status: <strong>{booking.status}</strong></Typography>

            {booking.status === 'pending' && (
              <Box mt={1} display="flex" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => updateStatus(booking._id, 'confirmed')}
                >
                  Bestätigen
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={() => updateStatus(booking._id, 'canceled')}
                >
                  Stornieren
                </Button>
              </Box>
            )}
          </Paper>
        ))
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkshopBookings;
