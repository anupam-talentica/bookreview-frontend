// Recommendation Dashboard component with personalized book recommendations

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  Alert,
  Skeleton,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh,
  ThumbUp,
  ThumbDown,
  TrendingUp,
  AutoAwesome,
  Star,
  Visibility,
  BookmarkAdd,
  Search,
  SmartToy,
  FavoriteOutlined,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import FavoriteButton from './FavoriteButton';

import type { Recommendation, RecommendationResponse } from '../types';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onFeedback: (recommendationId: number, feedbackType: 'like' | 'dislike') => void;
  feedbackLoading: boolean;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onFeedback,
  feedbackLoading,
}) => {
  const navigate = useNavigate();
  
  // Safety checks for recommendation data
  if (!recommendation || !recommendation.book) {
    return null;
  }
  
  const { book, explanation, type, confidence } = recommendation;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'genre_similarity':
        return <AutoAwesome fontSize="small" />;
      case 'community_favorite':
        return <TrendingUp fontSize="small" />;
      case 'genre_trending':
        return <Star fontSize="small" />;
      case 'user_favorite':
        return <FavoriteOutlined fontSize="small" />;
      case 'ai_recommendation':
        return <SmartToy fontSize="small" />;
      default:
        return <BookmarkAdd fontSize="small" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'genre_similarity':
        return 'primary';
      case 'community_favorite':
        return 'secondary';
      case 'genre_trending':
        return 'warning';
      case 'user_favorite':
        return 'error';
      case 'ai_recommendation':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleViewBook = () => {
    navigate(`/books/${book.id}`);
  };

  const handleLike = () => {
    onFeedback(book.id, 'like');
  };

  const handleDislike = () => {
    onFeedback(book.id, 'dislike');
  };

  return (
    <Card
      sx={{
        minHeight: 400,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          transition: 'transform 0.2s ease-in-out',
          boxShadow: 3,
        },
      }}
    >
      {/* Confidence Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Chip
          icon={getTypeIcon(type)}
          label={`${Math.round(confidence * 100)}%`}
          size="small"
          color={getTypeColor(type) as any}
          variant="filled"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>

      <Box sx={{ 
        height: 200, 
        maxHeight: 200,
        minHeight: 200,
        flexShrink: 0,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f5f5f5',
        cursor: 'pointer'
      }}
      onClick={handleViewBook}
      >
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
        flexDirection: 'column',
        justifyContent: 'space-between'
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
          <Box sx={{ mb: 2 }}>
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

        {/* Recommendation Explanation */}
        <Box sx={{ backgroundColor: 'grey.50', p: 1, borderRadius: 1, mt: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {explanation}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View book details">
            <IconButton
              size="small"
              onClick={handleViewBook}
              color="primary"
              sx={{ 
                '&:hover': { backgroundColor: 'primary.light', color: 'white' }
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <FavoriteButton bookId={book.id} size="small" variant="icon" />
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="I like this recommendation">
            <IconButton
              size="small"
              onClick={handleLike}
              disabled={feedbackLoading}
              color="success"
              sx={{ 
                '&:hover': { backgroundColor: 'success.light', color: 'white' }
              }}
            >
              <ThumbUp fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Not interested">
            <IconButton
              size="small"
              onClick={handleDislike}
              disabled={feedbackLoading}
              color="error"
              sx={{ 
                '&:hover': { backgroundColor: 'error.light', color: 'white' }
              }}
            >
              <ThumbDown fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </CardActions>
    </Card>
  );
};

interface RecommendationDashboardProps {
  limit?: number;
  showHeader?: boolean;
}

const RecommendationDashboard: React.FC<RecommendationDashboardProps> = ({
  limit = 3,
  showHeader = true,
}) => {
  const { isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [componentError, setComponentError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Clear component error when auth state changes
  useEffect(() => {
    if (isAuthenticated && componentError) {
      setComponentError(null);
    }
  }, [isAuthenticated, componentError]);

  // Fetch personalized recommendations
  const {
    data: recommendationData,
    isLoading,
    error,
    refetch,
  } = useQuery<RecommendationResponse>({
    queryKey: ['recommendations', limit, refreshKey],
    queryFn: () => apiService.getRecommendations(limit),
    enabled: isAuthenticated, // Only check authentication, allow retry after errors
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure to avoid infinite loops
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  // Fetch AI recommendations
  const {
    data: aiRecommendationData,
    isLoading: aiIsLoading,
    error: aiError,
    refetch: aiRefetch,
  } = useQuery<RecommendationResponse & { aiAvailable: boolean }>({
    queryKey: ['ai-recommendations', limit, refreshKey],
    queryFn: () => apiService.getAIRecommendations(limit),
    enabled: isAuthenticated && tabValue === 1, // Only fetch when AI tab is active
    staleTime: 10 * 60 * 1000, // 10 minutes (AI calls are more expensive)
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Handle query errors
  useEffect(() => {
    if (error && !isLoading) {
      console.error('React Query error:', error);
      setComponentError(`Unable to load recommendations: ${error.message}`);
    } else if (!error && recommendationData) {
      // Clear any previous errors when data loads successfully
      setComponentError(null);
    }
  }, [error, isLoading, recommendationData]);

  // Submit feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: ({ recommendationId, feedbackType }: { recommendationId: number; feedbackType: 'like' | 'dislike' }) =>
      apiService.submitRecommendationFeedback(recommendationId, feedbackType),
    onSuccess: () => {
      // Optionally show success message or update UI
    },
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setComponentError(null); // Clear errors when switching tabs
  };

  const handleRefresh = () => {
    setComponentError(null); // Clear any component errors
    setRefreshKey(prev => prev + 1);
    if (tabValue === 0) {
      refetch();
    } else {
      aiRefetch();
    }
  };

  const handleFeedback = (recommendationId: number, feedbackType: 'like' | 'dislike') => {
    try {
      feedbackMutation.mutate({ recommendationId, feedbackType });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  // Component-level error boundary or authentication check
  if (componentError) {
    return (
      <Box sx={{ mb: 6 }}>
        {showHeader && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AutoAwesome color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5">Book Recommendations</Typography>
          </Box>
        )}
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Try Again
          </Button>
        }>
          {componentError}
        </Alert>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ mb: 6 }}>
        {showHeader && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <AutoAwesome color="primary" sx={{ mr: 1 }} />
            <Typography variant="h5">Book Recommendations</Typography>
          </Box>
        )}
        <Alert severity="info">
          Please log in to see personalized book recommendations tailored to your reading preferences.
        </Alert>
      </Box>
    );
  }

  // Get current recommendations based on active tab
  const getCurrentRecommendations = () => {
    if (tabValue === 0) {
      return recommendationData?.recommendations || [];
    } else {
      return aiRecommendationData?.recommendations || [];
    }
  };

  const getCurrentLoading = () => {
    return tabValue === 0 ? isLoading : aiIsLoading;
  };

  const getCurrentError = () => {
    return tabValue === 0 ? error : aiError;
  };

  const currentRecommendations = getCurrentRecommendations();
  const currentLoading = getCurrentLoading();
  const currentError = getCurrentError();

  return (
    <Box sx={{ mb: 6 }}>
      {showHeader && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome color="primary" sx={{ mr: 1 }} />
              <Typography variant="h5">
                Book Recommendations
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                color="primary"
                endIcon={<Search />}
                size="small"
                sx={{ mr: 1 }}
              >
                View All
              </Button>
              <Tooltip title="Refresh recommendations">
                <IconButton
                  onClick={handleRefresh}
                  color="primary"
                  disabled={currentLoading}
                  size="small"
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<AutoAwesome />} 
              label="Personalized" 
              sx={{ textTransform: 'none' }}
            />
            <Tab 
              icon={<SmartToy />} 
              label="AI Recommendations" 
              sx={{ textTransform: 'none' }}
            />
          </Tabs>
        </Box>
      )}

      {/* Tab Content */}
      <Box sx={{ mt: 2 }}>
        {tabValue === 1 && aiRecommendationData?.aiAvailable === false && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>AI Recommendations are not available.</strong><br />
              Please contact your administrator to configure OpenAI integration to enable AI-powered book recommendations.
            </Typography>
          </Alert>
        )}

        {currentLoading ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {Array.from({ length: limit }).map((_, index) => (
              <Box key={index} sx={{ flex: '1 1 300px', minWidth: '280px' }}>
                <Card sx={{ height: '100%' }}>
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
        ) : currentError ? (
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }>
            Failed to load {tabValue === 0 ? 'personalized' : 'AI'} recommendations. Please try again.
          </Alert>
        ) : currentRecommendations.length === 0 ? (
          <Alert severity="info" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Refresh
            </Button>
          }>
            {tabValue === 0 
              ? "No personalized recommendations available right now. Try adding some books to your favorites to get personalized suggestions!"
              : "No AI recommendations available. Make sure you have some favorite books and that AI is properly configured."
            }
          </Alert>
        ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {currentRecommendations.map((recommendation) => (
          <Box key={recommendation.book?.id || Math.random()} sx={{ flex: '1 1 280px', minWidth: '280px', maxWidth: '320px' }}>
                <RecommendationCard
                  recommendation={recommendation}
                  onFeedback={handleFeedback}
                  feedbackLoading={feedbackMutation.isPending}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RecommendationDashboard;
