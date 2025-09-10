import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { 
  usePermission,
  useCreatePermission,
  useUpdatePermission
} from '../../api';
import { CreatePermissionData } from '../../types';

const PermissionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { permissionId } = useParams<{ permissionId: string }>();
  const isEditing = !!permissionId && permissionId !== 'create';

  const { data: permission, isLoading: permissionLoading } = usePermission(permissionId || '', { enabled: isEditing });
  const createPermissionMutation = useCreatePermission();
  const updatePermissionMutation = useUpdatePermission();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreatePermissionData>({
    defaultValues: {
      codename: '',
      name: '',
      description: '',
      category: 'general',
    },
  });

  // Update form when permission data loads
  React.useEffect(() => {
    if (permission && isEditing) {
      setValue('codename', permission.codename);
      setValue('name', permission.name);
      setValue('description', permission.description);
      setValue('category', permission.category);
    }
  }, [permission, isEditing, setValue]);

  const handleFormSubmit = async (data: CreatePermissionData | UpdatePermissionData) => {
    try {
      if (isEditing && permissionId) {
        await updatePermissionMutation.mutateAsync({ id: permissionId, data: data as any });
      } else {
        await createPermissionMutation.mutateAsync(data);
      }
      
      navigate('/users/admin/permissions');
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const categories = [
    { value: 'user_management', label: 'User Management' },
    { value: 'event_management', label: 'Event Management' },
    { value: 'administration', label: 'Administration' },
    { value: 'billing', label: 'Billing' },
    { value: 'reporting', label: 'Reporting' },
    { value: 'general', label: 'General' },
  ];

  if (permissionLoading && isEditing) {
    return <LoadingSpinner fullScreen message="Loading permission..." />;
  }

  return (
    <>
      <PageHeader
        title={isEditing ? `Edit Permission: ${permission?.name}` : 'Create New Permission'}
        subtitle={isEditing ? 'Modify permission details' : 'Define a new system permission'}
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Administration', href: '/users/admin' },
          { label: 'Permissions Management', href: '/users/admin/permissions' },
          { label: isEditing ? 'Edit Permission' : 'Create Permission' },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users/admin/permissions')}
          >
            Back to Permissions
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
          <Grid container spacing={3}>
            {/* Permission Details */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Security color="primary" />
                    <Typography variant="h6">
                      Permission Details
                    </Typography>
                  </Box>

                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="body2">
                      Permissions define specific actions that users can perform in the system. 
                      Choose a descriptive codename and clear description.
                    </Typography>
                  </Alert>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="codename"
                        control={control}
                        rules={{ 
                          required: 'Permission codename is required',
                          pattern: {
                            value: /^[a-z_]+$/,
                            message: 'Codename must contain only lowercase letters and underscores'
                          }
                        }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Permission Codename"
                            placeholder="can_manage_users"
                            error={!!errors.codename}
                            helperText={errors.codename?.message || 'Unique identifier (lowercase, underscores only)'}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="category"
                        control={control}
                        rules={{ required: 'Category is required' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select {...field} label="Category">
                              {categories.map((category) => (
                                <MenuItem key={category.value} value={category.value}>
                                  {category.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Permission name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Permission Name"
                            placeholder="Manage Users"
                            error={!!errors.name}
                            helperText={errors.name?.message || 'Human-readable permission name'}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        rules={{ required: 'Description is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            placeholder="Detailed description of what this permission allows users to do..."
                            error={!!errors.description}
                            helperText={errors.description?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Permission Preview */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Permission Preview
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Codename
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                        {control._formValues.codename || 'Not set'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Display Name
                      </Typography>
                      <Typography variant="body1">
                        {control._formValues.name || 'Not set'}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Chip
                        label={categories.find(c => c.value === control._formValues.category)?.label || 'General'}
                        color={getCategoryColor(control._formValues.category || 'general') as any}
                        size="small"
                      />
                    </Box>

                    {control._formValues.description && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body2">
                          {control._formValues.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users/admin/permissions')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isEditing ? updatePermissionMutation.isPending : createPermissionMutation.isPending}
                  loadingText={isEditing ? 'Updating...' : 'Creating...'}
                  startIcon={<Save />}
                >
                  {isEditing ? 'Update Permission' : 'Create Permission'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </>
  );
};

export default PermissionDetail;