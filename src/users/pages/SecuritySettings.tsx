import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  ListItemIcon,
} from '@mui/material';
import {
  Security,
  Smartphone,
  Delete,
  Add,
  VpnKey,
  DevicesOther,
  Warning,
  Phone,
  Verified,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { MFASetupDialog } from '../components';
import { 
  useMFADevices, 
  useDisableMFA, 
  useRegenerateBackupCodes,
  useUserSessions,
  useRevokeSession,
  useRevokeAllSessions,
  useChangePassword,
} from '../api';
import { useAuthStore } from '@/store/authStore';
import { ChangePasswordData } from '../types';
import { validatePassword, formatPhoneNumber } from '../utils';
import { formatRelativeTime, formatDateTime } from '@/utils/formatters';

const SecuritySettings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: mfaDevices = [], isLoading: mfaLoading } = useMFADevices();
  const { data: sessions = [], isLoading: sessionsLoading } = useUserSessions();
  
  const disableMFAMutation = useDisableMFA();
  const regenerateCodesMutation = useRegenerateBackupCodes();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();
  const changePasswordMutation = useChangePassword();

  const [mfaSetupOpen, setMfaSetupOpen] = useState(false);
  const [disableMFAOpen, setDisableMFAOpen] = useState(false);
  const [regenerateCodesOpen, setRegenerateCodesOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const passwordForm = useForm<ChangePasswordData>({
    defaultValues: {
      old_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  const disableMFAForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
  });

  const regenerateForm = useForm<{ password: string }>({
    defaultValues: { password: '' },
  });

  const handleChangePassword = async (data: ChangePasswordData) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      passwordForm.reset();
      setChangePasswordOpen(false);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleDisableMFA = async (data: { password: string }) => {
    try {
      await disableMFAMutation.mutateAsync(data.password);
      disableMFAForm.reset();
      setDisableMFAOpen(false);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleRegenerateCodes = async (data: { password: string }) => {
    try {
      const result = await regenerateCodesMutation.mutateAsync(data.password);
      setBackupCodes(result.backup_codes || []);
      regenerateForm.reset();
      setRegenerateCodesOpen(false);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  if (mfaLoading || sessionsLoading) {
    return <LoadingSpinner fullScreen message="Loading security settings..." />;
  }

  return (
    <>
      <PageHeader
        title="Security Settings"
        subtitle="Manage your account security and active sessions"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Security Settings' },
        ]}
      />

      <Grid container spacing={3}>
        {/* Password Security */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <VpnKey color="primary" />
                  <Typography variant="h6">Password Security</Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Last changed: {user?.password_changed_at ? formatRelativeTime(user.password_changed_at) : 'Never'}
                  </Typography>
                  {user?.password_expires_at && (
                    <Typography variant="body2" color="warning.main">
                      Expires: {formatDateTime(user.password_expires_at)}
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="outlined"
                  onClick={() => setChangePasswordOpen(true)}
                  fullWidth
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Phone Verification */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Phone color="primary" />
                  <Typography variant="h6">Phone Verification</Typography>
                  <Chip
                    label={user?.is_phone_verified ? 'Verified' : 'Unverified'}
                    color={user?.is_phone_verified ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {user?.is_phone_verified ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Your phone number is verified and can be used for SMS notifications and MFA.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {user.profile?.phone ? formatPhoneNumber(user.profile.phone) : 'Not set'}
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Verify your phone number to enable SMS notifications and SMS-based MFA.
                      </Typography>
                    </Alert>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/users/verify-phone', { state: { from: '/users/security' } })}
                      onClick={() => navigate('/verify-phone', { state: { from: '/users/security' } })}
                      startIcon={<Phone />}
                      fullWidth
                      disabled={!user?.profile?.phone}
                    >
                      {user?.profile?.phone ? 'Verify Phone Number' : 'Add Phone Number First'}
                    </Button>
                    {!user?.profile?.phone && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Add a phone number in your profile settings first
                      </Typography>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Multi-Factor Authentication */}
        <Grid item xs={12} md={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Security color="primary" />
                  <Typography variant="h6">Multi-Factor Authentication</Typography>
                  <Chip
                    label={user?.is_mfa_enabled ? 'Enabled' : 'Disabled'}
                    color={user?.is_mfa_enabled ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>

                {user?.is_mfa_enabled ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {mfaDevices.length} device(s) configured
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
                        Enable MFA to add an extra layer of security to your account.
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

        {/* Active Sessions */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DevicesOther color="primary" />
                    <Typography variant="h6">Active Sessions</Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => revokeAllSessionsMutation.mutate()}
                    loading={revokeAllSessionsMutation.isPending}
                  >
                    Revoke All Others
                  </Button>
                </Box>

                <List>
                  {sessions.map((session) => (
                    <ListItem key={session.id} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">
                              {session.location || session.ip_address}
                            </Typography>
                            {session.is_current && (
                              <Chip label="Current" color="primary" size="small" />
                            )}
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Last active: {formatRelativeTime(session.last_activity)}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {session.device_info?.browser} on {session.device_info?.os}
                            </Typography>
                          </Box>
                        }
                      />
                      {!session.is_current && (
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => revokeSessionMutation.mutate(session.id)}
                            disabled={revokeSessionMutation.isPending}
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* MFA Setup Dialog */}
      <MFASetupDialog
        open={mfaSetupOpen}
        onClose={() => setMfaSetupOpen(false)}
        onSuccess={() => setMfaSetupOpen(false)}
      />

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <Controller
              name="old_password"
              control={passwordForm.control}
              rules={{ required: 'Current password is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Current Password"
                  type="password"
                  margin="normal"
                  error={!!passwordForm.formState.errors.old_password}
                  helperText={passwordForm.formState.errors.old_password?.message}
                />
              )}
            />

            <Controller
              name="new_password"
              control={passwordForm.control}
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
                  error={!!passwordForm.formState.errors.new_password}
                  helperText={passwordForm.formState.errors.new_password?.message}
                />
              )}
            />

            <Controller
              name="new_password_confirm"
              control={passwordForm.control}
              rules={{
                required: 'Please confirm your new password',
                validate: (value) =>
                  value === passwordForm.watch('new_password') || 'Passwords do not match',
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Confirm New Password"
                  type="password"
                  margin="normal"
                  error={!!passwordForm.formState.errors.new_password_confirm}
                  helperText={passwordForm.formState.errors.new_password_confirm?.message}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setChangePasswordOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={passwordForm.handleSubmit(handleChangePassword)}
            variant="contained"
            loading={changePasswordMutation.isPending}
            loadingText="Changing..."
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>

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
          
          {backupCodes.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Your new backup codes:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {backupCodes.map((code, index) => (
                  <Chip
                    key={index}
                    label={code}
                    variant="outlined"
                    sx={{ fontFamily: 'monospace' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setRegenerateCodesOpen(false)} variant="outlined">
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

export default SecuritySettings;