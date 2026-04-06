// Banner.jsx
import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; 
import { Box, Typography, Button } from '@mui/material';

const Banner = () => {
  const items = [
    {
      image: '/images/banner.jpg',
      title: 'Schnell und einfach Ihre Werkstatt buchen',
      subtitle: 'Finden Sie geprüfte Werkstätten in Ihrer Nähe',
    },
    {
      image: '/images/banner_4.jpg',
      title: 'Zuverlässige Reparaturen für Ihr Fahrzeug',
      subtitle: 'Professionelle Werkstätten mit Top-Bewertungen',
    },
    {
      image: '/images/banner2.jpeg',
      title: 'Bequem Termine online vereinbaren',
      subtitle: 'Keine Wartezeiten – Einfach buchen',
    },
   
  ];

  return (
    <Carousel
      showThumbs={false}
      showArrows={false}
      showIndicators={false}
      showStatus={false}
      infiniteLoop
      autoPlay
      interval={5000}
      stopOnHover={false}
      swipeable={false}
    >
      {items.map((item, index) => (
        <Box
          key={index}
          sx={{
            height: '350px',
            backgroundImage: `url(${item.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            textShadow: '1px 1px 5px rgba(0,0,0,0.7)',
          }}
        >
          <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
            {item.title}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {item.subtitle}
          </Typography>
         
        </Box>
      ))}
    </Carousel>
  );
};

export default Banner;
