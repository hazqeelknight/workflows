import React from 'react';
import { Grid, Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { 
  Person, 
  Security, 
  Email, 
  Phone,
  Group,
  AdminPanelSettings,
  VerifiedUser 
} from '@mui/icons-material';
import { PageHeader, Button } from '@/components/core';
import { useAuthStore } from '@/store/authStore';
import { useUserSessions, useMFADevices, useInvitations } from '../api';
import { formatRelativeTime } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';

const UsersOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: sessions = [] } = useUserSessions();
  const { data: mfaDevices = [] } = useMFADevices();
  const { data: invitations = [] } = useInvitations();

  const stats = [
    {
      title: 'Account Status',
      value: user?.account_status === 'active' ? 'Active' : user?.account_status || 'Unknown',
      icon: Person,
      color: user?.account_status === 'active' ? 'success.main' : 'warning.main',
    },
    {
      title: 'Email Status',
      value: user?.is_email_verified ? 'Verified' : 'Unverified',
      icon: Email,
      color: user?.is_email_verified ? 'success.main' : 'error.main',
    },
    {
      title: 'Phone Status',
      value: user?.is_phone_verified ? 'Verified' : 'Unverified',
      icon: Phone,
      color: user?.is_phone_verified ? 'success.main' : 'warning.main',
    },
    {
      title: 'MFA Status',
      value: user?.is_mfa_enabled ? 'Enabled' : 'Disabled',
      icon: Security,
      color: user?.is_mfa_enabled ? 'success.main' : 'warning.main',
    },
  ];

  const quickActions = [
    {
      title: 'Profile Settings',
      description: 'Update your profile information and preferences',
      path: '/users/profile',
      icon: Person,
    },
    {
      title: 'Security Settings',
      description: 'Manage passwords, MFA, and active sessions',
      path: '/users/security',
      icon: Security,
    },
    {
      title: 'Team Management',
      description: 'Invite team members and manage roles',
      path: '/users/invitations',
      icon: Group,
    },
    {
      title: 'Audit Logs',
      description: 'View your account activity history',
      path: '/users/audit-logs',
      icon: AdminPanelSettings,
    },
  ];

  // Check if user has admin permissions
  const hasAdminPermissions = user?.roles.some(role =>
    role.role_permissions.some(permission => 
      permission.codename === 'can_manage_roles' || 
      permission.codename === 'can_view_admin'
    )
  );

  // Add admin action if user has permissions
  if (hasAdminPermissions) {
    quickActions.push({
      title: 'Administration',
      description: 'Manage roles, permissions, and system settings',
      path: '/users/admin',
      icon: AdminPanelSettings,
    });
  }

  return (
    <>
      <PageHeader
        title="Account Management"
        subtitle="Manage your account settings, security, and team"
      />

      {/* Account Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
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
                      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        {stat.value}
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
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={3} key={action.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
            >
              <Card hover>
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box
                    sx={{
                      backgroundColor: 'primary.main',
                      borderRadius: 2,
                      p: 2,
                      display: 'inline-flex',
                      mb: 2,
                    }}
                  >
                    <action.icon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {action.description}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(action.path)}
                  >
                    Manage
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Last Login</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.last_login ? formatRelativeTime(user.last_login) : 'Never'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Account Created</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.date_joined ? formatRelativeTime(user.date_joined) : 'Unknown'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Phone Verified</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.is_phone_verified ? 'Yes' : 'No'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Active Sessions</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sessions.filter(s => s.is_active).length}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Roles & Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Box key={role.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={role.name}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {role.total_permissions} permissions
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No roles assigned
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default UsersOverview;