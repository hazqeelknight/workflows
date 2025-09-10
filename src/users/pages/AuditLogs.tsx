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
} from '@mui/material';
import { Refresh, Security } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner } from '@/components/core';
import { useAuditLogs } from '../api';
import { formatDateTime, formatRelativeTime } from '@/utils/formatters';

const AuditLogs: React.FC = () => {
  const { data: auditLogs = [], isLoading, refetch } = useAuditLogs();

  const getActionColor = (action: string) => {
    if (action.includes('login')) return 'info';
    if (action.includes('password')) return 'warning';
    if (action.includes('mfa')) return 'secondary';
    if (action.includes('failed') || action.includes('locked')) return 'error';
    return 'default';
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading audit logs..." />;
  }

  return (
    <>
      <PageHeader
        title="Audit Logs"
        subtitle="View your account activity history"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Audit Logs' },
        ]}
        actions={
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
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
              <Security color="primary" />
              <Typography variant="h6">
                Account Activity ({auditLogs.length} entries)
              </Typography>
            </Box>

            {auditLogs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No audit logs found.
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Action</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Chip
                            label={log.action_display}
                            color={getActionColor(log.action) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {log.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {log.ip_address || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatRelativeTime(log.created_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatDateTime(log.created_at)}
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
    </>
  );
};

export default AuditLogs;