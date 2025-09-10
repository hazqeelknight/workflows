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
import { usePermissions } from '../api';

const PermissionsList: React.FC = () => {
  const { data: permissions = [], isLoading, refetch } = usePermissions();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'user_management':
        return 'primary';
      case 'event_management':
        return 'secondary';
      case 'administration':
        return 'error';
      case 'billing':
        return 'warning';
      case 'reporting':
        return 'info';
      default:
        return 'default';
    }
  };

  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading permissions..." />;
  }

  return (
    <>
      <PageHeader
        title="System Permissions"
        subtitle="View all available system permissions organized by category"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'System Permissions' },
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Security color="primary" />
                  <Typography variant="h6">
                    {category.replace('_', ' ').toUpperCase()} ({categoryPermissions.length})
                  </Typography>
                  <Chip
                    label={category}
                    color={getCategoryColor(category) as any}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Permission</TableCell>
                        <TableCell>Code</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryPermissions.map((permission) => (
                        <TableRow key={permission.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {permission.name}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {permission.codename}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {permission.description}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          ))}
        </Box>
      </motion.div>
    </>
  );
};

export default PermissionsList;