import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Security,
  Smartphone,
  QrCode,
  Delete,
  Add,
  Refresh,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { MFASetupDialog } from '../components';
import { 
  useMFADevices, 
  useDisableMFA, 
  useRegenerateBackupCodes 
} from '../api';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime } from '@/utils/formatters';

const MFASettings: React.FC = () => {
  const { user } = useAuthStore();
  const { data: mfaDevices = [], isLoading, refetch } = useMFADevices();
  
  const disableMFAMutation = useDisableMFA();
  const regenerateCodesMutation = useRegenerateBackupCodes();

  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [disableMFAOpen, setDisableMFAOpen] = useState(false);
  const [regenerateCodesOpen, setRegenerateCodesOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const disableMFAForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
  });

  const regenerateForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
  });

  const handleDisableMFA = async (data: { password: string }) => {
    try {
      await disableMFAMutation.mutateAsync(data.password);
      disableMFAForm.reset();
      setDisableMFAOpen(false);
      refetch();
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleRegenerateCodes = async (data: { password: string }) => {
    try {
      const result = await regenerateCodesMutation.mutateAsync(data.password);
      setBackupCodes(result.backup_codes || []);
      regenerateForm.reset();
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'totp':
        return <QrCode />;
      case 'sms':
        return <Smartphone />;
      default:
        return <Security />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading MFA settings..." />;
  }

  return (
    <>
      <PageHeader
        title="Multi-Factor Authentication"
        subtitle="Secure your account with an additional layer of protection"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Security', href: '/users/security' },
          { label: 'MFA Settings' },
        ]}
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
      />

      <Grid container spacing={3}>
        {/* MFA Status */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Security color="primary" />
                  <Typography variant="h6">MFA Status</Typography>
                  <Chip
                    label={user?.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                    color={user?.is_mfa_enabled ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {user?.is_mfa_enabled ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your account is protected with multi-factor authentication.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setRegenerateCodesOpen(true)}
                      >
                        Regenerate Backup Codes
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={() => setDisableMFAOpen(true)}
                      >
                        Disable MFA
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Your account is not protected with MFA. Enable it now for better security.
                      </Typography>
                    </Alert>
                    <Button
                      variant="contained"
                      onClick={() => setMfaSetupOpen(true)}
                      startIcon={<Add />}
                      fullWidth
                    >
                      Enable MFA
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* MFA Devices */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  MFA Devices ({mfaDevices.length})
                </Typography>

                {mfaDevices.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No MFA devices configured.
                  </Typography>
                ) : (
                  <List>
                    {mfaDevices.map((device) => (
                      <ListItem key={device.id} divider>
                        <ListItemIcon>
                          {getDeviceIcon(device.device_type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body1">
                                {device.name}
                              </Typography>
                              {device.is_primary && (
                                <Chip label="Primary" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block">
                                {device.device_type_display}
                              </Typography>
                              {device.last_used_at && (
                                <Typography variant="caption" display="block">
                                  Last used: {formatRelativeTime(device.last_used_at)}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton edge="end" color="error">
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* MFA Setup Dialog */}
      <MFASetupDialog
        open={mfaSetupOpen}
        onClose={() => setMfaSetupOpen(false)}
        onSuccess={() => {
          setMfaSetupOpen(false);
          refetch();
        }}
      />

      {/* Disable MFA Dialog */}
      <Dialog open={disableMFAOpen} onClose={() => setDisableMFAOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Disable Multi-Factor Authentication
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Disabling MFA will make your account less secure. Are you sure you want to continue?
          </Alert>
          <Controller
            name="password"
            control={disableMFAForm.control}
            rules={{ required: 'Password is required to disable MFA' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Confirm Password"
                type="password"
                margin="normal"
                error={!!disableMFAForm.formState.errors.password}
                helperText={disableMFAForm.formState.errors.password?.message}
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDisableMFAOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={disableMFAForm.handleSubmit(handleDisableMFA)}
            variant="contained"
            color="error"
            loading={disableMFAMutation.isPending}
            loadingText="Disabling..."
          >
            Disable MFA
          </Button>
        </DialogActions>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={regenerateCodesOpen} onClose={() => setRegenerateCodesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Regenerate Backup Codes</DialogTitle>
        <DialogContent>
          {backupCodes.length === 0 ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                This will invalidate your existing backup codes and generate new ones.
              </Alert>
              <Controller
                name="password"
                control={regenerateForm.control}
                rules={{ required: 'Password is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    margin="normal"
                    error={!!regenerateForm.formState.errors.password}
                    helperText={regenerateForm.formState.errors.password?.message}
                  />
                )}
              />
            </>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 2 }}>
                Your new backup codes have been generated. Save them in a secure location.
              </Alert>
              <Typography variant="subtitle2" gutterBottom>
                Your new backup codes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
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
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setRegenerateCodesOpen(false);
              setBackupCodes([]);
              regenerateForm.reset();
            }} 
            variant="outlined"
          >
            {backupCodes.length > 0 ? 'Close' : 'Cancel'}
          </Button>
          {backupCodes.length === 0 && (
            <Button
              onClick={regenerateForm.handleSubmit(handleRegenerateCodes)}
              variant="contained"
              loading={regenerateCodesMutation.isPending}
              loadingText="Generating..."
            >
              Generate New Codes
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MFASettings;