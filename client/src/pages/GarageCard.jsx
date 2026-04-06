import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useNavigate } from 'react-router-dom';

const GarageCard = ({ garage, onAddressClick }) => {
  const navigate = useNavigate(); // Initialize navigate function for page navigation

  const handleCardClick = () => {
    // This will redirect to the details page with the workshop ID when the card is clicked
    navigate(`/workshop/${garage._id}`);
  };

  return (
    <Card
      onClick={handleCardClick} // Make the entire card clickable
      sx={{
        width: '100%',
        maxWidth: 330,
        borderRadius: 4,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.02)',
        },
      }}
    >
      {/* 📸 Image */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="180"
          image={
            garage.images?.length > 0
              ? `http://localhost:5000/uploads/${garage.images[0].replace(/^\/?uploads\//, '')}`
              : '/default-garage.jpg'
          }
          alt={garage.name}
          sx={{ borderRadius: '16px 16px 0 0' }}
        />

        <Tooltip title="Zu Favoriten hinzufügen">
          <IconButton
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'white',
              '&:hover': { bgcolor: '#eee' },
            }}
          >
            <FavoriteBorderIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* 📋 Content */}
      <CardContent sx={{ px: 2, py: 1.5 }}>
        <Typography fontWeight="bold" variant="subtitle1">
          {garage.name}
        </Typography>

        <Box display="flex" alignItems="center" gap={0.5} mb={1}>
          <LocationOnIcon sx={{ fontSize: 16, color: 'gray' }} />
          <Tooltip title="Auf Karte anzeigen" arrow>
            <Typography
              variant="body2"
              color="primary"
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
              onClick={e => {
                e.stopPropagation();
                if (onAddressClick) onAddressClick(garage.address);
              }}
            >
              {garage.address}
            </Typography>
          </Tooltip>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Rating value={garage.averageRating || 0} precision={0.5} readOnly size="small" />
          <Typography fontWeight="medium" color="primary">
            ab {garage.services?.[0]?.price || '—'} €
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default GarageCard;
