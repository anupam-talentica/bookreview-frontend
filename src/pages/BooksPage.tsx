// Books page component for browsing and filtering books

import React, { useState } from 'react';
import { useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Pagination,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Search, Visibility } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import FavoriteButton from '../components/FavoriteButton';

import type { Book } from '../types';

const BooksPage: React.FC = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  
  const pageTitle = location.pathname === '/top-rated' 
    ? 'Top Rated Books' 
    : location.pathname === '/popular' 
    ? 'Most Popular Books' 
    : 'Browse Books';

  // Determine which API to call based on the route
  const getBooks = () => {
    if (location.pathname === '/top-rated') {
      return apiService.getTopRatedBooks(20);
    } else if (location.pathname === '/popular') {
      return apiService.getPopularBooks(20);
    } else if (searchQuery) {
      return apiService.searchBooks(searchQuery, page, 20);
    } else {
      return apiService.getBooks(page, 20);
    }
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<any>({
    queryKey: ['books', location.pathname, page, searchQuery],
    queryFn: getBooks,
  });

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(0);
    setSearchParams({ q: searchQuery });
    refetch();
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1);
  };

  // Extract books from API response
  const books: Book[] = Array.isArray(data) ? data : (data?.content || data?.data || []);

  if (error) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load books. Please try again later.
          </Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {pageTitle}
          </Typography>
          
          {/* Search Bar */}
          <Box component="form" onSubmit={handleSearch} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              placeholder="Search books, authors, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Button type="submit" variant="contained">
                      Search
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Books Grid */}
        {!isLoading && (
          <>
            {books.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No books found
                </Typography>
                <Typography color="text.secondary">
                  {searchQuery ? `No results for "${searchQuery}"` : `No books available in this category`}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {books.map((book) => (
                <Box key={book.id} sx={{ flex: '1 1 300px', minWidth: '280px', maxWidth: '350px' }}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        transition: 'transform 0.3s ease-in-out',
                      },
                    }}
                  >
                    <Box sx={{ 
                      height: 200, 
                      flexShrink: 0,
                      overflow: 'hidden',
                      backgroundColor: '#f5f5f5'
                    }}>
                      {book.coverImageUrl ? (
                        <img
                          src={book.coverImageUrl}
                          alt={book.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Box sx={{
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'text.secondary'
                        }}>
                          <Typography variant="caption">No Image</Typography>
                        </Box>
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, minHeight: 0 }}>
                      <Typography variant="h6" component="h3" gutterBottom noWrap>
                        {book.title}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        by {book.author}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating value={book.averageRating} readOnly precision={0.1} size="small" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({book.reviewCount})
                        </Typography>
                      </Box>

                      {book.genres && (
                        <Box sx={{ mt: 1 }}>
                          {book.genres.split(',').slice(0, 2).map((genre, index) => (
                            <Chip
                              key={index}
                              label={genre.trim()}
                              size="small"
                              sx={{ mr: 0.5, mb: 0.5 }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View book details">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/books/${book.id}`)}
                            color="primary"
                            sx={{ 
                              '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isAuthenticated && (
                          <FavoriteButton bookId={book.id} size="small" variant="icon" />
                        )}
                      </Box>
                    </CardActions>
                  </Card>
                  </Box>
                ))}
              </Box>
            )}

            {/* Pagination */}
            {books.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil((data?.totalElements || books.length) / 20)}
                  page={page + 1}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Container>
    </Layout>
  );
};

export default BooksPage;
