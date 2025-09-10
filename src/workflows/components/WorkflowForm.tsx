import React, { useEffect } from 'react';
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
  FormControlLabel,
  Switch,
  Box,
  Chip,
  OutlinedInput,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/core';
import { useEventTypes } from '@/events/hooks';
import type { WorkflowFormData, Workflow } from '../types';
import { TRIGGER_OPTIONS } from '../types';

interface WorkflowFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowFormData) => void;
  workflow?: Workflow;
  loading?: boolean;
}

export const WorkflowForm: React.FC<WorkflowFormProps> = ({
  open,
  onClose,
  onSubmit,
  workflow,
  loading = false,
}) => {
  const { data: eventTypes = [] } = useEventTypes();
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<WorkflowFormData>({
    defaultValues: {
      name: '',
      description: '',
      trigger: 'booking_created',
      event_types: [],
      delay_minutes: 0,
      is_active: true,
    },
  });

  const trigger = watch('trigger');

  useEffect(() => {
    if (workflow) {
      reset({
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger,
        event_types: [], // Will be populated from backend if needed
        delay_minutes: workflow.delay_minutes,
        is_active: workflow.is_active,
      });
    } else {
      reset({
        name: '',
        description: '',
        trigger: 'booking_created',
        event_types: [],
        delay_minutes: 0,
        is_active: true,
      });
    }
  }, [workflow, reset]);

  const handleFormSubmit = (data: WorkflowFormData) => {
    onSubmit(data);
  };

  const getDelayHelpText = () => {
    if (trigger === 'before_meeting' || trigger === 'after_meeting') {
      return 'Minutes before/after the meeting start time';
    }
    return 'Minutes to wait before executing actions (0 for immediate execution)';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {workflow ? 'Edit Workflow' : 'Create New Workflow'}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'Workflow name is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Workflow Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                margin="normal"
              />
            )}
          />

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
                margin="normal"
                helperText="Optional description of what this workflow does"
              />
            )}
          />

          <Controller
            name="trigger"
            control={control}
            rules={{ required: 'Trigger is required' }}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.trigger}>
                <InputLabel>Trigger Event</InputLabel>
                <Select {...field} label="Trigger Event">
                  {TRIGGER_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {errors.trigger && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {errors.trigger.message}
                  </Typography>
                )}
              </FormControl>
            )}
          />

          <Controller
            name="event_types"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth margin="normal">
                <InputLabel>Event Types (Optional)</InputLabel>
                <Select
                  {...field}
                  multiple
                  input={<OutlinedInput label="Event Types (Optional)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const eventType = eventTypes.find(et => et.id === value);
                        return (
                          <Chip
                            key={value}
                            label={eventType?.name || value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {eventTypes.map((eventType) => (
                    <MenuItem key={eventType.id} value={eventType.id}>
                      {eventType.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 2 }}>
                  Leave empty to apply to all event types
                </Typography>
              </FormControl>
            )}
          />

          <Controller
            name="delay_minutes"
            control={control}
            rules={{
              required: 'Delay is required',
              min: { value: 0, message: 'Delay cannot be negative' },
              max: { value: 10080, message: 'Delay cannot exceed 7 days (10080 minutes)' },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Delay (Minutes)"
                type="number"
                error={!!errors.delay_minutes}
                helperText={errors.delay_minutes?.message || getDelayHelpText()}
                margin="normal"
                inputProps={{ min: 0, max: 10080 }}
              />
            )}
          />

          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Active"
                sx={{ mt: 2 }}
              />
            )}
          />

          {trigger === 'before_meeting' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Before Meeting Workflows:</strong> Actions will be executed the specified number of minutes before the meeting starts.
                Use this for sending reminders or preparation instructions.
              </Typography>
            </Alert>
          )}

          {trigger === 'after_meeting' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>After Meeting Workflows:</strong> Actions will be executed the specified number of minutes after the meeting ends.
                Use this for follow-up emails, feedback requests, or next steps.
              </Typography>
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(handleFormSubmit)}
          variant="contained"
          loading={loading}
        >
          {workflow ? 'Update Workflow' : 'Create Workflow'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};