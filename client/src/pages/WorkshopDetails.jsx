// WorkshopDetails.jsx —

import React, { useEffect, useState, forwardRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Slide,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Rating,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GarageOutlinedIcon from '@mui/icons-material/GarageOutlined';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import RegisterDialog from '../pages/RegisterDialog';
import BookingDialog from '../components/BookingDialog';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

const WorkshopDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workshop, setWorkshop] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSuccess, setSnackbarSuccess] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/workshops/${id}`)
      .then(res => setWorkshop(res.data))
      .catch(console.error);
  }, [id]);

  const handleReviewSubmit = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/workshops/${id}/reviews`,
        {
          rating: reviewRating,
          comment: reviewComment,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );
      setWorkshop(prev => ({
        ...prev,
        reviews: [
          ...prev.reviews,
          { name: user.name, rating: reviewRating, comment: reviewComment },
        ],
      }));
      setReviewRating(0);
      setReviewComment('');
    } catch (err) {
      console.error('Fehler beim Speichern der Bewertung', err);
    }
  };

  if (!workshop) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Lädt...</Typography>;

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: '1200px', mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: '#e3f2fd',
          p: 3,
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <GarageOutlinedIcon sx={{ mr: 1 }} /> {workshop.name}
          </Typography>
          <Box display="flex" alignItems="center" mt={1}>
            <LocationOnIcon sx={{ mr: 1 }} />
            <Typography>{workshop.address}</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" mt={1}>
            {workshop.description}
          </Typography>
        </Box>
        {user?.role === 'customer' && (
          <Button
            onClick={() => setBookingOpen(true)}
            variant="contained"
            startIcon={<EventAvailableIcon />}
            sx={{ mt: { xs: 2, md: 0 }, borderRadius: 3, fontWeight: 'bold' }}
          >
            Jetzt buchen
          </Button>
        )}
      </Box>

      {/* Images */}
      <Box display="grid" gap={1} gridTemplateColumns={{ xs: '1fr', md: '2fr 1fr' }} mb={4} mt={3}>
        {workshop.images?.[0] && (
          <Box
            component="img"
            src={`http://localhost:5000/uploads/${workshop.images[0]}`}
            sx={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 3 }}
          />
        )}
        <Box display="flex" flexDirection="column" gap={1}>
          {workshop.images?.slice(1, 3).map((img, idx) => (
            <Box
              key={idx}
              component="img"
              src={`http://localhost:5000/uploads/${img}`}
              sx={{ width: '100%', height: 145, objectFit: 'cover', borderRadius: 3 }}
            />
          ))}
        </Box>
      </Box>

      {/* Services */}
      <Box mt={4}>
        <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
          🛠 Unsere Services
        </Typography>
        <hr />
        <Box display="flex" flexWrap="wrap" gap={2}>
          {workshop.services.map((s, idx) => (
            <Paper
              key={idx}
              sx={{ p: 2, borderRadius: 2, backgroundColor: '#f4f6f8', minWidth: 240 }}
            >
              <Typography fontWeight="bold" color="text.primary">
                {s.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dauer: {s.duration} Min
              </Typography>
              {user && (
                <Typography variant="body2" color="text.secondary">
                  Preis: {s.price.toFixed(2)} €
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mt: 5, borderRadius: 3 }}>
        <Tabs value={tabIndex} onChange={(e, newVal) => setTabIndex(newVal)} variant="fullWidth">
          <Tab label="Infos" />
          <Tab label="Bewertungen" />
        </Tabs>
        {tabIndex === 0 && (
          <Box p={3}>
            <Typography variant="h6" fontWeight="bold" mb={2}>📍 Standort</Typography>
            <iframe
              title="Map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(workshop.address)}&z=15&output=embed`}
              width="100%"
              height="300"
              style={{ border: 0, borderRadius: 10 }}
              allowFullScreen
              loading="lazy"
            />
          </Box>
        )}
        {tabIndex === 1 && (
          <Box p={3}>
            {workshop.reviews?.map((r, i) => (
              <Paper
                key={i}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: '#f9f9f9',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  borderRadius: 2,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                  }}
                >
                  {r.name?.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography fontWeight="bold">{r.name}</Typography>
                  <Rating value={r.rating} readOnly size="small" sx={{ mt: 0.5 }} />
                  <Typography variant="body2" color="text.secondary">
                    {r.comment}
                  </Typography>
                </Box>
              </Paper>
            ))}
            {user?.role === 'customer' && (
              <Box mt={3}>
                <Typography variant="h6" fontWeight="bold" mb={1}>
                  <RateReviewIcon sx={{ mr: 1 }} /> Bewertung schreiben
                </Typography>
                <Rating value={reviewRating} onChange={(e, newVal) => setReviewRating(newVal)} />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Kommentar"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  sx={{ my: 2 }}
                />
                <Button
                  variant="contained"
                  onClick={handleReviewSubmit}
                  disabled={!reviewRating || !reviewComment}
                >
                  Senden
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Booking Modal */}
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        workshop={workshop}
        workshopId={id}
        userToken={user?.token}
        onBook={() => {
          localStorage.setItem('bookingSuccess', 'true');
          navigate('/buchung-erfolgreich');
        }}
      />

      {/* Snackbars */}
      <Snackbar open={snackbarOpen} autoHideDuration={4000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity="error" onClose={() => setSnackbarOpen(false)}>
          Fehler bei der Buchung.
        </Alert>
      </Snackbar>
      <Snackbar
        open={snackbarSuccess}
        autoHideDuration={3000}
        onClose={() => setSnackbarSuccess(false)}
      >
        <Alert icon={<CheckCircleIcon />} severity="success">
          Buchung erfolgreich gespeichert!
        </Alert>
      </Snackbar>

      <RegisterDialog open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </Box>
  );
};

export default WorkshopDetails;
