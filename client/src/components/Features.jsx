import { Box, Typography, Grid } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BuildIcon from '@mui/icons-material/Build';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const features = [
  { icon: <CheckCircleIcon sx={{ color: '#1976d2' }} />, label: 'Easy Booking' },
  { icon: <BuildIcon sx={{ color: '#1976d2' }} />, label: 'Trusted Garages' },
  { icon: <AccessTimeIcon sx={{ color: '#1976d2' }} />, label: 'Real-time Availability' },
  { icon: <LocationOnIcon sx={{ color: '#1976d2' }} />, label: 'Nearby Search' },
];

const Features = () => (
  <Box
    sx={{
      py: 6,
      textAlign: 'center',
      transition: 'transform 0.3s ease',
      '&:hover': {
        transform: 'scale(1.1)',
        color: 'white',
      },
    }}
  >
    <Typography variant="h4" gutterBottom>
      Why Choose Us?
    </Typography>
    <Grid container spacing={4} justifyContent="center">
      {features.map((feature, index) => (
        <Grid item xs={6} sm={3} key={index}>
          <Box display="flex" flexDirection="column" alignItems="center">
            {feature.icon}
            <Typography variant="subtitle1" mt={1}>
              {feature.label}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Features;
