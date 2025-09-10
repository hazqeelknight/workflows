import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { PlayArrow, Warning } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/core';
import { useBookings } from '@/events/hooks';
import type { WorkflowTestRequest } from '../types';

interface WorkflowTestDialogProps {
  open: boolean;
  onClose: () => void;
  onTest: (testData: WorkflowTestRequest) => void;
  workflowName: string;
  loading?: boolean;
}

export const WorkflowTestDialog: React.FC<WorkflowTestDialogProps> = ({
  open,
  onClose,
  onTest,
  workflowName,
  loading = false,
}) => {
  const { data: bookings = [] } = useBookings();
  
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<WorkflowTestRequest>({
    defaultValues: {
      test_type: 'mock_data',
      booking_id: '',
      live_test: false,
    },
  });

  const testType = watch('test_type');
  const liveTest = watch('live_test');

  const handleFormSubmit = (data: WorkflowTestRequest) => {
    onTest(data);
  };

  const getTestTypeDescription = (type: string) => {
    switch (type) {
      case 'mock_data':
        return 'Test with simulated booking data. No real actions will be performed.';
      case 'real_data':
        return 'Test with real booking data but in safe mode. No real emails/SMS will be sent.';
      case 'live_test':
        return 'Execute real actions with real booking data. Use with extreme caution!';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PlayArrow />
          Test Workflow: {workflowName}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          <Controller
            name="test_type"
            control={control}
            rules={{ required: 'Test type is required' }}
            render={({ field }) => (
              <FormControl fullWidth margin="normal" error={!!errors.test_type}>
                <InputLabel>Test Type</InputLabel>
                <Select {...field} label="Test Type">
                  <MenuItem value="mock_data">
                    <Box>
                      <Typography variant="body2">Mock Data</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Safe testing with simulated data
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="real_data">
                    <Box>
                      <Typography variant="body2">Real Data (Safe Mode)</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Test with real booking but no real actions
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="live_test">
                    <Box>
                      <Typography variant="body2">Live Test</Typography>
                      <Typography variant="caption" color="error">
                        Real actions will be executed!
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            )}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {getTestTypeDescription(testType)}
            </Typography>
          </Alert>

          {(testType === 'real_data' || testType === 'live_test') && (
            <Controller
              name="booking_id"
              control={control}
              rules={{ required: 'Booking is required for this test type' }}
              render={({ field }) => (
                <FormControl fullWidth margin="normal" error={!!errors.booking_id}>
                  <InputLabel>Select Booking</InputLabel>
                  <Select {...field} label="Select Booking">
                    {bookings.map((booking) => (
                      <MenuItem key={booking.id} value={booking.id}>
                        <Box>
                          <Typography variant="body2">
                            {booking.invitee_name} - {booking.event_type.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(booking.start_time).toLocaleDateString()} at{' '}
                            {new Date(booking.start_time).toLocaleTimeString()}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
          )}

          {testType === 'live_test' && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Warning />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Live Test Warning
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  This will execute real actions including sending actual emails, SMS messages, 
                  and triggering real webhooks. Only use this when you're certain the workflow is configured correctly.
                </Typography>
              </Alert>

              <Controller
                name="live_test"
                control={control}
                rules={{ 
                  validate: (value) => value || 'You must confirm to proceed with live testing'
                }}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Checkbox 
                        {...field} 
                        checked={field.value}
                        color={errors.live_test ? 'error' : 'primary'}
                      />
                    }
                    label="I understand this will execute real actions and confirm I want to proceed"
                  />
                )}
              />
              {errors.live_test && (
                <Typography variant="caption" color="error" sx={{ ml: 4 }}>
                  {errors.live_test.message}
                </Typography>
              )}
            </Box>
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
          color={testType === 'live_test' ? 'warning' : 'primary'}
          startIcon={<PlayArrow />}
        >
          {testType === 'live_test' ? 'Execute Live Test' : 'Run Test'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};