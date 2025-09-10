import React, { useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
} from '@mui/material';
import { Phone, Sms, CheckCircle, ArrowBack } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/core';
import { useRequestPhoneVerification, useVerifyPhoneNumber } from '../api/phoneVerification';
import { validatePhoneNumber, formatPhoneNumber } from '../utils';

interface PhoneVerificationFormData {
  phone_number: string;
  verification_code: string;
}

const PhoneVerification: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const requestVerificationMutation = useRequestPhoneVerification();
  const verifyPhoneNumberMutation = useVerifyPhoneNumber();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PhoneVerificationFormData>({
    defaultValues: {
      phone_number: '',
      verification_code: '',
    },
  });

  const steps = ['Enter Phone Number', 'Verify Code', 'Complete'];

  const handleRequestVerification = async (data: PhoneVerificationFormData) => {
    try {
      await requestVerificationMutation.mutateAsync({
        phone_number: data.phone_number,
      });
      setPhoneNumber(data.phone_number);
      setCurrentStep(1);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleVerifyCode = async (data: PhoneVerificationFormData) => {
    try {
      await verifyPhoneNumberMutation.mutateAsync({
        phone_number: phoneNumber,
        verification_code: data.verification_code,
      });
      setCurrentStep(2);
      
      // Redirect after success
      setTimeout(() => {
        const from = location.state?.from || '/users/profile';
        navigate(from);
      }, 2000);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleResendCode = () => {
    if (phoneNumber) {
      requestVerificationMutation.mutate({ phone_number: phoneNumber });
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setPhoneNumber('');
      reset();
    } else {
      const from = location.state?.from || '/users/profile';
      navigate(from);
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
                <Phone sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom>
                  Verify Phone Number
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Verify your phone number to enhance account security
                </Typography>
              </Box>

              <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {currentStep === 0 && (
                <Box component="form" onSubmit={handleSubmit(handleRequestVerification)}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      We'll send a verification code to your phone number via SMS.
                    </Typography>
                  </Alert>

                  <Controller
                    name="phone_number"
                    control={control}
                    rules={{
                      required: 'Phone number is required',
                      validate: (value) => 
                        validatePhoneNumber(value) || 'Please enter a valid phone number',
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Phone Number"
                        placeholder="+1 (555) 123-4567"
                        margin="normal"
                        error={!!errors.phone_number}
                        helperText={errors.phone_number?.message || 'Include country code (e.g., +1 for US)'}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                        autoFocus
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={requestVerificationMutation.isPending}
                    loadingText="Sending Code..."
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Send Verification Code
                  </Button>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      startIcon={<ArrowBack />}
                      onClick={handleBack}
                    >
                      Back to Profile
                    </Button>
                  </Box>
                </Box>
              )}

              {currentStep === 1 && (
                <Box component="form" onSubmit={handleSubmit(handleVerifyCode)}>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      We've sent a 6-digit verification code to{' '}
                      <strong>{formatPhoneNumber(phoneNumber)}</strong>
                    </Typography>
                  </Alert>

                  <Controller
                    name="verification_code"
                    control={control}
                    rules={{
                      required: 'Verification code is required',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Code must be 6 digits',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Verification Code"
                        placeholder="123456"
                        margin="normal"
                        error={!!errors.verification_code}
                        helperText={errors.verification_code?.message}
                        inputProps={{ 
                          maxLength: 6,
                          style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5rem' }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Sms />
                            </InputAdornment>
                          ),
                        }}
                        autoFocus
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    loading={verifyPhoneNumberMutation.isPending}
                    loadingText="Verifying..."
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Verify Phone Number
                  </Button>

                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Button
                      variant="text"
                      onClick={handleResendCode}
                      loading={requestVerificationMutation.isPending}
                      loadingText="Sending..."
                    >
                      Resend Code
                    </Button>
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="text"
                      startIcon={<ArrowBack />}
                      onClick={handleBack}
                    >
                      Change Phone Number
                    </Button>
                  </Box>
                </Box>
              )}

              {currentStep === 2 && (
                <Box sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom color="success.main">
                    Phone Number Verified!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Your phone number <strong>{formatPhoneNumber(phoneNumber)}</strong> has been successfully verified.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleBack}
                  >
                    Continue to Profile
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </Container>
  );
};

export default PhoneVerification;