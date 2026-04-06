import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Modal,
  Paper,
  IconButton,
  Pagination,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import Banner from '../components/Banner';
import WhyUsSection from '../components/WhyUsSection';
import GarageCard from './GarageCard';
import BookingForm from '../components/BookingForm';
import axios from 'axios';

const HomePage = () => {
  const [workshops, setWorkshops] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [sortBy, setSortBy] = useState('');
  const [cities, setCities] = useState([]);
  const [mapAddress, setMapAddress] = useState('');
  const [openMap, setOpenMap] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Werkstätten beim Laden abrufen
  useEffect(() => {
    axios
      .get('http://localhost:5000/api/workshops/public')
      .then(res => {
        setWorkshops(res.data);
        setFiltered(res.data);
        const uniqueCities = [...new Set(res.data.map(w => w.address?.split(',')[1]?.trim()))];
        setCities(uniqueCities.filter(Boolean));
      })
      .catch(err => console.error('Fehler beim Laden der Werkstätten:', err));
  }, []);

  // Filterlogik anwenden
  useEffect(() => {
    let result = [...workshops];
    const lower = search.toLowerCase();

    if (search) {
      result = result.filter(
        w =>
          w.name.toLowerCase().includes(lower) ||
          w.address.toLowerCase().includes(lower) ||
          w.services?.some(s => s.title.toLowerCase().includes(lower))
      );
    }

    if (cityFilter) result = result.filter(w => w.address.includes(cityFilter));

    if (availableToday) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      result = result.filter(w => w.availability?.some(a => a.day === today));
    }

    if (sortBy === 'preis') {
      result.sort((a, b) => {
        const aMin = Math.min(...a.services.map(s => s.price));
        const bMin = Math.min(...b.services.map(s => s.price));
        return aMin - bMin;
      });
    } else if (sortBy === 'bewertung') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [search, cityFilter, availableToday, sortBy, workshops]);

  const paginatedWorkshops = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setSearch('');
    setCityFilter('');
    setAvailableToday(false);
    setSortBy('');
    setFiltered(workshops);
    setCurrentPage(1);
  };

  const handleMapOpen = address => {
    setMapAddress(address);
    setOpenMap(true);
  };

  return (
    <>
    <Banner />
    <Box sx={{ py: 2, px: { xs: 2, sm: 4 }, bgcolor: '#ffffff', minHeight: '100vh' }}>
    

      {/* 🔍 Suchleiste und Filter */}
      <Paper
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
          p: 2,
          borderRadius: 3,
          bgcolor: '#f9f9f9',
          boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        }}
      >
        <TextField
          fullWidth
          size="small"
          sx={{ flex: 2 }}
          placeholder="🔍 Suche nach Name, Ort oder Service..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <TextField
          select
          size="small"
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          label="Stadt"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Alle</MenuItem>
          {cities.map((city, i) => (
            <MenuItem key={i} value={city}>
              {city}
            </MenuItem>
          ))}
        </TextField>
        <FormControlLabel
          control={
            <Checkbox
              checked={availableToday}
              onChange={() => setAvailableToday(!availableToday)}
            />
          }
          label="Verfügbar heute"
        />
        <TextField
          select
          size="small"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          label="Sortieren nach"
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Keine Sortierung</MenuItem>
          <MenuItem value="preis">Preis (aufsteigend)</MenuItem>
          <MenuItem value="bewertung">Bewertung (absteigend)</MenuItem>
        </TextField>

        <Button
          onClick={handleReset}
          startIcon={<RestartAltIcon />}
          variant="outlined"
          color="primary"
        >
          Filter zurücksetzen
        </Button>
      </Paper>

      {/* 🧩 Werkstatt-Karten */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 3,
          pb: 4,
        }}
      >
        {paginatedWorkshops.map(workshop => (
          <Box key={workshop._id} sx={{ flex: '0 1 330px' }}>
            <GarageCard garage={workshop} onAddressClick={handleMapOpen} />
          </Box>
        ))}
      </Box>

      {/* 📄 Paginierung */}
      {filtered.length > itemsPerPage && (
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filtered.length / itemsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            shape="rounded"
          />
        </Box>
      )}

      {/* 🗺️ Modal: Google Map anzeigen */}
      <Modal open={openMap} onClose={() => setOpenMap(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            height: 400,
            bgcolor: 'white',
            borderRadius: 3,
            p: 2,
          }}
        >
          <iframe
            title="Map"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&z=15&output=embed`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </Box>
      </Modal>

      {/* 📝 Modal: Buchungsformular */}
      <Modal open={openBooking} onClose={() => setOpenBooking(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 420,
            bgcolor: '#fff',
            borderRadius: 4,
            p: 3,
            boxShadow: 24,
          }}
        >
          <BookingForm workshops={filtered} onClose={() => setOpenBooking(false)} />
        </Box>
      </Modal>

      {/* 🌟 Vorteile-Abschnitt */}
      <WhyUsSection />

      {/* 🗺️ Mini-Google-Karte */}
      <Box sx={{ my: 6 }}>
        <Typography variant="h5" fontWeight="bold" mb={2} textAlign="center">
          Finde Werkstätten in deiner Nähe
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 350,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: 2,
          }}
        >
          <iframe
            title="Werkstätten Karte"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2522.1779833575213!2d6.776313176758497!3d51.23527547175124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b8c97f135d5b05%3A0x63bdf705fcf11470!2sD%C3%BCsseldorf!5e0!3m2!1sde!2sde!4v1618352710231!5m2!1sde!2sde"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          />
        </Box>
      </Box>

      {/* 📩 Newsletter-Anmeldung */}
      <Box
        sx={{
          my: 8,
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          📩 Newsletter abonnieren
        </Typography>
        <Typography variant="body1" mb={3}>
          Erhalten Sie die besten Angebote und Tipps direkt in Ihr Postfach.
        </Typography>
        <Box
          component="form"
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
          onSubmit={e => e.preventDefault()}
        >
          <TextField
            type="email"
            placeholder="Ihre E-Mail-Adresse"
            required
            sx={{ minWidth: 300 }}
          />
          <Button type="submit" variant="contained" color="primary">
            Abonnieren
          </Button>
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default HomePage;
