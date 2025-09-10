import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Collapse,
  Paper,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  Error,
  Schedule,
  ExpandMore,
  ExpandLess,
  Refresh,
  Timeline,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkflowExecutions } from '../hooks/useWorkflowsApi';
import type { WorkflowExecution } from '../types';

interface WorkflowExecutionMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxExecutions?: number;
}

export const WorkflowExecutionMonitor: React.FC<WorkflowExecutionMonitorProps> = ({
  autoRefresh = true,
  refreshInterval = 5000,
  maxExecutions = 10,
}) => {
  const { data: executions = [], isLoading, refetch } = useWorkflowExecutions();
  const [expandedExecutions, setExpandedExecutions] = useState<string[]>([]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refetch]);

  const toggleExpanded = (executionId: string) => {
    setExpandedExecutions(prev =>
      prev.includes(executionId)
        ? prev.filter(id => id !== executionId)
        : [...prev, executionId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'running': return <PlayArrow color="info" />;
      case 'pending': return <Schedule color="warning" />;
      default: return <Schedule />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed': return 'error';
      case 'running': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const recentExecutions = executions.slice(0, maxExecutions);
  const runningExecutions = executions.filter(e => e.status === 'running');

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            <Timeline sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Executions
          </Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {runningExecutions.length > 0 && (
              <Chip
                label={`${runningExecutions.length} running`}
                color="info"
                size="small"
                icon={<PlayArrow />}
              />
            )}
            <IconButton size="small" onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Box>
        </Box>

        {isLoading ? (
          <Box display="flex" alignItems="center" gap={2}>
            <LinearProgress sx={{ flex: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Loading executions...
            </Typography>
          </Box>
        ) : recentExecutions.length === 0 ? (
          <Alert severity="info">
            No workflow executions found. Workflows will appear here when triggered.
          </Alert>
        ) : (
          <List disablePadding>
            <AnimatePresence>
              {recentExecutions.map((execution, index) => (
                <motion.div
                  key={execution.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: execution.status === 'running' ? 'action.hover' : 'background.paper',
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(execution.status)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {execution.workflow_name}
                          </Typography>
                          <Chip
                            label={execution.status_display}
                            color={getStatusColor(execution.status) as any}
                            size="small"
                          />
                          {execution.status === 'running' && (
                            <LinearProgress
                              sx={{ width: 60, height: 4, borderRadius: 2 }}
                              color="info"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Invitee: {execution.booking_invitee}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {execution.actions_executed} executed, {execution.actions_failed} failed
                            {execution.execution_time_seconds && 
                              ` • ${execution.execution_time_seconds}s`
                            }
                          </Typography>
                        </Box>
                      }
                    />
                    
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(execution.id)}
                    >
                      {expandedExecutions.includes(execution.id) ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  </ListItem>

                  <Collapse in={expandedExecutions.includes(execution.id)}>
                    <Paper sx={{ ml: 2, mr: 2, mb: 1, p: 2, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Execution Summary
                      </Typography>
                      
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {execution.execution_summary.summary}
                      </Typography>

                      <Box display="flex" gap={1} mb={2}>
                        <Chip
                          label={`${execution.execution_summary.successful_actions} successful`}
                          color="success"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${execution.execution_summary.failed_actions} failed`}
                          color="error"
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${execution.execution_summary.skipped_actions} skipped`}
                          color="warning"
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      {execution.error_message && (
                        <Alert severity="error" sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            {execution.error_message}
                          </Typography>
                        </Alert>
                      )}

                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        <Typography variant="caption" color="text.secondary">
                          Started: {execution.started_at 
                            ? new Date(execution.started_at).toLocaleString()
                            : 'Not started'
                          }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Completed: {execution.completed_at 
                            ? new Date(execution.completed_at).toLocaleString()
                            : 'Not completed'
                          }
                        </Typography>
                      </Box>
                    </Paper>
                  </Collapse>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        )}
      </CardContent>
    </Card>
  );
};