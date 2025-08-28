import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Avatar,
  Paper,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  IconButton,
  Chip,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Security as SecurityIcon,
  BookmarkBorder as BookmarkIcon,
  RateReview as ReviewIcon,
  Email as EmailIcon,
  DateRange as DateIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import type { ProfileUpdateData, PasswordChangeData } from '../types';

interface ProfileFormData {
  name: string;
  bio: string;
  avatarUrl: string;
}

interface PrivacySettings {
  profileVisible: boolean;
  emailVisible: boolean;
  reviewsVisible: boolean;
  favoritesVisible: boolean;
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, refreshProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  // State for editing modes
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  
  // State for form data
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: '',
    bio: '',
    avatarUrl: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisible: true,
    emailVisible: false,
    reviewsVisible: true,
    favoritesVisible: true
  });

  // State for loading and errors
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form data when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  // Refresh profile data on component mount
  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const handleProfileUpdate = async () => {
    setError(null);
    setSuccess(null);
    setUpdateLoading(true);

    try {
      const updateData: ProfileUpdateData = {};
      
      if (profileForm.name !== user?.name) {
        updateData.name = profileForm.name;
      }
      if (profileForm.bio !== (user?.bio || '')) {
        updateData.bio = profileForm.bio;
      }
      if (profileForm.avatarUrl !== (user?.avatarUrl || '')) {
        updateData.avatarUrl = profileForm.avatarUrl;
      }

      if (Object.keys(updateData).length > 0) {
        await updateProfile(updateData);
        setSuccess('Profile updated successfully!');
      }
      
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setError(null);
    setSuccess(null);
    setUpdateLoading(true);

    try {
      await changePassword(passwordForm);
      setSuccess('Password changed successfully!');
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        bio: user.bio || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
    setEditMode(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || !user) {
    return (
      <Layout>
        <Container maxWidth="lg">
          <Box sx={{ mt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              gap: 3 
            }}>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 33.333%' }
              }}>
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                  <Skeleton variant="circular" width={120} height={120} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 1 }} />
                  <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
                </Paper>
              </Box>
              <Box sx={{ 
                flex: { xs: '1', md: '0 0 66.666%' }
              }}>
                <Paper sx={{ p: 3 }}>
                  <Skeleton variant="text" width="40%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="60%" />
                </Paper>
              </Box>
            </Box>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ mt: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 3 
          }}>
            {/* Profile Card */}
            <Box sx={{ 
              flex: { xs: '1', md: '0 0 33.333%' }
            }}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={editMode ? profileForm.avatarUrl : user.avatarUrl}
                    sx={{ width: 120, height: 120, mx: 'auto', fontSize: '3rem' }}
                  >
                    {(editMode ? profileForm.name : user.name)?.charAt(0).toUpperCase()}
                  </Avatar>
                  {editMode && (
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': { backgroundColor: 'primary.dark' }
                      }}
                      size="small"
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
                
                {editMode ? (
                  <Box sx={{ mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      sx={{ mb: 2 }}
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Avatar URL"
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" gutterBottom>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {user.email}
                    </Typography>
                  </>
                )}

                {editMode ? (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleProfileUpdate}
                      disabled={updateLoading}
                      sx={{ mr: 1 }}
                    >
                      Save
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={handleCancelEdit}
                      disabled={updateLoading}
                    >
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => setEditMode(true)}
                    sx={{ mt: 2 }}
                  >
                    Edit Profile
                  </Button>
                )}

                <Divider sx={{ my: 2 }} />

                <Box sx={{ textAlign: 'left' }}>
                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <EmailIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={user.email}
                      />
                      {user.emailVerified && (
                        <Chip label="Verified" color="success" size="small" />
                      )}
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <DateIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Member Since"
                        secondary={formatDate(user.createdAt)}
                      />
                    </ListItem>
                  </List>
                </Box>
              </Paper>
            </Box>

            {/* Main Content */}
            <Box sx={{ 
              flex: { xs: '1', md: '0 0 66.666%' }
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Bio Section */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    About
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Bio"
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="body1" sx={{ minHeight: '100px' }}>
                      {user.bio || 'No bio available. Click "Edit Profile" to add one!'}
                    </Typography>
                  )}
                </Paper>

                {/* Statistics Cards */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' }, 
                  gap: 3 
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <ReviewIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h4" component="div">
                          {user.reviewCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Reviews Written
                        </Typography>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={() => navigate('/my-reviews')}
                          sx={{ mt: 1 }}
                        >
                          View My Reviews
                        </Button>
                      </CardContent>
                    </Card>
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Card>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <BookmarkIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                        <Typography variant="h4" component="div">
                          {user.favoriteBooksCount || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Favorite Books
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                </Box>

                {/* Account Settings */}
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Account Settings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Change Password"
                        secondary="Update your account password"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setPasswordDialogOpen(true)}
                      >
                        Change
                      </Button>
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <VisibilityIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="Privacy Settings"
                        secondary="Control who can see your information"
                      />
                      <Button
                        variant="outlined"
                        onClick={() => setPrivacyDialogOpen(true)}
                      >
                        Manage
                      </Button>
                    </ListItem>
                  </List>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Password Change Dialog */}
        <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                label="Current Password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="New Password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                label="Confirm New Password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                error={passwordForm.newPassword !== '' && passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
                helperText={passwordForm.newPassword !== '' && passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handlePasswordChange}
              variant="contained"
              disabled={updateLoading || !passwordForm.currentPassword || !passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
            >
              {updateLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Privacy Settings Dialog */}
        <Dialog open={privacyDialogOpen} onClose={() => setPrivacyDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Privacy Settings</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.profileVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisible: e.target.checked })}
                  />
                }
                label="Make profile visible to other users"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.emailVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, emailVisible: e.target.checked })}
                  />
                }
                label="Show email address on profile"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.reviewsVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, reviewsVisible: e.target.checked })}
                  />
                }
                label="Make reviews visible to other users"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={privacySettings.favoritesVisible}
                    onChange={(e) => setPrivacySettings({ ...privacySettings, favoritesVisible: e.target.checked })}
                  />
                }
                label="Make favorite books visible to other users"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPrivacyDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() => {
                // TODO: Save privacy settings to backend
                setPrivacyDialogOpen(false);
                setSuccess('Privacy settings updated successfully!');
              }}
              variant="contained"
            >
              Save Settings
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default ProfilePage;