import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  MenuItem,
  Select,
  Button,
  Alert,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [workshop, setWorkshop] = useState(null);
  const [selectedService, setSelectedService] = useState('');
  const [serviceDuration, setServiceDuration] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/workshops/${id}`)
      .then(res => setWorkshop(res.data))
      .catch(() => setError('Fehler beim Laden der Werkstattinformationen.'));
  }, [id]);

  const isDateAvailable = date => {
    const dayName = date.format('dddd');
    return workshop?.availability?.some(a => a.day === dayName);
  };

  const generateTimeSlots = (date, duration) => {
    const dayName = date.format('dddd');
    const slot = workshop.availability.find(a => a.day === dayName);
    if (!slot) return [];

    const start = dayjs(`${date.format('YYYY-MM-DD')}T${slot.start}`);
    const end = dayjs(`${date.format('YYYY-MM-DD')}T${slot.end}`);
    const slots = [];

    let current = start;
    while (current.add(duration, 'minute').isSameOrBefore(end)) {
      slots.push(current.format('HH:mm'));
      current = current.add(30, 'minute');
    }

    return slots;
  };

  useEffect(() => {
    if (selectedService && selectedDate && workshop) {
      const duration = workshop.services.find(s => s.title === selectedService)?.duration || 0;
      setServiceDuration(duration);
      const times = generateTimeSlots(selectedDate, duration);
      setAvailableTimes(times);
      setSelectedTime('');
    }
  }, [selectedService, selectedDate, workshop]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError('Bitte alle Felder ausfüllen.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await axios.post('http://localhost:5000/api/bookings', {
        workshopId: workshop._id,
        customerId: user._id,
        service: selectedService,
        date: selectedDate.toISOString(),
        time: selectedTime,
      });

      setMessage('Reservierung erfolgreich!');
      setTimeout(() => navigate('/dashboard/customer'), 2000);
    } catch {
      setError('Reservierung fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="de">
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 6, p: 4, background: '#f5f5f5', borderRadius: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          Werkstattreservierung
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {message && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {workshop ? (
          <>
            <Typography variant="h6" gutterBottom>
              {workshop.name}
            </Typography>
            <Typography variant="body2" gutterBottom color="text.secondary">
              {workshop.description}
            </Typography>

            <FormControl fullWidth sx={{ mb: 3, mt: 2 }}>
              <InputLabel>Service auswählen</InputLabel>
              <Select
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                label="Service auswählen"
              >
                {workshop.services.map((s, i) => (
                  <MenuItem key={i} value={s.title}>
                    {s.title} – {s.duration} min – {s.price} €
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <DatePicker
              label="Datum wählen"
              value={selectedDate}
              onChange={setSelectedDate}
              shouldDisableDate={date => !isDateAvailable(date)}
              renderInput={params => <TextField {...params} fullWidth sx={{ mb: 3 }} />}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Uhrzeit wählen</InputLabel>
              <Select
                value={selectedTime}
                onChange={e => setSelectedTime(e.target.value)}
                disabled={!availableTimes.length}
              >
                {availableTimes.map((time, i) => (
                  <MenuItem key={i} value={time}>
                    {time}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="contained" fullWidth disabled={loading} onClick={handleBooking}>
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Reservieren'}
            </Button>
          </>
        ) : (
          <Typography>Lade Werkstattdaten...</Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default BookingPage;
