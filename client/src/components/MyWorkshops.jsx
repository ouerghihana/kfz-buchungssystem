import React, { useEffect, useState } from 'react';
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import BusinessIcon from '@mui/icons-material/Business';
import axios from 'axios';

const MyWorkshops = ({ refresh }) => {
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', phone: '', description: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const token = localStorage.getItem('token');

  const fetchWorkshops = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/workshops/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkshops(res.data);
    } catch (err) {
      console.error('Fehler beim Laden der Werkstätten:', err);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [refresh]);

  const handleEditClick = workshop => {
    setSelectedWorkshop(workshop);
    setForm({ ...workshop });
    setOpenEdit(true);
  };

  const handleDeleteClick = workshop => {
    setSelectedWorkshop(workshop);
    setOpenDelete(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/workshops/${selectedWorkshop._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWorkshops(prev => prev.filter(w => w._id !== selectedWorkshop._id));
      setSnackbar({ open: true, message: 'Werkstatt gelöscht', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Fehler beim Löschen', severity: 'error' });
    } finally {
      setOpenDelete(false);
    }
  };

  const handleEditSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/workshops/${selectedWorkshop._id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log('Antwort vom Server:', res.data);

      const updatedWorkshop = res.data.workshop;

      // Überprüfen, ob _id existiert
      if (!updatedWorkshop || !updatedWorkshop._id) {
        throw new Error('Kein gültiges Workshop-Objekt vom Server erhalten');
      }

      //  Sicheres Update der Liste, ohne Referenzprobleme
      setWorkshops(prev =>
        prev.map(w => (w._id === selectedWorkshop._id ? { ...updatedWorkshop } : w))
      );

      setSnackbar({
        open: true,
        message: 'Werkstatt erfolgreich aktualisiert',
        severity: 'success',
      });
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setSnackbar({
        open: true,
        message: 'Fehler beim Aktualisieren der Werkstatt',
        severity: 'error',
      });
    } finally {
      setOpenEdit(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      renderCell: params => (
        <Tooltip title="Details anzeigen">
          <Button
            color="primary"
            startIcon={<BusinessIcon />}
            onClick={() => {
              setSelectedWorkshop(params.row);
              setOpenDetails(true);
            }}
          >
            {params.value}
          </Button>
        </Tooltip>
      ),
    },
    { field: 'address', headerName: 'Adresse', flex: 1 },
    { field: 'phone', headerName: 'Telefon', flex: 1 },
    { field: 'description', headerName: 'Beschreibung', flex: 1.2 },
    {
      field: 'actions',
      headerName: 'Aktionen',
      renderCell: params => (
        <>
          <IconButton onClick={() => handleEditClick(params.row)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(params.row)} color="error">
            <DeleteIcon />
          </IconButton>
        </>
      ),
      sortable: false,
      flex: 0.7,
    },
  ];

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" mb={2}>
        📌 Liste Ihrer Werkstätten
      </Typography>

      <DataGrid
        rows={workshops}
        columns={columns}
        getRowId={row => row._id}
        pagination
        pageSizeOptions={[5, 10]}
        autoHeight
        sx={{
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: '#fff',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f4f6f8',
            fontWeight: 'bold',
          },
        }}
      />

      {/* Dialogs */}

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth>
        <DialogTitle>Werkstatt bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            name="name"
            label="Name"
            fullWidth
            margin="dense"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            name="address"
            label="Adresse"
            fullWidth
            margin="dense"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />
          <TextField
            name="phone"
            label="Telefonnummer"
            fullWidth
            margin="dense"
            value={form.phone}
            onChange={e => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            name="description"
            label="Beschreibung"
            fullWidth
            multiline
            rows={3}
            margin="dense"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Abbrechen</Button>
          <Button onClick={handleEditSave} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Bestätigung</DialogTitle>
        <DialogContent>
          <Typography>Möchten Sie diese Werkstatt wirklich löschen?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Abbrechen</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Werkstatt Details
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="h6" gutterBottom>
            {selectedWorkshop?.name}
          </Typography>
          <Typography>
            <strong>Adresse:</strong> {selectedWorkshop?.address}
          </Typography>
          <Typography>
            <strong>Telefon:</strong> {selectedWorkshop?.phone}
          </Typography>
          <Typography sx={{ mt: 2 }}>
            <strong>Beschreibung:</strong> {selectedWorkshop?.description}
          </Typography>

          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" mt={2}>
                <BuildIcon fontSize="small" sx={{ mr: 1 }} />
                Services
              </Typography>
              <ul>
                {selectedWorkshop?.services?.map((s, i) => (
                  <li key={i}>
                    {s.title} – {s.duration} min – {s.price}€
                  </li>
                ))}
              </ul>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" mt={2}>
                <EventAvailableIcon fontSize="small" sx={{ mr: 1 }} />
                Verfügbarkeiten
              </Typography>
              <ul>
                {selectedWorkshop?.availability?.map((a, i) => (
                  <li key={i}>
                    {a.day} von {a.start} bis {a.end}
                  </li>
                ))}
              </ul>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>Schließen</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyWorkshops;
