
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Tooltip,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import MyWorkshops from '../components/MyWorkshops';
import WorkshopBookings from '../components/WorkshopBookings';

const DashboardServiceProvider = () => {
  const [refresh, setRefresh] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: 6, position: 'relative' }}>
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#222' }}>
          Willkommen zurück 👋
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Verwalten Sie Ihre Werkstätten & Buchungen ganz einfach an einem Ort.
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 4, mb: 4, background: '#f9f9f9' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📅 Buchungen verwalten
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Behalten Sie den Überblick über alle Kundenbuchungen.
        </Typography>
        <Divider sx={{ my: 2 }} />
        <WorkshopBookings />
      </Paper>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 4, background: '#f9f9f9' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              🛠️ Ihre Werkstätten
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hier finden Sie eine Übersicht Ihrer registrierten Werkstätten.
            </Typography>
          </Box>
          <Tooltip title="Neue Werkstatt hinzufügen">
            <Button
              component={Link}
              to="/werkstatt-hinzufuegen"
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#0c9cd3', '&:hover': { backgroundColor: '#097bbf' } }}
            >
              Neue Werkstatt
            </Button>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />
        <MyWorkshops refresh={refresh} />
      </Paper>
    </Container>
  );
};

export default DashboardServiceProvider;
