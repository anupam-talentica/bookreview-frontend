// Search page - Coming Soon

import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Typography, Alert } from '@mui/material';
import Layout from '../components/Layout/Layout';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  return (
    <Layout>
      <Container maxWidth="lg">
        <Alert severity="info" sx={{ mt: 2 }}>
          Search Page - Coming Soon!
        </Alert>
        <Typography variant="h4" sx={{ mt: 2 }}>
          Search Results {query && `for "${query}"`}
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          This page will show search results with advanced filtering options.
        </Typography>
      </Container>
    </Layout>
  );
};

export default SearchPage;
