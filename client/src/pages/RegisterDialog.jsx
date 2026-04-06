import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import GarageIcon from '@mui/icons-material/CarRepair';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import FacebookIcon from '@mui/icons-material/Facebook';
import axios from 'axios';

const RegisterDialog = ({ open, onClose, onSwitchToLogin }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = () => setShowPassword(prev => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwörter stimmen nicht überein');
    }

    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setSuccess(res.data.message);
      setForm({ name: '', email: '', password: '', confirmPassword: '', role: 'customer' });

      setTimeout(() => {
        setSuccess('');
        onClose();
        if (onSwitchToLogin) onSwitchToLogin();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registrierung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [error, success]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>Registrieren</DialogTitle>

      <DialogContent sx={{ px: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <GarageIcon sx={{ fontSize: 40, color: ' #0c9cd3', mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            KFZ-Buchungssystem
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="E-Mail"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Passwort"
            name="password"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={togglePassword}>
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Passwort wiederholen"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={toggleConfirmPassword}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <FormLabel component="legend">Registrieren als</FormLabel>
            <RadioGroup row name="role" value={form.role} onChange={handleChange}>
              <FormControlLabel value="customer" control={<Radio />} label="Kunde" />
              <FormControlLabel
                value="service_provider"
                control={<Radio />}
                label="Werkstatt-Inhaber:in"
              />
            </RadioGroup>
          </FormControl>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 3,
              py: 1.3,
              fontWeight: 'bold',
              backgroundColor: ' #0c9cd3',
              '&:hover': { backgroundColor: ' #8893ab' },
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Konto erstellen'}
          </Button>
        </Box>

        <Typography variant="body2" mt={3} textAlign="center">
          Bereits ein Konto?{' '}
          <Button
            onClick={onSwitchToLogin}
            sx={{ color: ' #0c9cd3', fontWeight: 'bold', textTransform: 'none' }}
          >
            Jetzt einloggen
          </Button>
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
