import React, { useState } from 'react';
import {
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  AdminPanelSettings,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { useRoles } from '../../api';
import { formatDateTime } from '@/utils/formatters';

const RolesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: roles = [], isLoading, refetch } = useRoles();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);

  const handleDeleteRole = (role: any) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteRole = async () => {
    if (roleToDelete) {
      // TODO: Implement delete role API endpoint
      console.log('Delete role:', roleToDelete.id);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

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
        title="Roles Management"
        subtitle="Manage system roles and their permissions"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Administration', href: '/users/admin' },
          { label: 'Roles Management' },
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
              onClick={() => navigate('/users/admin/roles/create')}
            >
              Create Role
            </Button>
          </Box>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AdminPanelSettings color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {roles.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Roles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AdminPanelSettings color="warning" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {roles.filter(r => r.is_system_role).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      System Roles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AdminPanelSettings color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {roles.filter(r => r.parent).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Child Roles
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Roles Table */}
          <Grid item xs={12}>
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
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No roles found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Create your first role to start managing permissions.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => navigate('/users/admin/roles/create')}
                    >
                      Create First Role
                    </Button>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Role Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Parent Role</TableCell>
                          <TableCell>Permissions</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {roles.map((role) => (
                          <TableRow key={role.id} hover>
                            <TableCell>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {role.name}
                                </Typography>
                                {role.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {role.description}
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={role.role_type.replace('_', ' ')}
                                color={getRoleTypeColor(role.role_type) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {role.parent_name ? (
                                <Chip
                                  label={role.parent_name}
                                  variant="outlined"
                                  size="small"
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Root Role
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {role.total_permissions} permissions
                              </Typography>
                              {role.children_count > 0 && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {role.children_count} child role(s)
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              {role.is_system_role && (
                                <Chip
                                  label="System"
                                  color="secondary"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" color="text.secondary">
                                {formatDateTime(role.created_at || new Date().toISOString())}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Edit Role">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/users/admin/roles/${role.id}/edit`)}
                                  >
                                    <Edit />
                                  </IconButton>
                                </Tooltip>
                                {!role.is_system_role && (
                                  <Tooltip title="Delete Role">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeleteRole(role)}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Delete Role
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              This action cannot be undone. Deleting this role will remove it from all users who currently have it assigned.
            </Typography>
          </Alert>
          {roleToDelete && (
            <Typography variant="body1">
              Are you sure you want to delete the role <strong>"{roleToDelete.name}"</strong>?
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteRole}
            variant="contained"
            color="error"
            loading={false}
            loadingText="Deleting..."
          >
            Delete Role
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RolesManagement;