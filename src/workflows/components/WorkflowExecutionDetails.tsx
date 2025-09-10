import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Schedule,
  ExpandMore,
  PlayArrow,
  Pause,
  Stop,
} from '@mui/icons-material';
import { Button } from '@/components/core';
import type { WorkflowExecution } from '../types';

interface WorkflowExecutionDetailsProps {
  open: boolean;
  onClose: () => void;
  execution: WorkflowExecution | null;
}

export const WorkflowExecutionDetails: React.FC<WorkflowExecutionDetailsProps> = ({
  open,
  onClose,
  execution,
}) => {
  if (!execution) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      case 'pending': return 'warning';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'failed': return <Error />;
      case 'running': return <PlayArrow />;
      case 'pending': return <Schedule />;
      case 'cancelled': return <Stop />;
      default: return <Pause />;
    }
  };

  const getActionStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'skipped_conditions': return 'warning';
      default: return 'default';
    }
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Execution Details</Typography>
          <Chip
            label={execution.status_display}
            color={getStatusColor(execution.status) as any}
            icon={getStatusIcon(execution.status)}
          />
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Execution Summary */}
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Execution Summary
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">Workflow</Typography>
                <Typography variant="body2">{execution.workflow_name}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Invitee</Typography>
                <Typography variant="body2">{execution.booking_invitee}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Started</Typography>
                <Typography variant="body2">
                  {execution.started_at 
                    ? new Date(execution.started_at).toLocaleString()
                    : 'Not started'
                  }
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Duration</Typography>
                <Typography variant="body2">
                  {execution.execution_time_seconds 
                    ? `${execution.execution_time_seconds}s`
                    : 'N/A'
                  }
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Execution Statistics */}
          <Box display="flex" gap={2} mb={3}>
            <Chip
              label={`${execution.actions_executed} Executed`}
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${execution.actions_failed} Failed`}
              color="error"
              variant="outlined"
            />
            <Chip
              label={`${execution.execution_summary.skipped_actions} Skipped`}
              color="warning"
              variant="outlined"
            />
          </Box>

          {/* Error Message */}
          {execution.error_message && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Execution Error:</strong> {execution.error_message}
              </Typography>
            </Alert>
          )}

          {/* Action Timeline */}
          <Typography variant="h6" gutterBottom>
            Action Execution Timeline
          </Typography>
          
          {execution.execution_log.length === 0 ? (
            <Alert severity="info">
              No execution log available for this workflow.
            </Alert>
          ) : (
            <Timeline>
              {execution.execution_log.map((logEntry, index) => (
                <TimelineItem key={index}>
                  <TimelineSeparator>
                    <TimelineDot color={getActionStatusColor(logEntry.status) as any}>
                      {getStatusIcon(logEntry.status)}
                    </TimelineDot>
                    {index < execution.execution_log.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  
                  <TimelineContent>
                    <Paper sx={{ p: 2, mb: 1 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography variant="subtitle2">
                          {logEntry.action_name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Chip
                            label={logEntry.action_type}
                            size="small"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {formatExecutionTime(logEntry.execution_time_ms)}
                          </Typography>
                        </Box>
                      </Box>

                      <Chip
                        label={logEntry.status.replace('_', ' ').toUpperCase()}
                        color={getActionStatusColor(logEntry.status) as any}
                        size="small"
                        sx={{ mb: 1 }}
                      />

                      {logEntry.message && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {logEntry.message}
                        </Typography>
                      )}

                      {logEntry.error && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          <Typography variant="body2">{logEntry.error}</Typography>
                        </Alert>
                      )}

                      {logEntry.result && (
                        <Accordion sx={{ mt: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="caption">View Result Details</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              component="pre"
                              sx={{
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                backgroundColor: 'background.default',
                                p: 1,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 200,
                              }}
                            >
                              {JSON.stringify(logEntry.result, null, 2)}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      {logEntry.conditions_evaluated && logEntry.conditions_evaluated.length > 0 && (
                        <Accordion sx={{ mt: 1 }}>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="caption">View Evaluated Conditions</Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box
                              component="pre"
                              sx={{
                                fontSize: '0.75rem',
                                fontFamily: 'monospace',
                                backgroundColor: 'background.default',
                                p: 1,
                                borderRadius: 1,
                                overflow: 'auto',
                                maxHeight: 200,
                              }}
                            >
                              {JSON.stringify(logEntry.conditions_evaluated, null, 2)}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        {new Date(logEntry.timestamp).toLocaleString()}
                      </Typography>
                    </Paper>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};