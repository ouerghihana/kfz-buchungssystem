import React from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const helpTopics = [
  {
    title: 'Wie kann ich eine Werkstatt buchen?',
    content:
      'Um eine Werkstatt zu buchen, melden Sie sich bitte an, suchen Sie eine Werkstatt aus und klicken Sie auf "Jetzt buchen". Dann wählen Sie Datum und Uhrzeit aus und bestätigen Sie Ihre Buchung.',
  },
  {
    title: 'Wie kann ich meine Buchungen verwalten?',
    content:
      'Gehen Sie zu "Meine Buchungen", um alle Ihre Termine einzusehen, zu bearbeiten oder zu stornieren. Sie finden diesen Bereich in der Navigation oben.',
  },
  {
    title: 'Wie funktioniert die Bewertung?',
    content:
      'Nach Ihrem Termin können Sie eine Bewertung abgeben. Klicken Sie dazu auf „Bewertung schreiben“ auf der Werkstattseite, die Sie besucht haben.',
  },
  {
    title: 'Ich habe ein Problem mit einer Buchung',
    content:
      'Wenn Sie ein Problem mit einer Buchung haben, kontaktieren Sie bitte unser Support-Team über das Kontaktformular unten auf dieser Seite.',
  },
];

const HelpCenter = () => {
  return (
    <Box sx={{ backgroundColor: '#f4f6f8', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 4,
            backgroundColor: 'white',
            borderTop: '6px solid #1976d2',
          }}
        >
          <Box display="flex" alignItems="center" mb={3}>
            <HelpOutlineIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Hilfe-Center
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Antworten auf häufig gestellte Fragen rund um Buchung, Bewertung und Verwaltung.
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          {helpTopics.map((topic, index) => (
            <Accordion key={index} disableGutters>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#1976d2' }} />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
              >
                <Typography fontWeight="bold">{topic.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" color="text.secondary">
                  {topic.content}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}

          <Divider sx={{ my: 4 }} />

          <Box mt={4}>
            <Typography variant="h6" gutterBottom color="#1976d2">
              Immer noch Fragen?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Schreiben Sie uns eine E-Mail an <strong>support@kfz-buchung.de</strong> oder nutzen
              Sie unser{' '}
              <a href="#" style={{ color: '#1976d2', textDecoration: 'underline' }}>
                Kontaktformular
              </a>
              .
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HelpCenter;
