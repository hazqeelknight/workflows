import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
} from '@mui/material';
import { QrCode, Smartphone, Security } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/core';
import { useAuthStore } from '@/store/authStore';
import { useSetupMFA, useVerifyMFASetup, useResendSMSOTP } from '../api';
import { MFASetupData, MFAVerificationData } from '../types';
import { validatePhoneNumber } from '../utils';

interface MFASetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (backupCodes?: string[]) => void;
}

export const MFASetupDialog: React.FC<MFASetupDialogProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [setupResponse, setSetupResponse] = useState<any>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMutation = useSetupMFA();
  const verifyMutation = useVerifyMFASetup();
  const resendSMSMutation = useResendSMSOTP();

  const setupForm = useForm<MFASetupData>({
    defaultValues: {
      device_type: 'totp',
      device_name: '',
      phone_number: '',
    },
  });

  const verifyForm = useForm<MFAVerificationData>({
    defaultValues: {
      otp_code: '',
    },
  });

  const steps = ['Choose Method', 'Setup Device', 'Verify & Complete'];

  const handleSetup = async (data: MFASetupData) => {
    try {
      const response = await setupMutation.mutateAsync(data);
      setSetupResponse(response);
      setActiveStep(1);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleVerify = async (data: MFAVerificationData) => {
    try {
      const response = await verifyMutation.mutateAsync(data);
      if (response.backup_codes) {
        setBackupCodes(response.backup_codes);
      }
      setActiveStep(2);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleComplete = () => {
    onSuccess(backupCodes);
    handleClose();
  };

  const handleClose = () => {
    setActiveStep(0);
    setSetupResponse(null);
    setBackupCodes([]);
    setupForm.reset();
    verifyForm.reset();
    onClose();
  };

  const deviceType = setupForm.watch('device_type');

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Security />
          Enable Multi-Factor Authentication
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box component="form" onSubmit={setupForm.handleSubmit(handleSetup)}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Choose your preferred multi-factor authentication method:
            </Typography>

            <Controller
              name="device_type"
              control={setupForm.control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Authentication Method</InputLabel>
                  <Select {...field} label="Authentication Method">
                    <MenuItem value="totp">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QrCode />
                        Authenticator App (Recommended)
                      </Box>
                    </MenuItem>
                    <MenuItem value="sms">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Smartphone />
                        SMS Text Message
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="device_name"
              control={setupForm.control}
              rules={{ required: 'Device name is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Device Name"
                  placeholder={deviceType === 'totp' ? 'My Authenticator App' : 'My Phone'}
                  sx={{ mb: 2 }}
                  error={!!setupForm.formState.errors.device_name}
                  helperText={setupForm.formState.errors.device_name?.message}
                />
              )}
            />

            {deviceType === 'sms' && (
              <Controller
                name="phone_number"
                control={setupForm.control}
                rules={{
                  required: 'Phone number is required for SMS',
                  validate: (value) => 
                    validatePhoneNumber(value || '') || 'Invalid phone number format'
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Phone Number"
                    placeholder="+1 (555) 123-4567"
                    error={!!setupForm.formState.errors.phone_number}
                    helperText={setupForm.formState.errors.phone_number?.message}
                  />
                )}
              />
            )}
          </Box>
        )}

        {activeStep === 1 && setupResponse && (
          <Box>
            {deviceType === 'totp' && setupResponse.qr_code && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Scan QR Code
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <img 
                    src={setupResponse.qr_code} 
                    alt="MFA QR Code" 
                    style={{ maxWidth: '200px', height: 'auto' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Manual Entry Key:</strong> {setupResponse.manual_entry_key}
                  </Typography>
                </Alert>
              </Box>
            )}

            {deviceType === 'sms' && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  SMS Verification
                </Typography>
                {!user?.is_phone_verified && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Note: Your phone number is not verified. You may want to verify it first for better security.
                    </Typography>
                  </Alert>
                )}
                <Typography variant="body1" sx={{ mb: 2 }}>
                  We've sent a verification code to {setupResponse.phone_number}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => resendSMSMutation.mutate()}
                  loading={resendSMSMutation.isPending}
                  sx={{ mb: 2 }}
                >
                  Resend Code
                </Button>
              </Box>
            )}

            <Box component="form" onSubmit={verifyForm.handleSubmit(handleVerify)}>
              <Controller
                name="otp_code"
                control={verifyForm.control}
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
                    inputProps={{ maxLength: 6 }}
                    error={!!verifyForm.formState.errors.otp_code}
                    helperText={verifyForm.formState.errors.otp_code?.message}
                  />
                )}
              />
            </Box>
          </Box>
        )}

        {activeStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom color="success.main">
              MFA Enabled Successfully!
            </Typography>
            
            {backupCodes.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Save these backup codes in a safe place!
                  </Typography>
                  <Typography variant="body2">
                    You can use these codes to access your account if you lose your device.
                  </Typography>
                </Alert>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {backupCodes.map((code, index) => (
                    <Chip
                      key={index}
                      label={code}
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        {activeStep === 0 && (
          <>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={setupForm.handleSubmit(handleSetup)}
              variant="contained"
              loading={setupMutation.isPending}
              loadingText="Setting up..."
            >
              Continue
            </Button>
          </>
        )}

        {activeStep === 1 && (
          <>
            <Button onClick={handleClose} variant="outlined">
              Cancel
            </Button>
            <Button
              onClick={verifyForm.handleSubmit(handleVerify)}
              variant="contained"
              loading={verifyMutation.isPending}
              loadingText="Verifying..."
            >
              Verify & Enable
            </Button>
          </>
        )}

        {activeStep === 2 && (
          <Button onClick={handleComplete} variant="contained">
            Complete Setup
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};