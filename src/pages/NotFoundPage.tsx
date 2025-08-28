// 404 Not Found page

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';
import { Home, ArrowBack, MenuBook } from '@mui/icons-material';
import Layout from '../components/Layout/Layout';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
          }}
        >
          <MenuBook sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h1" component="h1" sx={{ fontSize: '6rem', fontWeight: 'bold', mb: 1 }}>
            404
          </Typography>
          
          <Typography variant="h4" component="h2" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 400 }}>
            Sorry, the page you are looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<Home />}
              onClick={() => navigate('/')}
              size="large"
            >
              Go Home
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={() => navigate(-1)}
              size="large"
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default NotFoundPage;
