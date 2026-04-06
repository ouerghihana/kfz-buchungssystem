// WhyUsSection.jsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const advantages = [
  { icon: '⏱️', text: 'Schnell & flexibel buchbar' },
  { icon: '🛠️', text: 'Geprüfte Werkstätten' },
  { icon: '📲', text: 'Einfach online verwalten' },
  { icon: '💬', text: 'Kundenbewertungen einsehbar' },
];

const WhyUsSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[100],
        py: 6,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h4" fontWeight="bold" mb={5} color="primary">
        Warum KFZ-Buchung?
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: { xs: 3, md: 6 },
        }}
      >
        {advantages.map((item, index) => (
          <Box
            key={index}
            sx={{
              width: 220,
              p: 3,
              borderRadius: 3,
              bgcolor: '#fff',
              boxShadow: 3,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
              },
            }}
          >
            <Typography fontSize={48}>{item.icon}</Typography>
            <Typography
              variant="h6"
              fontWeight="medium"
              mt={1}
              sx={{ minHeight: 60 }}
            >
              {item.text}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default WhyUsSection;
