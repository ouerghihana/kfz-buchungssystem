import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Button,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [successSnackbar, setSuccessSnackbar] = useState('');
  const isMobile = useMediaQuery('(max-width:768px)');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        setBookings(res.data.bookings);
      } catch (err) {
        console.error('Fehler beim Laden der Buchungen:', err);
      }
    };
    fetchBookings();
  }, [user?.token]);

  const handleDeleteClick = (booking) => {
    setSelectedBooking(booking);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/bookings/${selectedBooking._id}`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setBookings((prev) => prev.filter((b) => b._id !== selectedBooking._id));
      setDeleteDialogOpen(false);
      setSuccessSnackbar('Stornierte Buchung gelöscht');
    } catch (err) {
      console.error('Fehler beim Löschen:', err);
    }
  };

  const activeBookings = bookings.filter((b) => b.status !== 'canceled');
  const canceledBookings = bookings.filter((b) => b.status === 'canceled');

  const renderBookingCard = (booking, isCanceled = false) => {
    if (!booking?.workshop) return null;
    const date = new Date(booking.dateTime);

    return (
      <Paper
        key={booking._id}
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 4,
          minWidth: isMobile ? '100%' : '360px',
          backgroundColor: 'white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
          borderLeft: isCanceled ? '6px solid #ccc' : '6px solid #1976d2',
          opacity: isCanceled ? 0.6 : 1,
        }}
      >
        <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center">
          <MiscellaneousServicesIcon sx={{ mr: 1, color: '#1976d2' }} />
          {booking.service.title}
        </Typography>
        <Box mt={1} mb={2} borderBottom="1px solid #eee" />
        <Box display="flex" alignItems="center" mb={1}>
          <CalendarTodayIcon sx={{ fontSize: 20, mr: 1 }} />
          <Typography>{date.toLocaleDateString('de-DE')}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <AccessTimeIcon sx={{ fontSize: 20, mr: 1 }} />
          <Typography>
            {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={1}>
          <DirectionsCarIcon sx={{ fontSize: 20, mr: 1 }} />
          <Typography>{booking.workshop.name}</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <LocationOnIcon sx={{ fontSize: 20, mr: 1 }} />
          <Typography>{booking.workshop.address}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <PendingActionsIcon
            sx={{ fontSize: 20, mr: 1, color: isCanceled ? '#757575' : '#ff9800' }}
          />
          <Typography>
            Status: <strong>{isCanceled ? 'Storniert' : 'Ausstehend'}</strong>
          </Typography>
        </Box>

        {/* Supprimer uniquement si annulé */}
        {isCanceled && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteClick(booking)}
            sx={{ mt: 2 }}
          >
            Löschen
          </Button>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ px: 3, py: 4, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight="bold" display="flex" alignItems="center" gutterBottom>
        <CalendarTodayIcon sx={{ mr: 1, color: '#1976d2' }} /> Meine Buchungen
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Vielen Dank für Ihr Vertrauen! Hier ist eine Übersicht Ihrer aktuellen Termine.
      </Typography>

      <Box display="flex" flexWrap="wrap" gap={3} mb={5}>
        {activeBookings.map((booking) => renderBookingCard(booking))}
      </Box>

      {canceledBookings.length > 0 && (
        <>
          <Typography variant="h6" color="text.secondary" mt={4} mb={2}>
            Stornierte Buchungen
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3}>
            {canceledBookings.map((booking) => renderBookingCard(booking, true))}
          </Box>
        </>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Buchung löschen?</DialogTitle>
        <DialogContent>
          <Typography>Möchten Sie diese stornierte Buchung endgültig löschen?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Ja, löschen
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={Boolean(successSnackbar)}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessSnackbar('')}>
          {successSnackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MyBookings;
