import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Alert,
} from '@mui/material';
import { VpnKey, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/core';
import { useAuthStore } from '@/store/authStore';
import { useChangePassword, useForcedPasswordChange } from '../api';
import { ChangePasswordData, ForcedPasswordChangeData } from '../types';
import { validatePassword } from '../utils';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const changePasswordMutation = useChangePassword();
  const forcedPasswordChangeMutation = useForcedPasswordChange();

  const isGracePeriod = user?.account_status === 'password_expired_grace_period';
  const isPasswordExpired = user?.account_status === 'password_expired';

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ChangePasswordData | ForcedPasswordChangeData>({
    defaultValues: isGracePeriod ? {
      new_password: '',
      new_password_confirm: '',
    } : {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  const newPassword = watch('new_password');

  const handleFormSubmit = async (data: ChangePasswordData | ForcedPasswordChangeData) => {
    try {
      if (isGracePeriod) {
        await forcedPasswordChangeMutation.mutateAsync(data as ForcedPasswordChangeData);
        navigate('/dashboard');
      } else {
        await changePasswordMutation.mutateAsync(data as ChangePasswordData);
        navigate('/users/security');
      }
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  if (isPasswordExpired) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <Typography variant="body1">
                  Your password has expired and the grace period has ended. 
                  Please use the "Forgot Password" feature to reset your password.
                </Typography>
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/request-password-reset')}
              >
                Reset Password
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <VpnKey sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  {isGracePeriod ? 'Password Expired' : 'Change Password'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isGracePeriod 
                    ? 'Your password has expired. Please set a new password to continue.'
                    : 'Update your password to keep your account secure.'
                  }
                </Typography>
              </Box>

              {isGracePeriod && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    You are in a grace period. Please change your password now to restore full account access.
                  </Typography>
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
                {!isGracePeriod && (
                  <Controller
                    name="old_password"
                    control={control}
                    rules={{ required: 'Current password is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Current Password"
                        type="password"
                        margin="normal"
                        error={!!errors.old_password}
                        helperText={errors.old_password?.message}
                        autoFocus={!isGracePeriod}
                      />
                    )}
                  />
                )}

                <Controller
                  name="new_password"
                  control={control}
                  rules={{
                    required: 'New password is required',
                    validate: (value) => {
                      const validation = validatePassword(value);
                      return validation.isValid || validation.errors[0];
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="New Password"
                      type="password"
                      margin="normal"
                      error={!!errors.new_password}
                      helperText={errors.new_password?.message}
                      autoFocus={isGracePeriod}
                    />
                  )}
                />

                <Controller
                  name="new_password_confirm"
                  control={control}
                  rules={{
                    required: 'Please confirm your new password',
                    validate: (value) =>
                      value === newPassword || 'Passwords do not match',
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Confirm New Password"
                      type="password"
                      margin="normal"
                      error={!!errors.new_password_confirm}
                      helperText={errors.new_password_confirm?.message}
                    />
                  )}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  loading={isGracePeriod ? forcedPasswordChangeMutation.isPending : changePasswordMutation.isPending}
                  loadingText="Changing Password..."
                  sx={{ mt: 3, mb: 2 }}
                >
                  Change Password
                </Button>

                {!isGracePeriod && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      startIcon={<ArrowBack />}
                      onClick={() => navigate('/users/security')}
                    >
                      Back to Security Settings
                    </Button>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ChangePassword;