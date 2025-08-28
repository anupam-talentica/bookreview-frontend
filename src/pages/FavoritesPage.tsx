import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Favorite,
  GridView,
  ViewList,
  Share,
  Visibility,
} from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import type { Book } from '../types';

interface FilterState {
  search: string;
  genre: string;
  sortBy: 'title' | 'author' | 'rating' | 'year' | 'dateAdded';
  sortOrder: 'asc' | 'desc';
}

const FavoritesPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(0);
  const [pageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    genre: '',
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  });


  // Fetch user's favorite books
  const {
    data: favoritesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userFavorites', page, pageSize],
    queryFn: () => apiService.getUserFavorites(page, pageSize),
    enabled: isAuthenticated,
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: (bookId: number) => apiService.removeFromFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please log in to view your favorite books.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login')}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Container>
      </Layout>
    );
  }

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filtering
  };

  // Handle pagination
  const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage - 1); // MUI Pagination is 1-based, but our API is 0-based
  };

  // Filter and sort books locally (since we have limited pagination from backend)
  const filteredBooks = React.useMemo(() => {
    if (!favoritesData?.content) return [];

    let filtered = [...favoritesData.content];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        book =>
          book.title.toLowerCase().includes(searchLower) ||
          book.author.toLowerCase().includes(searchLower)
      );
    }

    // Genre filter
    if (filters.genre) {
      filtered = filtered.filter(book =>
        book.genres?.toLowerCase().includes(filters.genre.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'author':
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case 'rating':
          aValue = a.averageRating;
          bValue = b.averageRating;
          break;
        case 'year':
          aValue = a.publishedYear || 0;
          bValue = b.publishedYear || 0;
          break;
        case 'dateAdded':
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
          break;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [favoritesData?.content, filters]);

  // Get unique genres for filter dropdown
  const availableGenres = React.useMemo(() => {
    if (!favoritesData?.content) return [];
    
    const genreSet = new Set<string>();
    favoritesData.content.forEach(book => {
      if (book.genres) {
        book.genres.split(',').forEach(genre => {
          genreSet.add(genre.trim());
        });
      }
    });
    
    return Array.from(genreSet).sort();
  }, [favoritesData?.content]);

  // Handle remove from favorites
  const handleRemoveFromFavorites = async (bookId: number, bookTitle: string) => {
    if (window.confirm(`Remove "${bookTitle}" from your favorites?`)) {
      removeFromFavoritesMutation.mutate(bookId);
    }
  };

  // Render book card
  const renderBookCard = (book: Book) => {
    if (viewMode === 'list') {
      return (
        <Card 
          key={book.id} 
          sx={{ 
            display: 'flex', 
            mb: 2,
            overflow: 'hidden',
            '&:hover': { boxShadow: 4 },
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/books/${book.id}`)}
        >
          <Box sx={{ 
            width: 160, 
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
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, minHeight: 0 }}>
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                by {book.author}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Rating value={book.averageRating} readOnly precision={0.1} size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({book.reviewCount} reviews)
                </Typography>
              </Box>
              {book.genres && (
                <Box sx={{ mt: 1 }}>
                  {book.genres.split(',').slice(0, 3).map((genre, index) => (
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
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="View book details">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/books/${book.id}`);
                    }}
                    sx={{ 
                      '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                    }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Share book">
                  <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                    <Share fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove from favorites">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromFavorites(book.id, book.title);
                    }}
                    disabled={removeFromFavoritesMutation.isPending}
                  >
                    <Favorite fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </CardActions>
          </Box>
        </Card>
      );
    }

    // Grid view
    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={book.id}>
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            '&:hover': { boxShadow: 4 },
            cursor: 'pointer'
          }}
          onClick={() => navigate(`/books/${book.id}`)}
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
          <CardContent sx={{ flexGrow: 1, p: 2, minHeight: 0 }}>
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
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/books/${book.id}`);
                  }}
                  sx={{ 
                    '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Remove from favorites">
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromFavorites(book.id, book.title);
                  }}
                  disabled={removeFromFavoritesMutation.isPending}
                >
                  <Favorite fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            My Favorite Books
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.name}, you have {favoritesData?.totalElements || 0} favorite books
          </Typography>
        </Box>

        {/* Controls */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search */}
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search favorites..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            {/* Genre Filter */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Genre</InputLabel>
                <Select
                  value={filters.genre}
                  label="Genre"
                  onChange={(e) => handleFilterChange('genre', e.target.value)}
                >
                  <MenuItem value="">All Genres</MenuItem>
                  {availableGenres.map((genre) => (
                    <MenuItem key={genre} value={genre}>
                      {genre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  label="Sort By"
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <MenuItem value="dateAdded">Date Added</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="author">Author</MenuItem>
                  <MenuItem value="rating">Rating</MenuItem>
                  <MenuItem value="year">Year</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort Order */}
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Order</InputLabel>
                <Select
                  value={filters.sortOrder}
                  label="Order"
                  onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                >
                  <MenuItem value="desc">Descending</MenuItem>
                  <MenuItem value="asc">Ascending</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* View Mode */}
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <IconButton
                  color={viewMode === 'grid' ? 'primary' : 'default'}
                  onClick={() => setViewMode('grid')}
                >
                  <GridView />
                </IconButton>
                <IconButton
                  color={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  <ViewList />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Content */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load your favorite books. Please try again.
          </Alert>
        ) : filteredBooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" gutterBottom>
              {filters.search || filters.genre ? 'No books match your filters' : 'No favorite books yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {filters.search || filters.genre
                ? 'Try adjusting your search terms or filters'
                : 'Start exploring and add books to your favorites!'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/books')}
              sx={{ mt: 2 }}
            >
              Discover Books
            </Button>
          </Box>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <Grid container spacing={3}>
                {filteredBooks.map(renderBookCard)}
              </Grid>
            ) : (
              <Box>
                {filteredBooks.map(renderBookCard)}
              </Box>
            )}

            {/* Pagination */}
            {favoritesData && favoritesData.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={favoritesData.totalPages}
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

export default FavoritesPage;