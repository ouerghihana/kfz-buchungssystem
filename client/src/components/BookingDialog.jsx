import React, { useEffect, useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress
} from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EngineeringIcon from '@mui/icons-material/Engineering';
import axios from 'axios';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const BookingDialog = ({
  open,
  onClose,
  workshop,
  workshopId,
  userToken,
  onBook
}) => {
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [reservedSlots, setReservedSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = dayjs();

  const weekdayMap = {
    Sunday: 'Sonntag',
    Monday: 'Montag',
    Tuesday: 'Dienstag',
    Wednesday: 'Mittwoch',
    Thursday: 'Donnerstag',
    Friday: 'Freitag',
    Saturday: 'Samstag'
  };

  const getAvailableSlotsForDate = () => {
    if (!selectedDate || !workshop?.weeklyAvailability) return [];

    const weekdayEn = dayjs(selectedDate).format('dddd');
    const weekdayDe = weekdayMap[weekdayEn];

    const avail = workshop.weeklyAvailability.find(d => d.day === weekdayDe);
    if (!avail) return [];

    const slots = [];
    const startHour = parseInt(avail.start.split(':')[0], 10);
    const endHour = parseInt(avail.end.split(':')[0], 10);

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${String(hour).padStart(2, '0')}:00`);
    }

    return slots;
  };

  const handleBooking = async () => {
    const serviceObj = workshop.services.find(s => s.title === selectedService);
    if (!serviceObj) return;

    try {
      setLoading(true);
      await axios.post(
        'http://localhost:5000/api/bookings/create',
        {
          workshopId,
          service: serviceObj,
          dateTime: `${dayjs(selectedDate).format('YYYY-MM-DD')}T${selectedTime}`,
        },
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      onBook(); // redirect or show success
    } catch (err) {
      console.error('❌ Fehler bei der Buchung:', err);
    } finally {
      setLoading(false);
    }
  };

  const dayMap = {
    Sonntag: 0,
    Montag: 1,
    Dienstag: 2,
    Mittwoch: 3,
    Donnerstag: 4,
    Freitag: 5,
    Samstag: 6,
  };

  const shouldDisableDate = (date) => {
    if (!workshop?.weeklyAvailability) return true;

    const jsDay = date.day(); // 0–6
    const activeDays = workshop.weeklyAvailability.map(d => dayMap[d.day]);

    return !activeDays.includes(jsDay);
  };

  useEffect(() => {
    if (!selectedDate || !userToken) return;

    axios
      .get(`http://localhost:5000/api/bookings/reserved/${workshopId}?date=${dayjs(selectedDate).format('YYYY-MM-DD')}`, {
        headers: { Authorization: `Bearer ${userToken}` }
      })
      .then(res => setReservedSlots(res.data || []))
      .catch(err => {
        console.warn("⚠️ Fehler beim Laden der Reservierungen:", err.message);
        setReservedSlots([]);
      });
  }, [selectedDate, workshopId, userToken]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Box p={3} sx={{ bgcolor: '#f9fbfd', borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} sx={{ color: '#0d47a1', display: 'flex', alignItems: 'center' }}>
          <EventAvailableIcon sx={{ mr: 1 }} /> Termin vereinbaren
        </Typography>

        <Typography variant="body2" mb={3}>
          Wählen Sie Service, Datum und Uhrzeit für Ihre Buchung.
        </Typography>

        <TextField
          select
          fullWidth
          label="Service auswählen"
          value={selectedService}
          onChange={e => setSelectedService(e.target.value)}
          sx={{ mb: 2 }}
        >
          {workshop.services.map((s, idx) => (
            <MenuItem key={idx} value={s.title}>
              <EngineeringIcon sx={{ fontSize: 18, mr: 1 }} /> {s.title}
            </MenuItem>
          ))}
        </TextField>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Datum"
            value={selectedDate}
            onChange={(newDate) => {
              setSelectedDate(newDate);
              setSelectedTime('');
            }}
            disablePast
            shouldDisableDate={shouldDisableDate}
            slotProps={{ textField: { fullWidth: true, sx: { mb: 2 } } }}
          />
        </LocalizationProvider>

        {selectedDate && (
          <>
            <Typography fontWeight="bold" mb={1} sx={{ display: 'flex', alignItems: 'center' }}>
              <AccessTimeIcon sx={{ mr: 1 }} /> Verfügbare Uhrzeiten
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
              {getAvailableSlotsForDate().length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Keine Uhrzeiten verfügbar
                </Typography>
              ) : (
                getAvailableSlotsForDate().map((time) => {
                  const isReserved = reservedSlots.includes(`${dayjs(selectedDate).format('YYYY-MM-DD')}T${time}`);
                  const isSelected = selectedTime === time;

                  return (
                    <Button
                      key={time}
                      variant={isSelected ? 'contained' : 'outlined'}
                      onClick={() => setSelectedTime(time)}
                      disabled={isReserved}
                      sx={{
                        minWidth: 90,
                        textDecoration: isReserved ? 'line-through' : 'none',
                        backgroundColor: isReserved
                          ? '#eee'
                          : isSelected
                          ? '#1976d2'
                          : 'white',
                        color: isReserved
                          ? '#999'
                          : isSelected
                          ? 'white'
                          : 'black',
                        border: isReserved ? '1px dashed #aaa' : '1px solid #ccc',
                        '&:hover': {
                          backgroundColor: isReserved ? '#eee' : '#e3f2fd',
                        },
                      }}
                    >
                      {time}
                    </Button>
                  );
                })
              )}
            </Box>
          </>
        )}

        <Button
          onClick={handleBooking}
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#115293' },
            borderRadius: 3,
          }}
          disabled={!selectedService || !selectedDate || !selectedTime || loading}
        >
          {loading ? <CircularProgress size={22} color="inherit" /> : 'Jetzt buchen'}
        </Button>
      </Box>
    </Dialog>
  );
};

export default BookingDialog;
