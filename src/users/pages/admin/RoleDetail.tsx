import React, { useState } from 'react';
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
  FormControlLabel,
  Checkbox,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from '@mui/material';
import {
  Save,
  ArrowBack,
  ExpandMore,
  AdminPanelSettings,
  Security,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, Button, LoadingSpinner } from '@/components/core';
import { 
  useRole, 
  useCreateRole,
  useUpdateRole,
  useRoles, 
  usePermissions 
} from '../../api';
import { CreateRoleData } from '../../types';

const RoleDetail: React.FC = () => {
  const navigate = useNavigate();
  const { roleId } = useParams<{ roleId: string }>();
  const isEditing = !!roleId && roleId !== 'create';

  const { data: role, isLoading: roleLoading } = useRole(roleId || '', { enabled: isEditing });
  const { data: allRoles = [] } = useRoles();
  const { data: permissions = [] } = usePermissions();
  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateRoleData>({
    defaultValues: {
      name: '',
      role_type: 'team_member',
      description: '',
      parent: '',
      role_permissions: [],
    },
  });

  // Update form when role data loads
  React.useEffect(() => {
    if (role && isEditing) {
      setValue('name', role.name);
      setValue('role_type', role.role_type);
      setValue('description', role.description);
      setValue('parent', role.parent || '');
      
      const permissionIds = role.role_permissions.map(p => p.id);
      setValue('role_permissions', permissionIds);
      setSelectedPermissions(permissionIds);
    }
  }, [role, isEditing, setValue]);

  const handleFormSubmit = async (data: CreateRoleData | UpdateRoleData) => {
    try {
      const formData = {
        ...data,
        role_permissions: selectedPermissions,
        parent: data.parent || null,
      };

      if (isEditing && roleId) {
        await updateRoleMutation.mutateAsync({ id: roleId, data: formData as any });
      } else {
        await createRoleMutation.mutateAsync(formData);
      }
      
      navigate('/users/admin/roles');
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
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

  // Filter parent role options (exclude self and children)
  const availableParentRoles = allRoles.filter(r => 
    r.id !== roleId && !r.parent === roleId
  );

  if (roleLoading && isEditing) {
    return <LoadingSpinner fullScreen message="Loading role..." />;
  }

  return (
    <>
      <PageHeader
        title={isEditing ? `Edit Role: ${role?.name}` : 'Create New Role'}
        subtitle={isEditing ? 'Modify role settings and permissions' : 'Define a new role with specific permissions'}
        breadcrumbs={[
          { label: 'Account', href: '/users' },
          { label: 'Administration', href: '/users/admin' },
          { label: 'Roles Management', href: '/users/admin/roles' },
          { label: isEditing ? 'Edit Role' : 'Create Role' },
        ]}
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/users/admin/roles')}
          >
            Back to Roles
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
            {/* Basic Information */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  
                  {isEditing && role?.is_system_role && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      This is a system role. Some fields cannot be modified.
                    </Alert>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="name"
                        control={control}
                        rules={{ required: 'Role name is required' }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Role Name"
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            disabled={role?.is_system_role}
                          />
                        )}
                      />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Controller
                        name="role_type"
                        control={control}
                        rules={{ required: 'Role type is required' }}
                        render={({ field }) => (
                          <FormControl fullWidth error={!!errors.role_type}>
                            <InputLabel>Role Type</InputLabel>
                            <Select 
                              {...field} 
                              label="Role Type"
                              disabled={role?.is_system_role}
                            >
                              <MenuItem value="admin">Administrator</MenuItem>
                              <MenuItem value="organizer">Organizer</MenuItem>
                              <MenuItem value="team_member">Team Member</MenuItem>
                              <MenuItem value="billing_manager">Billing Manager</MenuItem>
                              <MenuItem value="viewer">Viewer</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Description"
                            multiline
                            rows={3}
                            placeholder="Describe what this role is for and what permissions it should have..."
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Controller
                        name="parent"
                        control={control}
                        render={({ field }) => (
                          <FormControl fullWidth>
                            <InputLabel>Parent Role (Optional)</InputLabel>
                            <Select {...field} label="Parent Role (Optional)">
                              <MenuItem value="">
                                <em>No Parent (Root Role)</em>
                              </MenuItem>
                              {availableParentRoles.map((parentRole) => (
                                <MenuItem key={parentRole.id} value={parentRole.id}>
                                  {parentRole.name} ({parentRole.role_type})
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Role Summary */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Role Summary
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Selected Permissions
                      </Typography>
                      <Typography variant="h4" color="primary.main">
                        {selectedPermissions.length}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Role Type
                      </Typography>
                      <Chip
                        label={watch('role_type')?.replace('_', ' ') || 'Not selected'}
                        color={getRoleTypeColor(watch('role_type') || '') as any}
                        size="small"
                      />
                    </Box>

                    {watch('parent') && (
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Inherits From
                        </Typography>
                        <Typography variant="body1">
                          {allRoles.find(r => r.id === watch('parent'))?.name}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Permissions Selection */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Permissions ({selectedPermissions.length} selected)
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Select the permissions this role should have. Users with this role will be able to perform these actions.
                  </Typography>

                  {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                    <Accordion key={category} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Security color="primary" />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {category.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Chip
                            label={`${categoryPermissions.filter(p => selectedPermissions.includes(p.id)).length}/${categoryPermissions.length}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Grid container spacing={1}>
                          {categoryPermissions.map((permission) => (
                            <Grid item xs={12} sm={6} md={4} key={permission.id}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedPermissions.includes(permission.id)}
                                    onChange={() => handlePermissionToggle(permission.id)}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {permission.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {permission.description}
                                    </Typography>
                                  </Box>
                                }
                                sx={{ alignItems: 'flex-start', m: 0 }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/users/admin/roles')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isEditing ? updateRoleMutation.isPending : createRoleMutation.isPending}
                  loadingText={isEditing ? 'Updating...' : 'Creating...'}
                  startIcon={<Save />}
                >
                  {isEditing ? 'Update Role' : 'Create Role'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
    </>
  );
};

export default RoleDetail;