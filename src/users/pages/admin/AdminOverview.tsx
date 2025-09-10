import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import {
  AdminPanelSettings,
  Security,
  Group,
  ArrowForward,
  Settings,
  People,
  VpnKey,
  Add,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button } from '@/components/core';
import { useRoles, usePermissions } from '../../api';
import { useAuthStore } from '@/store/authStore';

const AdminOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: roles = [] } = useRoles();
  const { data: permissions = [] } = usePermissions();

  const adminActions = [
    {
      title: 'Roles Management',
      description: 'Create, edit, and manage system roles',
      path: '/users/admin/roles',
      icon: AdminPanelSettings,
      count: roles.length,
      countLabel: 'roles',
    },
    {
      title: 'Permissions Management',
      description: 'Manage system permissions and categories',
      path: '/users/admin/permissions',
      icon: Security,
      count: permissions.length,
      countLabel: 'permissions',
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and assignments',
      path: '/users/admin/users',
      icon: People,
      count: 0, // This would come from a users count API
      countLabel: 'users',
    },
    {
      title: 'SSO Configuration',
      description: 'Configure SAML and OIDC providers',
      path: '/users/admin/sso',
      icon: VpnKey,
      count: 0, // This would come from SSO configs count
      countLabel: 'providers',
    },
  ];

  const stats = [
    {
      title: 'Total Roles',
      value: roles.length,
      subtitle: `${roles.filter(r => r.is_system_role).length} system roles`,
      icon: AdminPanelSettings,
      color: 'primary.main',
    },
    {
      title: 'Total Permissions',
      value: permissions.length,
      subtitle: `${new Set(permissions.map(p => p.category)).size} categories`,
      icon: Security,
      color: 'secondary.main',
    },
    {
      title: 'Your Roles',
      value: user?.roles?.length || 0,
      subtitle: 'Assigned to you',
      icon: Group,
      color: 'info.main',
    },
  ];

  return (
    <>
      <PageHeader
        title="Administration"
        subtitle="Manage roles, permissions, and system configuration"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Administration' },
        ]}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Grid container spacing={3}>
          {/* Stats Cards */}
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={stat.title}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography color="text.secondary" gutterBottom variant="overline">
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.subtitle}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          backgroundColor: stat.color,
                          borderRadius: 2,
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <stat.icon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}

          {/* Admin Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Administrative Actions
                </Typography>
                
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    You have administrative privileges. Use these tools to manage the system's role-based access control.
                  </Typography>
                </Alert>

                <List>
                  {adminActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ListItem
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <action.icon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {action.title}
                              </Typography>
                              <Chip
                                label={`${action.count} ${action.countLabel}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          }
                          secondary={action.description}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            onClick={() => navigate(action.path)}
                            color="primary"
                          >
                            <ArrowForward />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </motion.div>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/users/admin/roles/create')}
                  >
                    Create New Role
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    onClick={() => navigate('/users/admin/permissions/create')}
                  >
                    Create Permission
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Settings />}
                    onClick={() => navigate('/users/admin/sso')}
                  >
                    SSO Configuration
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </>
  );
};

export default AdminOverview;