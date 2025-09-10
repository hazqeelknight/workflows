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
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Refresh,
  Security,
  Search,
  FilterList,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { usePermissions } from '../../api';

const PermissionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: permissions = [], isLoading, refetch } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Filter permissions based on search and category
  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = !searchTerm || 
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.codename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      permission.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || permission.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(permissions.map(p => p.category))).sort();

  // Group permissions by category
  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    const category = permission.category || 'general';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

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

  const handleDeletePermission = async (permissionId: string) => {
    if (window.confirm('Are you sure you want to delete this permission? This action cannot be undone.')) {
      // TODO: Implement delete permission API endpoint
      console.log('Delete permission:', permissionId);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading permissions..." />;
  }

  return (
    <>
      <PageHeader
        title="Permissions Management"
        subtitle="Manage system permissions and their categories"
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Administration', href: '/users/admin' },
          { label: 'Permissions Management' },
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
              onClick={() => navigate('/users/admin/permissions/create')}
            >
              Create Permission
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
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Security color="primary" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {permissions.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Permissions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Security color="info" />
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {categories.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Categories
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
                  Quick Filters
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      placeholder="Search permissions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Category Filter</InputLabel>
                      <Select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        label="Category Filter"
                        startAdornment={<FilterList />}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category.replace('_', ' ').toUpperCase()}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Permissions by Category */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                <Card key={category}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Security color="primary" />
                      <Typography variant="h6">
                        {category.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Chip
                        label={`${categoryPermissions.length} permissions`}
                        color={getCategoryColor(category) as any}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Permission Name</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Used in Roles</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {categoryPermissions.map((permission) => (
                            <TableRow key={permission.id} hover>
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
                              <TableCell>
                                <Typography variant="body2">
                                  {/* This would show how many roles use this permission */}
                                  - roles
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <Tooltip title="Edit Permission">
                                    <IconButton
                                      size="small"
                                      onClick={() => navigate(`/users/admin/permissions/${permission.id}/edit`)}
                                    >
                                      <Edit />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Delete Permission">
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => handleDeletePermission(permission.id)}
                                    >
                                      <Delete />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
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
          </Grid>
        </Grid>
      </motion.div>
    </>
  );
};

export default PermissionsManagement;