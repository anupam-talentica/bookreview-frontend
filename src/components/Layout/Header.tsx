// Header component with navigation and user menu

import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Box,

  alpha,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,

  MenuBook,
  Favorite,
  ExitToApp,
  Person,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

// Styled components
const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    [theme.breakpoints.up('sm')]: {
      width: '20ch',
      '&:focus': {
        width: '30ch',
      },
    },
  },
}));

const Header: React.FC = () => {
  // const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <AppBar position="fixed" color="primary" elevation={1}>
      <Toolbar>
        {/* Logo and App Name */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="home"
          component={RouterLink}
          to="/"
          sx={{ mr: 2 }}
        >
          <MenuBook />
        </IconButton>
        
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            textDecoration: 'none',
            color: 'inherit',
            mr: 4,
            fontWeight: 600,
          }}
        >
          BookReview
        </Typography>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 2 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/books"
            sx={{ mr: 1 }}
          >
            Browse Books
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/top-rated"
            sx={{ mr: 1 }}
          >
            Top Rated
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/popular"
            sx={{ mr: 1 }}
          >
            Popular
          </Button>
        </Box>

        {/* Search Bar */}
        <Search sx={{ mr: 2 }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <form onSubmit={handleSearch}>
            <StyledInputBase
              placeholder="Search books, authors..."
              inputProps={{ 'aria-label': 'search' }}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </form>
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Menu */}
        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Favorites Icon */}
            <IconButton
              color="inherit"
              component={RouterLink}
              to="/favorites"
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={user?.favoriteBooksCount || 0} color="error">
                <Favorite />
              </Badge>
            </IconButton>

            {/* User Avatar and Menu */}
            <IconButton
              edge="end"
              aria-label="account of current user"
              aria-controls="primary-search-account-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar
                src={user?.avatarUrl}
                alt={user?.name}
                sx={{ width: 32, height: 32 }}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
            >
              Login
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              component={RouterLink}
              to="/register"
              sx={{ borderColor: 'white', '&:hover': { borderColor: 'white' } }}
            >
              Sign Up
            </Button>
          </Box>
        )}

        {/* Mobile Menu Button */}
        <IconButton
          sx={{ display: { xs: 'block', md: 'none' }, ml: 1 }}
          color="inherit"
          onClick={handleMobileMenuOpen}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* User Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        id="primary-search-account-menu"
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
      >
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
          <Person sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/my-reviews'); }}>
          <MenuBook sx={{ mr: 1 }} />
          My Reviews
        </MenuItem>
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/favorites'); }}>
          <Favorite sx={{ mr: 1 }} />
          Favorites
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ExitToApp sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
      >
        <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/books'); }}>
          Browse Books
        </MenuItem>
        <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/top-rated'); }}>
          Top Rated
        </MenuItem>
        <MenuItem onClick={() => { handleMobileMenuClose(); navigate('/popular'); }}>
          Popular
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
