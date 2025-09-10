import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import { Group, CheckCircle, Cancel } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/core';
import { useRespondToInvitation } from '../api';
import { InvitationResponseData } from '../types';
import { validateEmail, validatePassword } from '../utils';

const RespondToInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [action, setAction] = useState<'accept' | 'decline' | null>(null);
  const [needsRegistration, setNeedsRegistration] = useState(false);
  
  const respondMutation = useRespondToInvitation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<InvitationResponseData>({
    defaultValues: {
      token: token || '',
      action: 'accept',
      first_name: '',
      last_name: '',
      password: '',
      password_confirm: '',
    },
  });

  const password = watch('password');

  const handleAccept = () => {
    setAction('accept');
    setNeedsRegistration(true); // For simplicity, assume new user registration is needed
  };

  const handleDecline = async () => {
    if (!token) return;
    
    try {
      await respondMutation.mutateAsync({
        token,
        action: 'decline',
      });
      navigate('/login');
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleFormSubmit = async (data: InvitationResponseData) => {
    try {
      const result = await respondMutation.mutateAsync(data);
      if (result.token) {
        localStorage.setItem('auth_token', result.token);
        navigate('/dashboard');
      }
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
                Invalid or missing invitation token.
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Go to Login
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
                <Group sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Team Invitation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  You've been invited to join a team on NovaMeet.
                </Typography>
              </Box>

              {action === null && (
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" gutterBottom>
                    What would you like to do?
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<CheckCircle />}
                        onClick={handleAccept}
                        size="large"
                      >
                        Accept
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        startIcon={<Cancel />}
                        onClick={handleDecline}
                        loading={respondMutation.isPending}
                        size="large"
                      >
                        Decline
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {action === 'accept' && needsRegistration && (
                <>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      To accept this invitation, please complete your account setup.
                    </Typography>
                  </Alert>

                  <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Controller
                          name="first_name"
                          control={control}
                          rules={{ required: 'First name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="First Name"
                              margin="normal"
                              error={!!errors.first_name}
                              helperText={errors.first_name?.message}
                              autoFocus
                            />
                          )}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <Controller
                          name="last_name"
                          control={control}
                          rules={{ required: 'Last name is required' }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Last Name"
                              margin="normal"
                              error={!!errors.last_name}
                              helperText={errors.last_name?.message}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>

                    <Controller
                      name="password"
                      control={control}
                      rules={{
                        required: 'Password is required',
                        validate: (value) => {
                          const validation = validatePassword(value || '');
                          return validation.isValid || validation.errors[0];
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Password"
                          type="password"
                          margin="normal"
                          error={!!errors.password}
                          helperText={errors.password?.message}
                        />
                      )}
                    />

                    <Controller
                      name="password_confirm"
                      control={control}
                      rules={{
                        required: 'Please confirm your password',
                        validate: (value) =>
                          value === password || 'Passwords do not match',
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Confirm Password"
                          type="password"
                          margin="normal"
                          error={!!errors.password_confirm}
                          helperText={errors.password_confirm?.message}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      loading={respondMutation.isPending}
                      loadingText="Accepting Invitation..."
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Accept Invitation & Create Account
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                      <Button
                        variant="text"
                        onClick={() => setAction(null)}
                      >
                        Back
                      </Button>
                    </Box>
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

export default RespondToInvitation;