import React from 'react';
import { Button, IconButton, CircularProgress, Tooltip } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

interface FavoriteButtonProps {
  bookId: number;
  variant?: 'button' | 'icon';
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  bookId,
  variant = 'button',
  size = 'small',
  showText = true,
}) => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: () => apiService.removeFromFavorites(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookFavorite', bookId] });
      queryClient.invalidateQueries({ queryKey: ['userFavorites'] });
    },
  });

  const isFavorited = favoriteData?.favorited || false;
  const isLoading = favoriteLoading || addToFavoritesMutation.isPending || removeFromFavoritesMutation.isPending;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return;
    }

    if (isFavorited) {
      removeFromFavoritesMutation.mutate();
    } else {
      addToFavoritesMutation.mutate();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (variant === 'icon') {
    return (
      <Tooltip title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}>
        <IconButton
          onClick={handleFavoriteToggle}
          disabled={isLoading}
          color={isFavorited ? "error" : "default"}
          size={size}
        >
          {isLoading ? (
            <CircularProgress size={size === 'small' ? 16 : 20} />
          ) : isFavorited ? (
            <Favorite />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  return (
    <Button
      size={size}
      color={isFavorited ? "error" : "primary"}
      variant={isFavorited ? "contained" : "outlined"}
      startIcon={
        isLoading ? (
          <CircularProgress size={16} />
        ) : isFavorited ? (
          <Favorite />
        ) : (
          <FavoriteBorder />
        )
      }
      onClick={handleFavoriteToggle}
      disabled={isLoading}
    >
      {showText && (isFavorited ? 'Remove from Favorites' : 'Add to Favorites')}
    </Button>
  );
};

export default FavoriteButton;
