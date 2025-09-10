import React from 'react';
import {
  Box,
  TextField,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
} from '@mui/material';
import { Save, Phone, Verified, Warning } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '@/components/core';
import { ImageUpload } from './ImageUpload';
import { Profile } from '../types';
import { useAuthStore } from '@/store/authStore';
import { useUploadProfilePicture, useUploadBrandLogo, useRemoveProfilePicture, useRemoveBrandLogo } from '../api';
import { validatePhoneNumber, validateTimezone, getAvailableTimezones } from '../utils';

interface ProfileFormProps {
  profile: Profile;
  onSubmit: (data: Partial<Profile>) => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSubmit, isLoading }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const timezones = getAvailableTimezones();
  
  // Transform profile data to handle timezone compatibility
  const transformedProfile = React.useMemo(() => {
    if (!profile) return profile;
    
    let timezone_name = profile.timezone_name;
    
    // Handle UTC -> Etc/UTC conversion
    if (timezone_name === 'UTC') {
      timezone_name = 'Etc/UTC';
    }
    
    // If timezone is still not in the available list, set to empty string
    const isValidTimezone = timezones.some(tz => tz.value === timezone_name);
    if (!isValidTimezone) {
      timezone_name = '';
    }
    
    return {
      ...profile,
      timezone_name,
    };
  }, [profile, timezones]);
  
  // Image upload mutations
  const uploadProfilePictureMutation = useUploadProfilePicture();
  const uploadBrandLogoMutation = useUploadBrandLogo();
  const removeProfilePictureMutation = useRemoveProfilePicture();
  const removeBrandLogoMutation = useRemoveBrandLogo();
  
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Partial<Profile>>({
    defaultValues: transformedProfile,
  });

  // Update form when profile data changes
  React.useEffect(() => {
    if (transformedProfile) {
      reset(transformedProfile);
    }
  }, [transformedProfile, reset]);

  const handleFormSubmit = (data: Partial<Profile>) => {
    // Transform timezone back for backend compatibility
    const submitData = { ...data };
    if (submitData.timezone_name === 'Etc/UTC') {
      submitData.timezone_name = 'UTC';
    }
    onSubmit(submitData);
  };

  const handleProfilePictureUpload = (file: File) => {
    uploadProfilePictureMutation.mutate({ file });
  };

  const handleBrandLogoUpload = (file: File) => {
    uploadBrandLogoMutation.mutate({ file });
  };

  const handleRemoveProfilePicture = () => {
    removeProfilePictureMutation.mutate();
  };

  const handleRemoveBrandLogo = () => {
    removeBrandLogoMutation.mutate();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <Grid container spacing={3}>
        {/* Profile Picture Section */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Images
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <ImageUpload
                    currentImage={profile.profile_picture}
                    onUpload={handleProfilePictureUpload}
                    onRemove={handleRemoveProfilePicture}
                    isUploading={uploadProfilePictureMutation.isPending}
                    label="Profile Picture"
                    size={120}
                    variant="circular"
                    placeholder="Upload a profile picture to personalize your account"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <ImageUpload
                    currentImage={profile.brand_logo}
                    onUpload={handleBrandLogoUpload}
                    onRemove={handleRemoveBrandLogo}
                    isUploading={uploadBrandLogoMutation.isPending}
                    label="Brand Logo"
                    size={120}
                    variant="square"
                    placeholder="Upload your company or personal brand logo"
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Basic Information */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="display_name"
                    control={control}
                    rules={{ required: 'Display name is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Display Name"
                        error={!!errors.display_name}
                        helperText={errors.display_name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="job_title"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Job Title"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Bio"
                        multiline
                        rows={3}
                        placeholder="Tell people a bit about yourself..."
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>

              
              {/* Phone Verification Status Alert */}
              {user && !user.is_phone_verified && profile.phone && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 2 }}
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => navigate('/users/verify-phone', { 
                        state: { from: '/users/profile', phone: profile.phone } 
                      })}
                    >
                      Verify Now
                    </Button>
                  }
                >
                  Your phone number is not verified. Verify it to enable SMS notifications and MFA.
                </Alert>
              )}
              
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      validate: (value) => 
                        !value || validatePhoneNumber(value) || 'Invalid phone number format'
                    }}
                    render={({ field }) => (
                      <Box>
                        <TextField
                          {...field}
                          fullWidth
                          label="Phone Number"
                          placeholder="+1 (555) 123-4567"
                          error={!!errors.phone}
                          helperText={errors.phone?.message}
                          InputProps={{
                            endAdornment: user?.is_phone_verified ? (
                              <Chip
                                icon={<Verified />}
                                label="Verified"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            ) : field.value ? (
                              <Chip
                                icon={<Warning />}
                                label="Unverified"
                                color="warning"
                                size="small"
                                variant="outlined"
                              />
                            ) : null,
                          }}
                        />
                        {field.value && !user?.is_phone_verified && (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<Phone />}
                              onClick={() => navigate('/verify-phone', { 
                                state: { from: '/users/profile', phone: field.value } 
                              })}
                            >
                              Verify Phone Number
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="website"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Website"
                        placeholder="https://example.com"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Company"
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Localization Settings */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Localization
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="timezone_name"
                    control={control}
                    rules={{
                      validate: (value) => 
                        !value || validateTimezone(value) || 'Invalid timezone'
                    }}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id="timezone-label">Timezone</InputLabel>
                        <Select {...field} label="Timezone">
                          {timezones.map((tz) => (
                            <MenuItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id="language-label">Language</InputLabel>
                        <Select {...field} label="Language">
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Spanish</MenuItem>
                          <MenuItem value="fr">French</MenuItem>
                          <MenuItem value="de">German</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="date_format"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id="date-format-label">Date Format</InputLabel>
                        <Select {...field} label="Date Format">
                          <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                          <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                          <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="time_format"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel id="time-format-label">Time Format</InputLabel>
                        <Select {...field} label="Time Format">
                          <MenuItem value="12h">12 Hour (AM/PM)</MenuItem>
                          <MenuItem value="24h">24 Hour</MenuItem>
                        </Select>
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Branding */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Branding
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="brand_color"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Brand Color"
                        type="color"
                        InputProps={{
                          sx: { height: 56 }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Box>
          </Card>
        </Grid>

        {/* Privacy Settings */}
        <Grid item xs={12}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Privacy Settings
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="public_profile"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Make profile public"
                    />
                  )}
                />
                <Controller
                  name="show_email"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Show email on public profile"
                    />
                  )}
                />
                <Controller
                  name="show_phone"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch {...field} checked={field.value} />}
                      label="Show phone on public profile"
                    />
                  )}
                />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* Submit Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              loading={isLoading}
              loadingText="Saving..."
              startIcon={<Save />}
            >
              Save Changes
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};