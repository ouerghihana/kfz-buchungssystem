import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Alert,
  IconButton,
  InputAdornment,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Snackbar,
} from '@mui/material';
import { Visibility, VisibilityOff, Close } from '@mui/icons-material';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginDialog = ({ open, onClose, onSwitchToRegister }) => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async e => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, user } = res.data;

      login(user, token); // ✅ this handles localStorage fully
      setSnackbarMessage(`Welcome back, ${user.name} 👋`);
      setSnackbarOpen(true);
      onClose();

      if (user.role === 'service_provider') {
        navigate('/provider/dashboard');
      } else if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      setFormData({ email: '', password: '' });
      setErrorMessage('');
    }
  }, [open]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
          <CarRepairIcon sx={{ color: '#0c9cd3', mr: 1, verticalAlign: 'middle' }} />
          Sign In
          <IconButton onClick={onClose} sx={{ position: 'absolute', top: 8, right: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                backgroundColor: '#0c9cd3',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#0288d1' },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </form>


          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Don't have an account?{' '}
              <Button
                onClick={onSwitchToRegister}
                sx={{ textTransform: 'none', color: '#0c9cd3', fontWeight: 'bold' }}
              >
                Register now
              </Button>
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        message={snackbarMessage}
      />
    </>
  );
};

export default LoginDialog;
