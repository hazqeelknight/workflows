import React, { useEffect, useState } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CheckCircle, Error, Email } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/core';
import { useUserAuth } from '../hooks';
import { useVerifyEmail, useResendVerification } from '../api';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  
  const { logout } = useUserAuth();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(
        { token },
        {
          onSuccess: () => {
            setVerificationStatus('success');
            setTimeout(() => {
              navigate('/dashboard');
            }, 3000);
          },
          onError: () => {
            setVerificationStatus('error');
          },
        }
      );
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  const handleResendVerification = () => {
    if (email) {
      resendVerificationMutation.mutate({ email });
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
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              {verificationStatus === 'pending' && (
                <Box>
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h5" gutterBottom>
                    Verifying Your Email
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Please wait while we verify your email address...
                  </Typography>
                </Box>
              )}

              {verificationStatus === 'success' && (
                <Box>
                  <CheckCircle
                    sx={{ fontSize: 60, color: 'success.main', mb: 3 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Email Verified Successfully!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Your email has been verified. You'll be redirected to your dashboard shortly.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              )}

              {verificationStatus === 'error' && (
                <Box>
                  <Error
                    sx={{ fontSize: 60, color: 'error.main', mb: 3 }}
                  />
                  <Typography variant="h5" gutterBottom>
                    Verification Failed
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    The verification link is invalid or has expired.
                  </Typography>
                  
                  <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                    <Typography variant="body2">
                      If you need a new verification email, enter your email address below:
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleResendVerification}
                      loading={resendVerificationMutation.isPending}
                      disabled={!email}
                      startIcon={<Email />}
                    >
                      Resend
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
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

export default VerifyEmail;