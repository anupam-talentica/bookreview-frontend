// Home page component with featured books and overview

import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Container,
  Chip,
  Rating,
  Paper,
  Skeleton,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Star,
  TrendingUp,
  Schedule,
  MenuBook,
  People,
  RateReview,
  Search,
  Visibility,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout/Layout';
import FavoriteButton from '../components/FavoriteButton';
import RecommendationDashboard from '../components/RecommendationDashboard';

import type { Book } from '../types';

// Statistics component
const StatsSection: React.FC = () => {
  const stats = [
    { icon: <MenuBook />, label: 'Books', value: '10K+' },
    { icon: <RateReview />, label: 'Reviews', value: '50K+' },
    { icon: <People />, label: 'Readers', value: '5K+' },
    { icon: <Star />, label: 'Average Rating', value: '4.2' },
  ];

  return (
    <Box sx={{ py: 8, backgroundColor: '#F8F9FA' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" gutterBottom sx={{ color: '#212529', fontWeight: 700 }}>
          Join Our Reading Community
        </Typography>
        <Typography variant="h6" align="center" color="#6C757D" paragraph sx={{ mb: 6 }}>
          Discover your next favorite book with thousands of readers worldwide
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
          {stats.map((stat, index) => (
            <Box key={index} sx={{ flex: '1 1 200px', minWidth: '200px' }}>
              <Paper
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    color: 'primary.main',
                    mb: 1,
                    '& svg': { fontSize: 40 },
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" color="primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

// Book Card Component
interface BookCardProps {
  book: Book;
  isAuthenticated: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, isAuthenticated }) => {
  const navigate = useNavigate();

  const handleViewBook = () => {
    navigate(`/books/${book.id}`);
  };

  return (
    <Card 
      sx={{ 
        minHeight: 400,
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
      onClick={handleViewBook}
    >
      <Box sx={{ 
        height: 200, 
        maxHeight: 200,
        minHeight: 200,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
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
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 2, 
        minHeight: 180,
        backgroundColor: 'background.paper',
        display: 'flex',
        flexDirection: 'column'
      }}>
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
              onClick={(e) => {
                e.stopPropagation();
                handleViewBook();
              }}
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
  );
};

// Book Section Component
interface BookSectionProps {
  title: string;
  books: Book[];
  loading: boolean;
  error: Error | null;
  icon: React.ReactNode;
  viewAllLink: string;
}

const BookSection: React.FC<BookSectionProps> = ({
  title,
  books,
  loading,
  error,
  icon,
  viewAllLink,
}) => {
  const { isAuthenticated } = useAuth();

  if (loading) {
    return (
      <Box sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          {icon}
          <Typography variant="h5" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Box key={item} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
              <Card>
                <Skeleton variant="rectangular" height={240} />
                <CardContent>
                  <Skeleton variant="text" height={30} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 6 }}>
        Failed to load {title.toLowerCase()}. Please try again later.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        mb: 3 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <Typography variant="h5" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to={viewAllLink}
          color="primary"
          endIcon={<Search />}
        >
          View All
        </Button>
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {books.map((book) => (
          <Box key={book.id} sx={{ flex: '1 1 300px', minWidth: '280px' }}>
            <BookCard book={book} isAuthenticated={isAuthenticated} />
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Fetch data using React Query
  const {
    data: topRatedBooks,
    isLoading: topRatedLoading,
    error: topRatedError,
  } = useQuery({
    queryKey: ['topRatedBooks'],
    queryFn: () => apiService.getTopRatedBooks(4),
  });

  const {
    data: popularBooks,
    isLoading: popularLoading,
    error: popularError,
  } = useQuery({
    queryKey: ['popularBooks'],
    queryFn: () => apiService.getPopularBooks(4),
  });

  const {
    data: recentBooks,
    isLoading: recentLoading,
    error: recentError,
  } = useQuery({
    queryKey: ['recentBooks'],
    queryFn: () => apiService.getRecentBooks(4),
  });

  return (
    <Layout>
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1DD1C1 0%, #1E88E5 100%)',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Discover Your Next Great Read
            </Typography>
            <Typography variant="h5" paragraph>
              Join thousands of book lovers sharing reviews, recommendations, and literary discussions
            </Typography>
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{ 
                      px: 4,
                      backgroundColor: '#FFFFFF',
                      color: '#212529',
                      fontWeight: 700,
                      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                      border: '2px solid #212529',
                      '&:hover': {
                        backgroundColor: '#F8F9FA',
                        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                        transform: 'translateY(-1px)',
                        border: '2px solid #212529',
                      },
                    }}
                  >
                    Get Started
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{ 
                      px: 4,
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                    onClick={() => navigate('/books')}
                  >
                    Browse Books
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  color="secondary"
                  onClick={() => navigate('/books')}
                  sx={{ px: 4 }}
                >
                  Explore Books
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Personalized Recommendations for authenticated users */}
        {isAuthenticated && (
          <RecommendationDashboard limit={3} />
        )}

        {/* Top Rated Books */}
        <BookSection
          title="Top Rated Books"
          books={topRatedBooks || []}
          loading={topRatedLoading}
          error={topRatedError}
          icon={<Star color="primary" />}
          viewAllLink="/top-rated"
        />

        {/* Popular Books */}
        <BookSection
          title="Most Popular"
          books={popularBooks || []}
          loading={popularLoading}
          error={popularError}
          icon={<TrendingUp color="primary" />}
          viewAllLink="/popular"
        />

        {/* Recent Books */}
        <BookSection
          title="Recently Added"
          books={recentBooks || []}
          loading={recentLoading}
          error={recentError}
          icon={<Schedule color="primary" />}
          viewAllLink="/books"
        />

        {/* Features Section */}
        <Box sx={{ py: 6 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Why Choose BookReview?
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mt: 2 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Search sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Smart Discovery
                </Typography>
                <Typography color="text.secondary">
                  Find books tailored to your taste with our intelligent recommendation system
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <RateReview sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Honest Reviews
                </Typography>
                <Typography color="text.secondary">
                  Read genuine reviews from fellow book lovers to make informed choices
                </Typography>
              </Box>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Box sx={{ textAlign: 'center' }}>
                <People sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Book Community
                </Typography>
                <Typography color="text.secondary">
                  Connect with readers who share your passion for great literature
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>

      {/* Statistics Section */}
      <StatsSection />
    </Layout>
  );
};

export default HomePage;
