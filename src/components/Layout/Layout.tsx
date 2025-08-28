// Main layout component that wraps all pages

import React, { type ReactNode } from 'react';
import { Box, Container, Toolbar, Typography, Link, Divider } from '@mui/material';
import { GitHub, LinkedIn, Email } from '@mui/icons-material';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  maxWidth = 'lg', 
  disableGutters = false 
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        {/* Toolbar spacer */}
        <Toolbar />
        
        {/* Page Content */}
        <Container 
          maxWidth={maxWidth} 
          disableGutters={disableGutters}
          sx={{ py: 4 }}
        >
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 3,
          mt: 'auto',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', md: 'flex-start' },
              gap: 2,
            }}
          >
            {/* Left side - App info */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h6" color="primary" gutterBottom>
                BookReview
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Discover, review, and share your favorite books with the community.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} BookReview Platform. All rights reserved.
              </Typography>
            </Box>

            {/* Middle - Quick Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Quick Links
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Link href="/books" color="text.secondary" underline="hover">
                  Browse Books
                </Link>
                <Link href="/top-rated" color="text.secondary" underline="hover">
                  Top Rated
                </Link>
                <Link href="/popular" color="text.secondary" underline="hover">
                  Popular Books
                </Link>
                <Link href="/about" color="text.secondary" underline="hover">
                  About Us
                </Link>
              </Box>
            </Box>

            {/* Right side - Social Links */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom>
                Connect
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Link
                  href="https://github.com"
                  color="text.secondary"
                  aria-label="GitHub"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHub />
                </Link>
                <Link
                  href="https://linkedin.com"
                  color="text.secondary"
                  aria-label="LinkedIn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedIn />
                </Link>
                <Link
                  href="mailto:contact@bookreview.com"
                  color="text.secondary"
                  aria-label="Email"
                >
                  <Email />
                </Link>
              </Box>
              
              {/* Legal Links */}
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                <Link href="/privacy" color="text.secondary" underline="hover" variant="caption">
                  Privacy Policy
                </Link>
                <Link href="/terms" color="text.secondary" underline="hover" variant="caption">
                  Terms of Service
                </Link>
              </Box>
            </Box>
          </Box>

          {/* Divider and additional info */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Built with React, Material-UI, and Spring Boot. 
              Designed for book lovers, by book lovers.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
