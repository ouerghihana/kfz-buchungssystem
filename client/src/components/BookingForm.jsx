import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Box,
} from '@mui/material';
import axios from 'axios';

const BookingForm = ({ workshops = [], onClose }) => {
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const selectedWorkshop = workshops.find(w => w._id === selectedWorkshopId);

  const handleSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const generateTimeSlots = (start, end, duration = 60) => {
    const slots = [];
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);

    const startTime = new Date();
    startTime.setHours(startH, startM, 0, 0);

    const endTime = new Date();
    endTime.setHours(endH, endM, 0, 0);

    while (startTime < endTime) {
      slots.push(startTime.toTimeString().slice(0, 5));
      startTime.setMinutes(startTime.getMinutes() + duration);
    }
    return slots;
  };

  const getNextDateForDay = dayName => {
    const dayMap = {
      Montag: 1,
      Dienstag: 2,
      Mittwoch: 3,
      Donnerstag: 4,
      Freitag: 5,
      Samstag: 6,
      Sonntag: 0,
    };
    const targetDay = dayMap[dayName];
    const today = new Date();
    const day = today.getDay();
    const diff = (targetDay - day + 7) % 7 || 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);
    return `${dayName} – ${nextDate.toLocaleDateString('de-DE')}`;
  };

  const availableSlots = (() => {
    if (!selectedWorkshop || !selectedDay) return [];
    const dayLabel = selectedDay.split(' – ')[0];
    const dayData = selectedWorkshop.availability.find(a => a.day === dayLabel);
    if (!dayData) return [];
    return generateTimeSlots(dayData.start, dayData.end);
  })();

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!selectedWorkshopId || !selectedDay) return;

      const dayLabel = selectedDay.split(' – ')[0];
      const dayMap = {
        Montag: 1,
        Dienstag: 2,
        Mittwoch: 3,
        Donnerstag: 4,
        Freitag: 5,
        Samstag: 6,
        Sonntag: 0,
      };
      const targetDay = dayMap[dayLabel];
      const today = new Date();
      const diff = (targetDay - today.getDay() + 7) % 7 || 7;
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + diff);
      bookingDate.setHours(0, 0, 0, 0);
      const isoDate = bookingDate.toISOString();

      try {
        const res = await axios.get(
          `http://localhost:5000/api/bookings/booked-slots/${selectedWorkshopId}?date=${isoDate}`
        );
        setBookedSlots(res.data.booked || []);
      } catch (err) {
        console.error('Fehler beim Laden der gebuchten Slots:', err);
        setBookedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [selectedWorkshopId, selectedDay]);

  const handleSubmit = async () => {
    if (!selectedWorkshopId || !selectedService || !selectedDay || !selectedHour) {
      return handleSnackbar('❗ Bitte alle Felder ausfüllen.', 'warning');
    }

    const dayMap = {
      Montag: 1,
      Dienstag: 2,
      Mittwoch: 3,
      Donnerstag: 4,
      Freitag: 5,
      Samstag: 6,
      Sonntag: 0,
    };

    const dayLabel = selectedDay.split(' – ')[0];
    const targetDay = dayMap[dayLabel];
    if (targetDay === undefined) return handleSnackbar('❗ Ungültiger Tag.', 'error');

    const today = new Date();
    const daysUntilTarget = (targetDay - today.getDay() + 7) % 7 || 7;
    const bookingDate = new Date(today);
    bookingDate.setDate(today.getDate() + daysUntilTarget);

    const [hour, minute] = selectedHour.split(':');
    bookingDate.setHours(parseInt(hour), parseInt(minute), 0);

    const isoDateTime = bookingDate.toISOString();

    const serviceObj = selectedWorkshop?.services.find(s => s.title === selectedService);
    if (!serviceObj) return handleSnackbar('❗ Service konnte nicht gefunden werden.', 'error');

    const token = localStorage.getItem('token');
    if (!token) return handleSnackbar('🔒 Sie müssen eingeloggt sein, um zu buchen.', 'error');

    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/bookings',
        {
          workshopId: selectedWorkshopId,
          service: serviceObj._id,
          dateTime: isoDateTime,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 201) {
        handleSnackbar('✅ Buchung erfolgreich!');
        setSelectedWorkshopId('');
        setSelectedService('');
        setSelectedDay('');
        setSelectedHour('');
        if (onClose) onClose();
      }
    } catch (error) {
      console.error(error);
      handleSnackbar(error.response?.data?.message || '❌ Buchung fehlgeschlagen.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        borderRadius: 4,
        background: 'linear-gradient(to bottom right, #ffffff, #f0f4ff)',
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        📝 Buchungsformular
      </Typography>

      <TextField
        select
        fullWidth
        label="🔧 Werkstatt auswählen"
        value={selectedWorkshopId}
        onChange={e => {
          setSelectedWorkshopId(e.target.value);
          setSelectedService('');
          setSelectedDay('');
          setSelectedHour('');
        }}
        sx={{ mb: 3 }}
      >
        {workshops.map(w => (
          <MenuItem key={w._id} value={w._id}>
            {w.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="🛠 Service auswählen"
        value={selectedService}
        onChange={e => setSelectedService(e.target.value)}
        disabled={!selectedWorkshop}
        sx={{ mb: 3 }}
      >
        {selectedWorkshop?.services?.map((s, i) => (
          <MenuItem key={i} value={s.title}>
            {s.title} – {s.duration} min – {s.price} €
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        fullWidth
        label="📅 Verfügbare Tage"
        value={selectedDay}
        onChange={e => {
          setSelectedDay(e.target.value);
          setSelectedHour('');
        }}
        disabled={!selectedWorkshop}
        sx={{ mb: 3 }}
      >
        {selectedWorkshop?.availability?.map((a, i) => {
          const label = getNextDateForDay(a.day);
          return (
            <MenuItem key={i} value={label}>
              {label}
            </MenuItem>
          );
        })}
      </TextField>

      {availableSlots.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
            ⏰ Uhrzeit auswählen:
          </Typography>
          <Grid container spacing={1}>
            {availableSlots.map((slot, i) => {
              const isBooked = bookedSlots.includes(slot);
              return (
                <Grid item key={i} xs={3} sm={2} md={2}>
                  <Button
                    fullWidth
                    disabled={isBooked}
                    onClick={() => setSelectedHour(slot)}
                    sx={{
                      backgroundColor: selectedHour === slot ? '#1976d2' : 'white',
                      color: selectedHour === slot ? 'white' : isBooked ? '#aaa' : 'black',
                      boxShadow: selectedHour === slot ? '0 0 6px rgba(25, 118, 210, 0.6)' : 'none',
                      border: '1px solid #ccc',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor:
                          selectedHour === slot ? '#1565c0' : isBooked ? 'white' : '#f0f0f0',
                      },
                    }}
                  >
                    {slot}
                  </Button>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSubmit}
        disabled={loading}
        sx={{
          background: 'linear-gradient(to right, #1a237e, #3949ab)',
          fontWeight: 'bold',
          color: 'white',
          '&:hover': {
            background: 'linear-gradient(to right, #0f174a, #1a237e)',
          },
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Jetzt buchen'}
      </Button>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BookingForm;
