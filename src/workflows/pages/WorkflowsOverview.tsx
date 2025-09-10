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
} from '@mui/material';
import {
  AccountTree,
  PlayArrow,
  CheckCircle,
  Error,
  TrendingUp,
  Speed,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PageHeader, LoadingSpinner, Button } from '@/components/core';
import { useWorkflows, useWorkflowPerformanceStats } from '../hooks/useWorkflowsApi';
import { WorkflowExecutionMonitor } from '../components/WorkflowExecutionMonitor';
import { WorkflowStatsCard } from '../components/WorkflowStatsCard';

const WorkflowsOverview: React.FC = () => {
  const navigate = useNavigate();
  const { data: workflows = [], isLoading: workflowsLoading } = useWorkflows();
  const { data: stats, isLoading: statsLoading } = useWorkflowPerformanceStats();

  if (workflowsLoading || statsLoading) {
    return <LoadingSpinner message="Loading workflows overview..." />;
  }

  const quickStats = [
    {
      title: 'Total Workflows',
      value: stats?.total_workflows || 0,
      icon: AccountTree,
      color: 'primary.main',
      description: `${stats?.active_workflows || 0} active`,
    },
    {
      title: 'Executions (30 days)',
      value: stats?.execution_stats_30_days.total_executions || 0,
      icon: PlayArrow,
      color: 'info.main',
      description: `${stats?.execution_stats_30_days.success_rate || 0}% success rate`,
    },
    {
      title: 'Successful Actions',
      value: stats?.execution_stats_30_days.successful_executions || 0,
      icon: CheckCircle,
      color: 'success.main',
      description: 'Last 30 days',
    },
    {
      title: 'Failed Actions',
      value: stats?.execution_stats_30_days.failed_executions || 0,
      icon: Error,
      color: 'error.main',
      description: 'Needs attention',
    },
  ];

  return (
    <>
      <PageHeader
        title="Workflows Overview"
        subtitle="Automate your scheduling processes with intelligent workflows"
        actions={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              onClick={() => navigate('/workflows/templates')}
            >
              Browse Templates
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/workflows/list')}
            >
              Manage Workflows
            </Button>
          </Box>
        }
      />

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={stat.title}>
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
                        {stat.title}
                      </Typography>
                      <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {stat.description}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        backgroundColor: stat.color,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <stat.icon sx={{ color: 'white', fontSize: 24 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Performance Overview */}
      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TrendingUp sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Top Performing Workflows
                </Typography>
                
                {stats.top_performing_workflows.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No workflow executions in the last 30 days
                  </Typography>
                ) : (
                  <Box>
                    {stats.top_performing_workflows.slice(0, 5).map((workflow, index) => (
                      <Box key={workflow.workflow_id} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {workflow.workflow_name}
                          </Typography>
                          <Chip
                            label={`${workflow.success_rate}%`}
                            color={workflow.success_rate >= 90 ? 'success' : workflow.success_rate >= 70 ? 'warning' : 'error'}
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.success_rate}
                          color={workflow.success_rate >= 90 ? 'success' : workflow.success_rate >= 70 ? 'warning' : 'error'}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {workflow.successful_executions}/{workflow.total_executions} executions
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Problematic Workflows
                </Typography>
                
                {stats.problematic_workflows.length === 0 ? (
                  <Alert severity="success">
                    <Typography variant="body2">
                      No problematic workflows detected. Great job!
                    </Typography>
                  </Alert>
                ) : (
                  <Box>
                    {stats.problematic_workflows.slice(0, 5).map((workflow) => (
                      <Box key={workflow.workflow_id} sx={{ mb: 2 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {workflow.workflow_name}
                          </Typography>
                          <Chip
                            label={`${workflow.success_rate}%`}
                            color="error"
                            size="small"
                          />
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={workflow.success_rate}
                          color="error"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {workflow.successful_executions}/{workflow.total_executions} executions
                        </Typography>
                      </Box>
                    ))}
                    
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/workflows/list')}
                      sx={{ mt: 2 }}
                    >
                      Review Workflows
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent Workflows */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Workflows
          </Typography>
          
          {workflows.length === 0 ? (
            <Box textAlign="center" py={4}>
              <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Workflows Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first workflow to automate your scheduling processes
              </Typography>
              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="outlined"
                  onClick={() => navigate('/workflows/templates')}
                >
                  Browse Templates
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate('/workflows/builder')}
                >
                  Create Workflow
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {workflows.slice(0, 6).map((workflow, index) => (
                <Grid item xs={12} md={6} lg={4} key={workflow.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <WorkflowStatsCard
                      workflow={workflow}
                      onClick={() => navigate(`/workflows/builder/${workflow.id}`)}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
              
              {workflows.length > 6 && (
                <Box textAlign="center" mt={2}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/workflows/list')}
                  >
                    View All {workflows.length} Workflows
                  </Button>
                </Box>
              )}
          )}
        </CardContent>
      </Card>

      {/* Recent Executions Monitor */}
      {workflows.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <WorkflowExecutionMonitor maxExecutions={5} />
        </Box>
      )}
    </>
  );
};

export default WorkflowsOverview;