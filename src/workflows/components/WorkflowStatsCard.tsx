import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Error,
  Schedule,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import type { Workflow } from '../types';

interface WorkflowStatsCardProps {
  workflow: Workflow;
  onClick?: () => void;
}

export const WorkflowStatsCard: React.FC<WorkflowStatsCardProps> = ({
  workflow,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (workflow.success_rate >= 90) return <TrendingUp color="success" />;
    if (workflow.success_rate >= 70) return <Info color="info" />;
    return <TrendingDown color="error" />;
  };

  const getSuccessRateColor = () => {
    if (workflow.success_rate >= 90) return 'success';
    if (workflow.success_rate >= 70) return 'warning';
    return 'error';
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        sx={{ 
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.2s',
          '&:hover': onClick ? {
            boxShadow: 4,
          } : {},
        }}
        onClick={onClick}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box flex={1}>
              <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
                {workflow.name}
              </Typography>
              
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Chip
                  label={workflow.trigger_display}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={workflow.is_active ? 'Active' : 'Inactive'}
                  color={workflow.is_active ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              {workflow.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {workflow.description.length > 100 
                    ? `${workflow.description.substring(0, 100)}...`
                    : workflow.description
                  }
                </Typography>
              )}
            </Box>
            
            <Tooltip title={`Success rate: ${workflow.success_rate}%`}>
              <Box display="flex" alignItems="center">
                {getTrendIcon()}
              </Box>
            </Tooltip>
          </Box>

          {/* Performance Metrics */}
          <Box sx={{ mb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                Success Rate
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {workflow.success_rate}%
              </Typography>
            </Box>
            
            <LinearProgress
              variant="determinate"
              value={workflow.success_rate}
              color={getSuccessRateColor() as any}
              sx={{ height: 6, borderRadius: 3, mb: 1 }}
            />
            
            <Typography variant="caption" color="text.secondary">
              {workflow.execution_stats.successful_executions} of {workflow.execution_stats.total_executions} executions successful
            </Typography>
          </Box>

          {/* Action Summary */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {workflow.actions.length} action{workflow.actions.length !== 1 ? 's' : ''}
            </Typography>
            
            <Typography variant="caption" color="text.secondary">
              {workflow.execution_stats.last_executed_at
                ? `Last: ${new Date(workflow.execution_stats.last_executed_at).toLocaleDateString()}`
                : 'Never executed'
              }
            </Typography>
          </Box>

          {/* Quick Action Indicators */}
          <Box display="flex" gap={0.5} mt={1}>
            {workflow.actions.filter(a => a.action_type === 'send_email').length > 0 && (
              <Tooltip title="Contains email actions">
                <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
            {workflow.actions.filter(a => a.action_type === 'send_sms').length > 0 && (
              <Tooltip title="Contains SMS actions">
                <Sms sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
            {workflow.actions.filter(a => a.action_type === 'webhook').length > 0 && (
              <Tooltip title="Contains webhook actions">
                <Webhook sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
            {workflow.actions.filter(a => a.action_type === 'update_booking').length > 0 && (
              <Tooltip title="Contains booking update actions">
                <Update sx={{ fontSize: 16, color: 'text.secondary' }} />
              </Tooltip>
            )}
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};