import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/core';
import { useRoles, useCreateInvitation } from '../api';
import { CreateInvitationData } from '../types';
import { validateEmail } from '../utils';

interface CreateInvitationFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateInvitationForm: React.FC<CreateInvitationFormProps> = ({
  open,
  onClose,
}) => {
  const { data: roles = [] } = useRoles();
  const createInvitationMutation = useCreateInvitation();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateInvitationData>({
    defaultValues: {
      invited_email: '',
      role: '',
      message: '',
    },
  });

  const handleFormSubmit = async (data: CreateInvitationData) => {
    try {
      await createInvitationMutation.mutateAsync(data);
      reset();
      onClose();
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Team Invitation</DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Controller
            name="invited_email"
            control={control}
            rules={{
              required: 'Email is required',
              validate: (value) => validateEmail(value) || 'Please enter a valid email address',
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email Address"
                type="email"
                margin="normal"
                error={!!errors.invited_email}
                helperText={errors.invited_email?.message}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            rules={{ required: 'Role is required' }}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.role}>
                <InputLabel>Role</InputLabel>
                <Select {...field} label="Role">
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </MenuItem>
                  ))}
                </Select>
                {errors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.role.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="message"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Personal Message (Optional)"
                multiline
                rows={3}
                margin="normal"
                placeholder="Add a personal message to the invitation..."
              />
            )}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          loading={createInvitationMutation.isPending}
          loadingText="Sending..."
        >
          Send Invitation
        </Button>
      </DialogActions>
    </Dialog>
  );
};