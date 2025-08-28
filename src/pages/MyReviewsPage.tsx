import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,

  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Divider,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import { Edit, Delete, Add, Search, Book as BookIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';
import Layout from '../components/Layout/Layout';
import type { Review, Book } from '../types';

const MyReviewsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);
  
  // Book search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [activeStep, setActiveStep] = useState(0); // 0: Select Book, 1: Write Review

  // Fetch user's reviews
  const {
    data: reviewsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['myReviews', page, pageSize],
    queryFn: () => apiService.getMyReviews(page, pageSize),
    enabled: isAuthenticated,
  });

  // Create or update review mutation
  const reviewMutation = useMutation({
    mutationFn: (reviewData: { bookId: number; rating: number; reviewText?: string; reviewId?: number }) =>
      reviewData.reviewId 
        ? apiService.updateReview(reviewData.reviewId, reviewData.rating, reviewData.reviewText)
        : apiService.createReview(reviewData.bookId, reviewData.rating, reviewData.reviewText || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      handleDialogClose();
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) => apiService.deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
    },
  });

  // Handle dialog open for create or edit
  const handleDialogOpen = (review?: Review) => {
    if (review) {
      // Edit existing review
      setCurrentReview(review);
      // Create a full Book object from the review book data
      const fullBook: Book = {
        id: review.book.id,
        title: review.book.title,
        author: review.book.author,
        description: '',
        coverImageUrl: '',
        genres: review.book.genres || '',
        publishedYear: review.book.publishedYear || undefined,
        averageRating: review.book.averageRating || 0,
        reviewCount: review.book.reviewCount || 0,
        createdAt: review.book.createdAt || '',
        updatedAt: review.book.updatedAt || '',
        isbn: '',
        publisher: '',
        pageCount: undefined,
        language: ''
      };
      setSelectedBook(fullBook);
      setActiveStep(1); // Go directly to review step
    } else {
      // Add new review
      setCurrentReview(null);
      setSelectedBook(null);
      setActiveStep(0); // Start with book selection
      setSearchQuery('');
      setSearchResults([]);
    }
    setIsDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setCurrentReview(null);
    setSelectedBook(null);
    setActiveStep(0);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle book search
  const handleBookSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiService.searchBooks(query, 0, 10);
      setSearchResults(response.content);
    } catch (error) {
      console.error('Book search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle book selection
  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setCurrentReview({
      id: 0,
      rating: 5,
      reviewText: '',
      book: book,
      user: user!,
      createdAt: '',
      updatedAt: ''
    });
    setActiveStep(1); // Move to review step
  };

  // Handle review submission
  const handleReviewSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (currentReview && selectedBook) {
      reviewMutation.mutate({
        bookId: selectedBook.id,
        rating: currentReview.rating,
        reviewText: currentReview.reviewText,
        reviewId: currentReview.id > 0 ? currentReview.id : undefined
      });
    }
  };

  // Handle review deletion
  const handleReviewDelete = (reviewId: number) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  // Handle step navigation
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please log in to view your reviews.
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => window.location.href = '/login'}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            My Reviews
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.name}, you have written {reviewsData?.totalElements || 0} reviews
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to load your reviews. Please try again.
          </Alert>
        ) : reviewsData?.content.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <BookIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Share your thoughts about books you've read by adding your first review!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleDialogOpen()}
              sx={{ mt: 2 }}
            >
              Add Your First Review
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {reviewsData?.content.map((review) => (
                <Card key={review.id} sx={{ display: 'flex', '&:hover': { boxShadow: 4 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" component="h3" sx={{ flexGrow: 1 }}>
                          {review.book.title}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={review.rating} readOnly precision={0.1} size="small" />
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            {review.rating}/5
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        by {review.book.author}
                      </Typography>

                      {review.book.genres && (
                        <Box sx={{ mb: 2 }}>
                          {review.book.genres.split(',').slice(0, 3).map((genre: string, index: number) => (
                            <Chip key={index} label={genre.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                          ))}
                        </Box>
                      )}

                      {review.reviewText && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                          <Typography variant="body2" color="text.primary">
                            "{review.reviewText}"
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          size="small" 
                          onClick={() => handleDialogOpen(review)} 
                          startIcon={<Edit />}
                          variant="outlined"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          onClick={() => handleReviewDelete(review.id)} 
                          startIcon={<Delete />} 
                          color="error"
                          variant="outlined"
                        >
                          Delete
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Rating value={review.book.averageRating || 0} readOnly size="small" />
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Avg: {(review.book.averageRating || 0).toFixed(1)} ({review.book.reviewCount || 0} reviews)
                        </Typography>
                      </Box>
                    </CardActions>
                  </Box>
                </Card>
              ))}
            </Box>

            {reviewsData && reviewsData.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={reviewsData.totalPages}
                  page={page + 1}
                  onChange={(_, newPage) => setPage(newPage - 1)}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleDialogOpen()}
          sx={{ mt: 4 }}
        >
          Add Review
        </Button>

        <Dialog open={isDialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {currentReview && currentReview.id > 0 ? 'Edit Review' : 'Add New Review'}
          </DialogTitle>
          <DialogContent>
            {currentReview && currentReview.id > 0 ? (
              // Edit existing review - skip book selection
              <Box sx={{ pt: 2 }}>
                <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">{selectedBook?.title}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    by {selectedBook?.author}
                  </Typography>
                  {selectedBook?.genres && (
                    <Box sx={{ mt: 1 }}>
                      {selectedBook.genres.split(',').map((genre, index) => (
                        <Chip key={index} label={genre.trim()} size="small" sx={{ mr: 0.5 }} />
                      ))}
                    </Box>
                  )}
                </Box>
                <form onSubmit={handleReviewSubmit}>
                  <Box sx={{ mb: 3 }}>
                    <Typography component="legend" gutterBottom>Rating</Typography>
                    <Rating
                      value={currentReview?.rating || 0}
                      onChange={(_, newValue) => setCurrentReview({ ...currentReview!, rating: newValue || 1 })}
                      size="large"
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Review Text (Optional)"
                    multiline
                    rows={4}
                    value={currentReview?.reviewText || ''}
                    onChange={(e) => setCurrentReview({ ...currentReview!, reviewText: e.target.value })}
                    placeholder="Share your thoughts about this book..."
                    sx={{ mb: 3 }}
                  />
                  <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={reviewMutation.isPending}>
                      {reviewMutation.isPending ? 'Saving...' : 'Update Review'}
                    </Button>
                  </DialogActions>
                </form>
              </Box>
            ) : (
              // Add new review - two-step process
              <Box sx={{ pt: 2 }}>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  <Step>
                    <StepLabel>Select Book</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Write Review</StepLabel>
                  </Step>
                </Stepper>

                {activeStep === 0 && (
                  <Box>
                    <TextField
                      fullWidth
                      label="Search for a book"
                      value={searchQuery}
                      onChange={(e) => handleBookSearch(e.target.value)}
                      placeholder="Enter book title, author, or keywords..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                        endAdornment: isSearching ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{ mb: 2 }}
                    />

                    {searchQuery.length >= 2 && (
                      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {searchResults.length > 0 ? (
                          <List>
                            {searchResults.map((book) => (
                              <React.Fragment key={book.id}>
                                <ListItem
                                  onClick={() => handleBookSelect(book)}
                                  sx={{
                                    '&:hover': { bgcolor: 'action.hover' },
                                    borderRadius: 1,
                                    mb: 1,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <ListItemAvatar>
                                    <Avatar
                                      src={book.coverImageUrl}
                                      variant="rounded"
                                      sx={{ width: 60, height: 80 }}
                                    >
                                      <BookIcon />
                                    </Avatar>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={book.title}
                                    secondary={
                                      <Box>
                                        <Typography variant="body2" color="text.secondary">
                                          by {book.author}
                                        </Typography>
                                        {book.publishedYear && (
                                          <Typography variant="caption" color="text.secondary">
                                            Published: {book.publishedYear}
                                          </Typography>
                                        )}
                                        <Box sx={{ mt: 0.5 }}>
                                          <Rating value={book.averageRating} readOnly size="small" />
                                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                            ({book.reviewCount} reviews)
                                          </Typography>
                                        </Box>
                                        {book.genres && (
                                          <Box sx={{ mt: 0.5 }}>
                                            {book.genres.split(',').slice(0, 3).map((genre, index) => (
                                              <Chip key={index} label={genre.trim()} size="small" sx={{ mr: 0.5 }} />
                                            ))}
                                          </Box>
                                        )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                                {searchResults.indexOf(book) < searchResults.length - 1 && <Divider />}
                              </React.Fragment>
                            ))}
                          </List>
                        ) : !isSearching ? (
                          <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                            No books found. Try different search terms.
                          </Typography>
                        ) : null}
                      </Box>
                    )}

                    {searchQuery.length < 2 && (
                      <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                        Type at least 2 characters to search for books
                      </Typography>
                    )}

                    <DialogActions>
                      <Button onClick={handleDialogClose}>Cancel</Button>
                    </DialogActions>
                  </Box>
                )}

                {activeStep === 1 && selectedBook && (
                  <Box>
                    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BookIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6">{selectedBook.title}</Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        by {selectedBook.author}
                      </Typography>
                      {selectedBook.genres && (
                        <Box sx={{ mt: 1 }}>
                          {selectedBook.genres.split(',').map((genre, index) => (
                            <Chip key={index} label={genre.trim()} size="small" sx={{ mr: 0.5 }} />
                          ))}
                        </Box>
                      )}
                    </Box>

                    <form onSubmit={handleReviewSubmit}>
                      <Box sx={{ mb: 3 }}>
                        <Typography component="legend" gutterBottom>Rating *</Typography>
                        <Rating
                          value={currentReview?.rating || 0}
                          onChange={(_, newValue) => setCurrentReview({ ...currentReview!, rating: newValue || 1 })}
                          size="large"
                        />
                      </Box>
                      <TextField
                        fullWidth
                        label="Review Text (Optional)"
                        multiline
                        rows={4}
                        value={currentReview?.reviewText || ''}
                        onChange={(e) => setCurrentReview({ ...currentReview!, reviewText: e.target.value })}
                        placeholder="Share your thoughts about this book..."
                        sx={{ mb: 3 }}
                      />
                      <DialogActions>
                        <Button onClick={handleBack}>Back</Button>
                        <Button onClick={handleDialogClose}>Cancel</Button>
                        <Button 
                          type="submit" 
                          variant="contained" 
                          disabled={reviewMutation.isPending || !currentReview?.rating}
                        >
                          {reviewMutation.isPending ? 'Saving...' : 'Add Review'}
                        </Button>
                      </DialogActions>
                    </form>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyReviewsPage;
