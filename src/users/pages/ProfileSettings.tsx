import React from 'react';
import { Box, Typography, Alert, Snackbar } from '@mui/material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner } from '@/components/core';
import { ProfileForm } from '../components';
import { useProfile, useUpdateProfile } from '../api';
import { Profile } from '../types';

const ProfileSettings: React.FC = () => {
  const { data: profile, isLoading, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [uploadSuccess, setUploadSuccess] = React.useState(false);

  const handleProfileUpdate = (updates: Partial<Profile>) => {
    updateProfileMutation.mutate(updates);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (error) {
    return (
      <Box>
        <PageHeader title="Profile Settings" />
        <Alert severity="error">
          Failed to load profile data. Please try again.
        </Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box>
        <PageHeader title="Profile Settings" />
        <Alert severity="warning">
          No profile data found.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Profile Settings' },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            Your public profile URL: <strong>novameet.com/{profile.organizer_slug}</strong>
            Your public profile URL: <strong>/{profile.organizer_slug}</strong>
          </Typography>
          {(profile.profile_picture || profile.brand_logo) && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Your profile images are automatically optimized and resized for best performance.
              </Typography>
            </Alert>
          )}
        </Box>

        <ProfileForm
          profile={profile}
          onSubmit={handleProfileUpdate}
          isLoading={updateProfileMutation.isPending}
        />
      </motion.div>

      {/* Upload Success Snackbar */}
      <Snackbar
        open={uploadSuccess}
        autoHideDuration={3000}
        onClose={() => setUploadSuccess(false)}
        message="Image uploaded successfully!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ProfileSettings;