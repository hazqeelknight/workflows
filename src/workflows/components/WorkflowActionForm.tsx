import React, { useEffect, useState } from 'react';
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
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
} from '@mui/material';
import { ExpandMore, Code, Email, Sms, Webhook, Update } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/core';
import { ConditionBuilder } from './ConditionBuilder';
import { WebhookDataEditor } from './WebhookDataEditor';
import { BookingUpdateFieldsEditor } from './BookingUpdateFieldsEditor';
import type { WorkflowActionFormData, WorkflowAction } from '../types';
import { ACTION_TYPE_OPTIONS, RECIPIENT_OPTIONS } from '../types';

interface WorkflowActionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: WorkflowActionFormData) => void;
  action?: WorkflowAction;
  loading?: boolean;
  workflowId: string;
}

export const WorkflowActionForm: React.FC<WorkflowActionFormProps> = ({
  open,
  onClose,
  onSubmit,
  action,
  loading = false,
  workflowId,
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorkflowActionFormData>({
    defaultValues: {
      name: '',
      action_type: 'send_email',
      order: 1,
      recipient: 'invitee',
      custom_email: '',
      subject: '',
      message: '',
      webhook_url: '',
      webhook_data: {},
      conditions: [],
      update_booking_fields: {},
      is_active: true,
    },
  });

  const actionType = watch('action_type');
  const recipient = watch('recipient');

  useEffect(() => {
    if (action) {
      reset({
        name: action.name,
        action_type: action.action_type,
        order: action.order,
        recipient: action.recipient,
        custom_email: action.custom_email,
        subject: action.subject,
        message: action.message,
        webhook_url: action.webhook_url,
        webhook_data: action.webhook_data,
        conditions: action.conditions,
        update_booking_fields: action.update_booking_fields,
        is_active: action.is_active,
      });
    } else {
      reset({
        name: '',
        action_type: 'send_email',
        order: 1,
        recipient: 'invitee',
        custom_email: '',
        subject: '',
        message: '',
        webhook_url: '',
        webhook_data: {},
        conditions: [],
        update_booking_fields: {},
        is_active: true,
      });
    }
  }, [action, reset]);

  const handleFormSubmit = (data: WorkflowActionFormData) => {
    onSubmit(data);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_email': return <Email />;
      case 'send_sms': return <Sms />;
      case 'webhook': return <Webhook />;
      case 'update_booking': return <Update />;
      default: return <Code />;
    }
  };

  const getActionDescription = (type: string) => {
    switch (type) {
      case 'send_email':
        return 'Send an email notification to specified recipients';
      case 'send_sms':
        return 'Send an SMS message to specified recipients';
      case 'webhook':
        return 'Trigger a webhook to an external service';
      case 'update_booking':
        return 'Update booking fields automatically';
      default:
        return '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          {getActionIcon(actionType)}
          {action ? 'Edit Action' : 'Create New Action'}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" sx={{ mt: 1 }}>
          {/* Basic Configuration */}
          <Accordion 
            expanded={expandedSections.includes('basic')}
            onChange={() => toggleSection('basic')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Basic Configuration</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: 'Action name is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Action Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />

                <Controller
                  name="action_type"
                  control={control}
                  rules={{ required: 'Action type is required' }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.action_type}>
                      <InputLabel>Action Type</InputLabel>
                      <Select {...field} label="Action Type">
                        {ACTION_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            <Box display="flex" alignItems="center" gap={1}>
                              {getActionIcon(option.value)}
                              <Box>
                                <Typography variant="body2">{option.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {getActionDescription(option.value)}
                                </Typography>
                              </Box>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="order"
                  control={control}
                  rules={{
                    required: 'Order is required',
                    min: { value: 1, message: 'Order must be at least 1' },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Execution Order"
                      type="number"
                      error={!!errors.order}
                      helperText={errors.order?.message || 'Actions are executed in ascending order'}
                      inputProps={{ min: 1 }}
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
                    />
                  )}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Recipient Configuration */}
          {(actionType === 'send_email' || actionType === 'send_sms') && (
            <Accordion 
              expanded={expandedSections.includes('recipient')}
              onChange={() => toggleSection('recipient')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Recipient Configuration</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name="recipient"
                    control={control}
                    rules={{ required: 'Recipient is required' }}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.recipient}>
                        <InputLabel>Recipient</InputLabel>
                        <Select {...field} label="Recipient">
                          {RECIPIENT_OPTIONS.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  />

                  {recipient === 'custom' && (
                    <Controller
                      name="custom_email"
                      control={control}
                      rules={{
                        required: recipient === 'custom' ? 'Custom email is required' : false,
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: 'Please enter a valid email address',
                        },
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Custom Email Address"
                          type="email"
                          error={!!errors.custom_email}
                          helperText={errors.custom_email?.message}
                        />
                      )}
                    />
                  )}
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Email/SMS Content */}
          {(actionType === 'send_email' || actionType === 'send_sms') && (
            <Accordion 
              expanded={expandedSections.includes('content')}
              onChange={() => toggleSection('content')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">
                  {actionType === 'send_email' ? 'Email Content' : 'SMS Content'}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {actionType === 'send_email' && (
                    <Controller
                      name="subject"
                      control={control}
                      rules={{ required: 'Subject is required for email actions' }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          label="Email Subject"
                          error={!!errors.subject}
                          helperText={errors.subject?.message}
                        />
                      )}
                    />
                  )}

                  <Controller
                    name="message"
                    control={control}
                    rules={{ required: 'Message is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={actionType === 'send_email' ? 'Email Message' : 'SMS Message'}
                        multiline
                        rows={6}
                        error={!!errors.message}
                        helperText={errors.message?.message}
                      />
                    )}
                  />

                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Available Variables:</strong> {{`{{invitee_name}}`}}, {{`{{organizer_name}}`}}, {{`{{event_type_name}}`}}, {{`{{start_time}}`}}, {{`{{meeting_link}}`}}, {{`{{custom_field_name}}`}}
                    </Typography>
                  </Alert>
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Webhook Configuration */}
          {actionType === 'webhook' && (
            <Accordion 
              expanded={expandedSections.includes('webhook')}
              onChange={() => toggleSection('webhook')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Webhook Configuration</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Controller
                    name="webhook_url"
                    control={control}
                    rules={{
                      required: 'Webhook URL is required',
                      pattern: {
                        value: /^https?:\/\/.+/,
                        message: 'Please enter a valid HTTP/HTTPS URL',
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="Webhook URL"
                        type="url"
                        error={!!errors.webhook_url}
                        helperText={errors.webhook_url?.message}
                      />
                    )}
                  />

                  <WebhookDataEditor
                    value={watch('webhook_data')}
                    onChange={(data) => setValue('webhook_data', data)}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Booking Update Configuration */}
          {actionType === 'update_booking' && (
            <Accordion 
              expanded={expandedSections.includes('booking_update')}
              onChange={() => toggleSection('booking_update')}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Booking Update Configuration</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <BookingUpdateFieldsEditor
                  value={watch('update_booking_fields')}
                  onChange={(fields) => setValue('update_booking_fields', fields)}
                />
              </AccordionDetails>
            </Accordion>
          )}

          {/* Conditions */}
          <Accordion 
            expanded={expandedSections.includes('conditions')}
            onChange={() => toggleSection('conditions')}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Conditions (Optional)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Add conditions to control when this action should execute. If no conditions are set, the action will always execute.
                </Typography>
              </Box>
              
              <ConditionBuilder
                value={watch('conditions')}
                onChange={(conditions) => setValue('conditions', conditions)}
              />
            </AccordionDetails>
          </Accordion>
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
          {action ? 'Update Action' : 'Create Action'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};