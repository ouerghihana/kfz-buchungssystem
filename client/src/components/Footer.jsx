import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => (
  <Box
    component="footer"
    sx={{
      py: 2,
      textAlign: 'center',
      borderTop: '1px solid #ccc',

      backgroundColor: '#f8f8f8',
    }}
  >
    <Container maxWidth="md">
      <Typography variant="body2">
        <Link href="#">Impressum</Link> | <Link href="#">Terms</Link> |{' '}
        <Link href="#">Contact</Link>
      </Typography>
    </Container>
  </Box>
);

export default Footer;
