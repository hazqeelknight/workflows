import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete, DeleteSweep, Refresh, DevicesOther } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { useUserSessions, useRevokeSession, useRevokeAllSessions } from '../api';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const ActiveSessions: React.FC = () => {
  const { data: sessions = [], isLoading, refetch } = useUserSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllSessionsMutation = useRevokeAllSessions();

  const [revokeAllDialogOpen, setRevokeAllDialogOpen] = React.useState(false);

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const handleRevokeAllSessions = () => {
    revokeAllSessionsMutation.mutate();
    setRevokeAllDialogOpen(false);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading sessions..." />;
  }

  const activeSessions = sessions.filter(session => session.is_active);
  const currentSession = sessions.find(session => session.is_current);

  return (
    <>
      <PageHeader
        title="Active Sessions"
        subtitle="Manage your active login sessions across devices"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Security', href: '/users/security' },
          { label: 'Active Sessions' },
        ]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            {activeSessions.length > 1 && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweep />}
                onClick={() => setRevokeAllDialogOpen(true)}
              >
                Revoke All Others
              </Button>
            )}
          </Box>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <DevicesOther color="primary" />
              <Typography variant="h6">
                Active Sessions ({activeSessions.length})
              </Typography>
            </Box>

            {activeSessions.length === 0 ? (
              <Alert severity="info">
                No active sessions found.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Location</TableCell>
                      <TableCell>Device</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Last Activity</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {session.location || 'Unknown'}
                            </Typography>
                            {session.is_current && (
                              <Chip
                                label="Current"
                                color="primary"
                                size="small"
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {session.device_info?.browser || 'Unknown'} on{' '}
                            {session.device_info?.os || 'Unknown'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {session.device_info?.device || 'Unknown Device'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {session.ip_address}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeTime(session.last_activity)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(session.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {!session.is_current && (
                            <Tooltip title="Revoke Session">
                              <IconButton
                                color="error"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Revoke All Sessions Dialog */}
      <Dialog
        open={revokeAllDialogOpen}
        onClose={() => setRevokeAllDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Revoke All Other Sessions</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will log you out of all other devices and browsers. Your current session will remain active.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to revoke all other active sessions?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => setRevokeAllDialogOpen(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleRevokeAllSessions}
            variant="contained"
            color="error"
            loading={revokeAllSessionsMutation.isPending}
            loadingText="Revoking..."
          >
            Revoke All Others
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActiveSessions;