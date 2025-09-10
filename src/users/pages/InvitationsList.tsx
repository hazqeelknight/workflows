import React, { useState } from 'react';
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
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { CreateInvitationForm } from '../components';
import { useInvitations } from '../api';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const InvitationsList: React.FC = () => {
  const { data: invitations = [], isLoading, refetch } = useInvitations();
  const [createFormOpen, setCreateFormOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'declined':
        return 'error';
      case 'expired':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading invitations..." />;
  }

  return (
    <>
      <PageHeader
        title="Team Invitations"
        subtitle="Manage team member invitations and roles"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Team Invitations' },
        ]}
        actions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => refetch()}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateFormOpen(true)}
            >
              Send Invitation
            </Button>
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
            {invitations.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No invitations sent yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Start building your team by sending invitations to colleagues.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateFormOpen(true)}
                >
                  Send First Invitation
                </Button>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Sent</TableCell>
                      <TableCell>Expires</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {invitation.invited_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invitation.role_name}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={invitation.status}
                            color={getStatusColor(invitation.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeTime(invitation.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDateTime(invitation.expires_at)}
                          </Typography>
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

      <CreateInvitationForm
        open={createFormOpen}
        onClose={() => setCreateFormOpen(false)}
      />
    </>
  );
};

export default InvitationsList;