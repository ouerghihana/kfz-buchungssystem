// src/pages/WorkshopForm.jsx
import React, { useState } from 'react';
import {
  Typography, TextField, Button, Grid, IconButton, Snackbar, Alert,
  Box, Paper, InputLabel, MenuItem, Select, FormControl,
  Checkbox, FormControlLabel, Divider, Container
} from '@mui/material';
import {
  Delete, Build, AccessTime, Image, AddBusiness
} from '@mui/icons-material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const predefinedServices = ['Ölwechsel', 'Reifenwechsel', 'Bremsenprüfung', 'Fahrzeugdiagnose', 'Inspektion', 'Batteriewechsel', 'Klimaservice'];
const daysOfWeek = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const WorkshopForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', phone: '', description: '', images: [] });
  const [services, setServices] = useState([{ title: '', price: '', duration: '' }]);
  const [availability, setAvailability] = useState(daysOfWeek.map(day => ({ day, active: false, start: '', end: '' })));
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const token = localStorage.getItem('token');

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleFormChange = e => {
    const { name, value, files } = e.target;
    if (name === 'images') {
      setForm(prev => ({ ...prev, images: [...prev.images, ...Array.from(files)] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = index => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleServiceChange = (i, field, value) => {
    const updated = [...services];
    updated[i][field] = value;
    setServices(updated);
  };

  const handleAvailabilityToggle = (i, field, value) => {
    const updated = [...availability];
    updated[i][field] = value;
    setAvailability(updated);
  };

  const applyDefaultHours = () => {
    const start = '08:00';
    const end = '17:00';
    setAvailability(prev =>
      prev.map(a => a.active ? { ...a, start, end } : a)
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const hasInvalidServices = services.some(s => !s.title || isNaN(Number(s.price)) || isNaN(Number(s.duration)));
    if (hasInvalidServices) return showSnackbar('Bitte gültige Services eingeben.', 'error');

    const filteredAvailability = availability.filter(a => a.active && a.start && a.end);
    const hasInvalidTimes = filteredAvailability.some(a =>
      dayjs(`2023-01-01T${a.end}`).isBefore(dayjs(`2023-01-01T${a.start}`))
    );
    if (hasInvalidTimes) return showSnackbar('Endzeit muss nach Startzeit liegen.', 'error');

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'images') {
        value.forEach(file => data.append('images', file));
      } else {
        data.append(key, value);
      }
    });
    data.append('services', JSON.stringify(services));
    data.append('weeklyAvailability', JSON.stringify(filteredAvailability));

    try {
      await axios.post('http://localhost:5000/api/workshops/create', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      localStorage.setItem('workshopCreated', 'true');
      navigate('/Danke ');
    } catch (err) {
      console.error(err);
      showSnackbar(err.response?.data?.message || 'Erstellung fehlgeschlagen', 'error');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: '#f8fafc' }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#1976d2', mb: 3 }}>
          <AddBusiness /> Neue Werkstatt hinzufügen
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
            {/* Partie gauche */}
            <Box flex={1} display="flex" flexDirection="column" gap={3}>
              <TextField fullWidth name="name" label="Name **" value={form.name} onChange={handleFormChange} required />
              <TextField fullWidth name="address" label="Adresse **" value={form.address} onChange={handleFormChange} required />
              <TextField fullWidth name="phone" label="Telefon **" value={form.phone} onChange={handleFormChange} required />
              <TextField fullWidth name="description" label="Beschreibung" value={form.description} onChange={handleFormChange} multiline rows={4} />

              <Box>
                <Typography fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Image /> Bilder hochladen (mehrere erlaubt)
                </Typography>
                <Button variant="outlined" component="label" sx={{ borderStyle: 'dashed', borderRadius: 2 }}>
                  Dateien auswählen
                  <input hidden type="file" name="images" multiple accept="image/*" onChange={handleFormChange} />
                </Button>
                <Box display="flex" flexWrap="wrap" mt={2} gap={2}>
                  {form.images.map((img, index) => (
                    <Box key={index} position="relative">
                      <img src={URL.createObjectURL(img)} alt={`preview-${index}`} style={{ width: 100, height: 100, borderRadius: 12, objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
                      <IconButton size="small" onClick={() => handleRemoveImage(index)} sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1 }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Build color="primary" /> Services
                </Typography>
                <hr></hr>
                {services.map((s, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <FormControl sx={{ minWidth: 160, flexGrow: 1 }}>
                      <InputLabel>Service</InputLabel>
                      <Select value={s.title} onChange={e => handleServiceChange(i, 'title', e.target.value)} label="Service">
                        {predefinedServices.map(service => (
                          <MenuItem key={service} value={service}>{service}</MenuItem>
                        ))}
                        <MenuItem value="custom">Anderer Service...</MenuItem>
                      </Select>
                    </FormControl>
                    <TextField label="Preis (€)" type="number" value={s.price} onChange={e => handleServiceChange(i, 'price', e.target.value)} sx={{ width: 120 }} />
                    <TextField label="Dauer (min)" type="number" value={s.duration} onChange={e => handleServiceChange(i, 'duration', e.target.value)} sx={{ width: 120 }} />
                    <IconButton color="error" onClick={() => setServices(services.filter((_, index) => index !== i))}><Delete /></IconButton>
                  </Box>
                ))}
                <Button variant="outlined" onClick={() => setServices([...services, { title: '', price: '', duration: '' }])} startIcon={<AddBusiness />}>Service hinzufügen</Button>
              </Box>
            </Box>

            {/* Divider */}
            <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, mx: 2, bgcolor: '#ccc' }} />

            {/* Part 2 */}
            <Box flex={1}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccessTime color="secondary" /> Verfügbarkeit
              </Typography>
              <hr></hr>
              <Button variant="outlined" size="small" sx={{ mb: 2 }} onClick={applyDefaultHours}>
                Standardzeiten (08:00–17:00) auf aktive Tage anwenden
              </Button>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                  {availability.map((a, i) => (
                    <Grid item xs={12} sm={6} key={a.day}>
                      <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, bgcolor: '#fff' }}>
                        <FormControlLabel control={<Checkbox checked={a.active} onChange={e => handleAvailabilityToggle(i, 'active', e.target.checked)} />} label={<Typography fontSize={14} fontWeight={500}>{a.day}</Typography>} />
                        <Box display="flex" gap={1} mt={1}>
                          <TimePicker label="Start" ampm={false} disabled={!a.active} value={a.start ? dayjs(`2023-01-01T${a.start}`) : null} onChange={val => handleAvailabilityToggle(i, 'start', val ? val.format('HH:mm') : '')} slotProps={{ textField: { sx: { width: 110 } } }} />
                          <TimePicker label="Ende" ampm={false} disabled={!a.active} value={a.end ? dayjs(`2023-01-01T${a.end}`) : null} onChange={val => handleAvailabilityToggle(i, 'end', val ? val.format('HH:mm') : '')} slotProps={{ textField: { sx: { width: 110 } } }} />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </LocalizationProvider>
            </Box>
          </Box>

          <Box textAlign="center" sx={{ mt: 6 }}>
            <Button type="submit" variant="contained" startIcon={<AddBusiness />} sx={{ px: 6, py: 1.5, fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#003566', '&:hover': { backgroundColor: '#001d3d' }, color: 'white', borderRadius: 3, boxShadow: 3 }}>
              Werkstatt speichern
            </Button>
          </Box>
        </form>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert severity={snackbar.severity} onClose={handleCloseSnackbar}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default WorkshopForm;
