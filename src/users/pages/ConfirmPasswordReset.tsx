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
import { VpnKey, CheckCircle } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/core';
import { useConfirmPasswordReset } from '../api';
import { PasswordResetConfirmData } from '../types';
import { validatePassword } from '../utils';

const ConfirmPasswordReset: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const confirmResetMutation = useConfirmPasswordReset();
  const [resetComplete, setResetComplete] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordResetConfirmData>({
    defaultValues: {
      token: token || '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  const newPassword = watch('new_password');

  const handleFormSubmit = async (data: PasswordResetConfirmData) => {
    try {
      await confirmResetMutation.mutateAsync(data);
      setResetComplete(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error">
                Invalid or missing reset token. Please request a new password reset.
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/request-password-reset')}
                sx={{ mt: 2 }}
              >
                Request New Reset
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
              {resetComplete ? (
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
                    Password Reset Successfully!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Your password has been reset. You can now log in with your new password.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                  >
                    Go to Login
                  </Button>
                </Box>
              ) : (
                <>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <VpnKey sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                      Set New Password
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Please enter your new password below.
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
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
                          autoFocus
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
                      loading={confirmResetMutation.isPending}
                      loadingText="Resetting Password..."
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Reset Password
                    </Button>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default ConfirmPasswordReset;