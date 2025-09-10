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
import { Email, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/core';
import { useRequestPasswordReset } from '../api';
import { PasswordResetRequestData } from '../types';
import { validateEmail } from '../utils';

const RequestPasswordReset: React.FC = () => {
  const navigate = useNavigate();
  const requestResetMutation = useRequestPasswordReset();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordResetRequestData>({
    defaultValues: {
      email: '',
    },
  });

  const [submitted, setSubmitted] = React.useState(false);

  const handleFormSubmit = async (data: PasswordResetRequestData) => {
    try {
      await requestResetMutation.mutateAsync(data);
      setSubmitted(true);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

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
                <Email sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Reset Your Password
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
              </Box>

              {submitted ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    <Typography variant="body1">
                      If an account with that email exists, a password reset link has been sent.
                    </Typography>
                  </Alert>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Please check your email and follow the instructions to reset your password.
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/login')}
                  >
                    Back to Login
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
                  <Controller
                    name="email"
                    control={control}
                    rules={{
                      required: 'Email is required',
                      validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Email Address"
                        type="email"
                        margin="normal"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        autoFocus
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={requestResetMutation.isPending}
                    loadingText="Sending Reset Link..."
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Send Reset Link
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      startIcon={<ArrowBack />}
                      onClick={() => navigate('/login')}
                    >
                      Back to Login
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default RequestPasswordReset;