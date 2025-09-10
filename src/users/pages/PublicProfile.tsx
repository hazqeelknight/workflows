import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Link,
  Chip,
} from '@mui/material';
import { Language, Business, Phone, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/core';
import { usePublicProfile } from '../api';
import { formatPhoneNumber } from '../utils';

const PublicProfile: React.FC = () => {
  const { organizerSlug } = useParams<{ organizerSlug: string }>();
  const { data: profile, isLoading, error } = usePublicProfile(organizerSlug || '');

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />;
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom>
                Profile Not Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The requested organizer profile could not be found or is not public.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardContent sx={{ p: 4 }}>
              {/* Header Section */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  src={profile.profile_picture || undefined}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mx: 'auto', 
                    mb: 2,
                    fontSize: '3rem',
                    bgcolor: profile.brand_color || 'primary.main'
                  }}
                >
                  {profile.organizer_name?.charAt(0) || profile.organizer_slug?.charAt(0)}
                </Avatar>
                
                <Typography variant="h3" gutterBottom>
                  {profile.organizer_name || profile.organizer_slug}
                </Typography>
                
                {profile.company && profile.job_title && (
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {profile.job_title} at {profile.company}
                  </Typography>
                )}
                
                {profile.bio && (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                    {profile.bio}
                  </Typography>
                )}
              </Box>

              {/* Contact Information */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400, mx: 'auto' }}>
                {profile.company && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Business color="action" />
                    <Typography variant="body1">
                      {profile.company}
                    </Typography>
                  </Box>
                )}

                {profile.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Language color="action" />
                    <Link href={profile.website} target="_blank" rel="noopener noreferrer">
                      {profile.website}
                    </Link>
                  </Box>
                )}

                {/* Note: Phone and email are only shown if privacy settings allow */}
              </Box>

              {/* Timezone Information */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Chip
                  label={`Timezone: ${profile.timezone_name}`}
                  variant="outlined"
                  color="primary"
                />
              </Box>

              {/* Booking CTA */}
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Ready to schedule a meeting?
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 500 }}>
                  Visit their booking page to see available times
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default PublicProfile;