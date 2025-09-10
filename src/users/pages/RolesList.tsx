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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { Refresh, AdminPanelSettings, ExpandMore } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner } from '@/components/core';
import { useRoles } from '../api';

const RolesList: React.FC = () => {
  const { data: roles = [], isLoading, refetch } = useRoles();

  const getRoleTypeColor = (roleType: string) => {
    switch (roleType) {
      case 'admin':
        return 'error';
      case 'organizer':
        return 'primary';
      case 'team_member':
        return 'info';
      case 'billing_manager':
        return 'warning';
      case 'viewer':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading roles..." />;
  }

  return (
    <>
      <PageHeader
        title="Roles & Permissions"
        subtitle="View system roles and their associated permissions"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Roles & Permissions' },
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
              <AdminPanelSettings color="primary" />
              <Typography variant="h6">
                System Roles ({roles.length})
              </Typography>
            </Box>

            {roles.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No roles found.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {roles.map((role) => (
                  <Accordion key={role.id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {role.name}
                        </Typography>
                        <Chip
                          label={role.role_type.replace('_', ' ')}
                          color={getRoleTypeColor(role.role_type) as any}
                          size="small"
                        />
                        {role.is_system_role && (
                          <Chip
                            label="System"
                            variant="outlined"
                            size="small"
                          />
                        )}
                        <Typography variant="body2" color="text.secondary">
                          {role.total_permissions} permissions
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" gutterBottom>
                          {role.description}
                        </Typography>
                        {role.parent_name && (
                          <Typography variant="body2" color="text.secondary">
                            Inherits from: <strong>{role.parent_name}</strong>
                          </Typography>
                        )}
                        {role.children_count > 0 && (
                          <Typography variant="body2" color="text.secondary">
                            Has {role.children_count} child role(s)
                          </Typography>
                        )}
                      </Box>

                      <Typography variant="subtitle2" gutterBottom>
                        Permissions:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {role.role_permissions.map((permission) => (
                          <Chip
                            key={permission.id}
                            label={permission.name}
                            variant="outlined"
                            size="small"
                            title={permission.description}
                          />
                        ))}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default RolesList;