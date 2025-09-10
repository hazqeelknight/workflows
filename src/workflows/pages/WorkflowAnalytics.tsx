import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Speed,
  CheckCircle,
  Error,
  Schedule,
  AccountTree,
  Timeline,
  Warning,
  Info,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner } from '@/components/core';
import { useWorkflowPerformanceStats } from '../hooks/useWorkflowsApi';

const WorkflowAnalytics: React.FC = () => {
  const { data: stats, isLoading } = useWorkflowPerformanceStats();

  if (isLoading) {
    return <LoadingSpinner message="Loading workflow analytics..." />;
  }

  if (!stats) {
    return (
      <Alert severity="info">
        No analytics data available yet. Create and run some workflows to see performance metrics.
      </Alert>
    );
  }

  const performanceMetrics = [
    {
      title: 'Total Workflows',
      value: stats.total_workflows,
      subtitle: `${stats.active_workflows} active, ${stats.inactive_workflows} inactive`,
      icon: AccountTree,
      color: 'primary.main',
    },
    {
      title: 'Total Executions',
      value: stats.execution_stats_30_days.total_executions,
      subtitle: 'Last 30 days',
      icon: Timeline,
      color: 'info.main',
    },
    {
      title: 'Success Rate',
      value: `${stats.execution_stats_30_days.success_rate}%`,
      subtitle: `${stats.execution_stats_30_days.successful_executions} successful`,
      icon: CheckCircle,
      color: 'success.main',
    },
    {
      title: 'Failed Executions',
      value: stats.execution_stats_30_days.failed_executions,
      subtitle: 'Needs attention',
      icon: Error,
      color: 'error.main',
    },
  ];

  return (
    <>
      <PageHeader
        title="Workflow Analytics"
        subtitle="Analyze workflow performance and identify optimization opportunities"
      />

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {performanceMetrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={metric.title}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography color="text.secondary" gutterBottom variant="overline">
                        {metric.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {metric.value}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {metric.subtitle}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: metric.color,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <metric.icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Top Performing Workflows */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                Top Performing Workflows
              </Typography>
              
              {stats.top_performing_workflows.length === 0 ? (
                <Alert severity="info">
                  No workflow executions in the last 30 days
                </Alert>
              ) : (
                <Box>
                  {stats.top_performing_workflows.map((workflow, index) => (
                    <motion.div
                      key={workflow.workflow_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {workflow.workflow_name}
                          </Typography>
                          <Chip
                            label={`${workflow.success_rate}%`}
                            color={
                              workflow.success_rate >= 95 ? 'success' :
                              workflow.success_rate >= 80 ? 'warning' : 'error'
                            }
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.success_rate}
                          color={
                            workflow.success_rate >= 95 ? 'success' :
                            workflow.success_rate >= 80 ? 'warning' : 'error'
                          }
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {workflow.successful_executions}/{workflow.total_executions} executions
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {workflow.last_executed 
                              ? `Last: ${new Date(workflow.last_executed).toLocaleDateString()}`
                              : 'Never executed'
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Problematic Workflows */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                Workflows Needing Attention
              </Typography>
              
              {stats.problematic_workflows.length === 0 ? (
                <Alert severity="success">
                  <Typography variant="body2">
                    All workflows are performing well! No issues detected.
                  </Typography>
                </Alert>
              ) : (
                <Box>
                  {stats.problematic_workflows.map((workflow, index) => (
                    <motion.div
                      key={workflow.workflow_id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Box sx={{ mb: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {workflow.workflow_name}
                          </Typography>
                          <Chip
                            label={`${workflow.success_rate}% success`}
                            color="error"
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.success_rate}
                          color="error"
                          sx={{ height: 8, borderRadius: 4, mb: 1 }}
                        />
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            {workflow.successful_executions}/{workflow.total_executions} executions
                          </Typography>
                          <Typography variant="caption" color="error">
                            Needs review
                          </Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Execution Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                Execution Statistics (Last 30 Days)
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <CheckCircle sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.execution_stats_30_days.successful_executions}
                    </Typography>
                    <Typography variant="caption">
                      Successful Executions
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light', color: 'error.contrastText' }}>
                    <Error sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.execution_stats_30_days.failed_executions}
                    </Typography>
                    <Typography variant="caption">
                      Failed Executions
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Timeline sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.execution_stats_30_days.total_executions}
                    </Typography>
                    <Typography variant="caption">
                      Total Executions
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <TrendingUp sx={{ fontSize: 32, mb: 1 }} />
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {stats.execution_stats_30_days.success_rate}%
                    </Typography>
                    <Typography variant="caption">
                      Overall Success Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Performance Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
                Performance Insights
              </Typography>
              
              <List>
                {stats.execution_stats_30_days.success_rate >= 95 && (
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Excellent Performance"
                      secondary="Your workflows are performing exceptionally well with a 95%+ success rate."
                    />
                  </ListItem>
                )}
                
                {stats.execution_stats_30_days.success_rate < 80 && (
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Performance Needs Attention"
                      secondary="Consider reviewing failed workflows and optimizing configurations."
                    />
                  </ListItem>
                )}
                
                {stats.problematic_workflows.length > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${stats.problematic_workflows.length} Workflows Need Review`}
                      secondary="Some workflows have high failure rates and should be investigated."
                    />
                  </ListItem>
                )}
                
                {stats.active_workflows === 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary="No Active Workflows"
                      secondary="Create and activate workflows to start automating your scheduling processes."
                    />
                  </ListItem>
                )}
                
                {stats.execution_stats_30_days.total_executions === 0 && stats.active_workflows > 0 && (
                  <ListItem>
                    <ListItemIcon>
                      <Schedule color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary="No Recent Executions"
                      secondary="Your workflows haven't been triggered recently. Check your trigger configurations."
                    />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default WorkflowAnalytics;