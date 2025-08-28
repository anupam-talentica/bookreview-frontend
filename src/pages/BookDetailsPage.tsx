// Comprehensive Book Details page with reviews and favorites

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Rating,
  Divider,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Grid,
  IconButton,
  Skeleton,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Star,
  Add,
  Edit,
  ArrowBack,
  Share,
  BookmarkAdd,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';

import type { Book, Review } from '../types';

// Review form validation schema
const reviewSchema = yup.object({
  rating: yup
    .number()
    .required('Rating is required')
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating cannot exceed 5'),
  reviewText: yup
    .string()
    .max(2000, 'Review cannot exceed 2000 characters')
    .optional(),
});

interface ReviewFormData {
  rating: number;
  reviewText?: string;
}

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [reviewsPage, setReviewsPage] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null);

  const bookId = parseInt(id || '0');

  // Form handling for reviews
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormData>({
    resolver: yupResolver(reviewSchema) as any,
    defaultValues: {
      rating: 5,
      reviewText: '',
    },
  });

  // Fetch book details
  const {
    data: book,
    isLoading: bookLoading,
    error: bookError,
  } = useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: () => apiService.getBookDetails(bookId),
    enabled: !!bookId,
  });

  // Fetch book reviews
  const {
    data: reviewsData,
    isLoading: reviewsLoading,
    error: reviewsError,
  } = useQuery({
    queryKey: ['bookReviews', bookId, reviewsPage],
    queryFn: () => apiService.getBookReviews(bookId, reviewsPage, 5),
    enabled: !!bookId,
  });

  // Fetch favorite status
  const {
    data: favoriteData,
    isLoading: favoriteLoading,
  } = useQuery({
    queryKey: ['bookFavorite', bookId],
    queryFn: () => apiService.checkFavoriteStatus(bookId),
    enabled: !!bookId && isAuthenticated,
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: () => apiService.addToFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookFavorite', bookId] });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: () => apiService.removeFromFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookFavorite', bookId] });
    },
  });

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (data: ReviewFormData) => 
      apiService.createReview(bookId, data.rating, data.reviewText || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookReviews', bookId] });
      queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      setIsReviewDialogOpen(false);
      reset();
      setReviewSubmitError(null);
    },
    onError: (error: any) => {
      setReviewSubmitError(error?.response?.data?.message || 'Failed to submit review');
    },
  });

  const handleFavoriteToggle = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (favoriteData?.favorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  const handleReviewSubmit = (data: ReviewFormData) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setReviewSubmitError(null);
    submitReviewMutation.mutate(data);
  };

  const handleReviewsPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setReviewsPage(newPage - 1);
  };

  if (bookLoading) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ py: 4 }}>
            <Skeleton variant="rectangular" height={400} sx={{ mb: 3 }} />
            <Skeleton variant="text" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={120} />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (bookError || !book) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ mt: 2 }}>
            Book not found or failed to load. Please try again.
          </Alert>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/books')}
            sx={{ mt: 2 }}
          >
            Back to Books
          </Button>
        </Container>
      </Layout>
    );
  }

  const reviews = reviewsData?.content || [];
  const isFavorited = favoriteData?.favorited || false;

  return (
    <Layout>
      <Container maxWidth="lg">
        {/* Back Button */}
        <Box sx={{ py: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Back
          </Button>
        </Box>

        {/* Book Details Section */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {/* Book Cover */}
          <Grid item xs={12} md={4}>
            <Card sx={{ maxWidth: 400, mx: 'auto' }}>
              <Box sx={{ 
                height: 700,
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
                    <Typography variant="h6">No Image Available</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Book Information */}
          <Grid item xs={12} md={8}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Title and Author */}
              <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                {book.title}
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                by {book.author}
              </Typography>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Rating value={Number(book.averageRating)} readOnly precision={0.1} size="large" />
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {book.averageRating ? Number(book.averageRating).toFixed(1) : '0.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({book.reviewCount} reviews)
                </Typography>
              </Box>

              {/* Genres */}
              {book.genres && (
                <Box sx={{ mb: 3 }}>
                  {book.genres.split(',').map((genre, index) => (
                    <Chip
                      key={index}
                      label={genre.trim()}
                      sx={{ mr: 1, mb: 1 }}
                      variant="outlined"
                      color="primary"
                    />
                  ))}
                </Box>
              )}

              {/* Publication Year */}
              {book.publishedYear && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                  <strong>Published:</strong> {book.publishedYear}
                </Typography>
              )}

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={isAuthenticated ? <Add /> : <Edit />}
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setIsReviewDialogOpen(true);
                    }
                  }}
                  size="large"
                >
                  {isAuthenticated ? 'Write Review' : 'Login to Review'}
                </Button>

                <Button
                  variant={isFavorited ? "contained" : "outlined"}
                  startIcon={isFavorited ? <Favorite /> : <FavoriteBorder />}
                  onClick={handleFavoriteToggle}
                  disabled={favoriteLoading || addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending}
                  color={isFavorited ? "error" : "primary"}
                  size="large"
                >
                  {favoriteLoading ? <CircularProgress size={20} /> : 
                   isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Button>

                <IconButton color="primary" size="large">
                  <Share />
                </IconButton>
              </Box>

              {/* Description */}
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ textAlign: 'justify' }}>
                  {book.description || 'No description available for this book.'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        {/* Reviews Section */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2">
              Reviews ({book.reviewCount})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  setIsReviewDialogOpen(true);
                }
              }}
            >
              Write Review
            </Button>
          </Box>

          {reviewsLoading ? (
            <Box>
              {[1, 2, 3].map((item) => (
                <Paper key={item} sx={{ p: 3, mb: 2 }}>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={60} />
                </Paper>
              ))}
            </Box>
          ) : reviewsError ? (
            <Alert severity="error">
              Failed to load reviews. Please try again.
            </Alert>
          ) : reviews.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No reviews yet
              </Typography>
              <Typography color="text.secondary" paragraph>
                Be the first to review this book!
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login');
                  } else {
                    setIsReviewDialogOpen(true);
                  }
                }}
              >
                Write First Review
              </Button>
            </Paper>
          ) : (
            <>
              {reviews.map((review: Review) => (
                <Paper key={review.id} sx={{ p: 3, mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {review.user?.name || 'Anonymous User'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={review.rating} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  {review.reviewText && (
                    <Typography variant="body1" paragraph>
                      {review.reviewText}
                    </Typography>
                  )}
                </Paper>
              ))}

              {/* Pagination */}
              {reviewsData && reviewsData.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={reviewsData.totalPages}
                    page={reviewsPage + 1}
                    onChange={handleReviewsPageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onClose={() => setIsReviewDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>Write a Review for "{book.title}"</DialogTitle>
          <form onSubmit={handleSubmit(handleReviewSubmit)}>
            <DialogContent>
              {reviewSubmitError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {reviewSubmitError}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography component="legend" gutterBottom>
                  Rating *
                </Typography>
                <Controller
                  name="rating"
                  control={control}
                  render={({ field }) => (
                    <Rating
                      {...field}
                      size="large"
                      precision={1}
                    />
                  )}
                />
                {errors.rating && (
                  <Typography color="error" variant="caption" display="block">
                    {errors.rating.message}
                  </Typography>
                )}
              </Box>

              <Controller
                name="reviewText"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Your Review"
                    multiline
                    rows={6}
                    fullWidth
                    placeholder="Share your thoughts about this book..."
                    variant="outlined"
                    error={!!errors.reviewText}
                    helperText={errors.reviewText?.message}
                  />
                )}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsReviewDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || submitReviewMutation.isPending}
                startIcon={submitReviewMutation.isPending ? <CircularProgress size={20} /> : null}
              >
                Submit Review
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default BookDetailsPage;