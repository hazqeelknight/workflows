import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Visibility,
  Search,
  FilterList,
  CheckCircle,
  Error,
  Schedule,
  PlayArrow,
  Stop,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner } from '@/components/core';
import { useWorkflowExecutions } from '../hooks/useWorkflowsApi';
import { WorkflowExecutionDetails } from '../components/WorkflowExecutionDetails';
import type { WorkflowExecution } from '../types';

const WorkflowExecutions: React.FC = () => {
  const { data: executions = [], isLoading } = useWorkflowExecutions();
  
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecution | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderBy, setOrderBy] = useState<keyof WorkflowExecution>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleViewDetails = (execution: WorkflowExecution) => {
    setSelectedExecution(execution);
    setDetailsDialogOpen(true);
  };

  const handleSort = (property: keyof WorkflowExecution) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle color="success" />;
      case 'failed': return <Error color="error" />;
      case 'running': return <PlayArrow color="info" />;
      case 'pending': return <Schedule color="warning" />;
      case 'cancelled': return <Stop color="disabled" />;
      default: return <Schedule />;
    }
  };

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

  const filteredExecutions = executions.filter(execution => {
    const matchesSearch = execution.workflow_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         execution.booking_invitee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || execution.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedExecutions = React.useMemo(() => {
    return [...filteredExecutions].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return order === 'asc' ? -1 : 1;
      if (bValue == null) return order === 'asc' ? 1 : -1;
      
      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [filteredExecutions, orderBy, order]);

  if (isLoading) {
    return <LoadingSpinner message="Loading workflow executions..." />;
  }

  return (
    <>
      <PageHeader
        title="Workflow Executions"
        subtitle="Monitor and analyze workflow execution history"
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search executions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 250 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="running">Running</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {filteredExecutions.length} execution{filteredExecutions.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Executions Table */}
      {filteredExecutions.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <PlayArrow sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || statusFilter ? 'No Executions Found' : 'No Executions Yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Workflow executions will appear here when workflows are triggered'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'workflow_name'}
                      direction={orderBy === 'workflow_name' ? order : 'asc'}
                      onClick={() => handleSort('workflow_name')}
                    >
                      Workflow
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Invitee</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'created_at'}
                      direction={orderBy === 'created_at' ? order : 'asc'}
                      onClick={() => handleSort('created_at')}
                    >
                      Started
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedExecutions.map((execution, index) => (
                  <motion.tr
                    key={execution.id}
                    component={TableRow}
                    hover
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {execution.workflow_name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {execution.booking_invitee}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(execution.status)}
                        label={execution.status_display}
                        color={getStatusColor(execution.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {execution.actions_executed} / {execution.actions_executed + execution.actions_failed} executed
                        </Typography>
                        {execution.actions_failed > 0 && (
                          <Typography variant="caption" color="error">
                            {execution.actions_failed} failed
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {execution.execution_time_seconds 
                          ? `${execution.execution_time_seconds}s`
                          : 'N/A'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(execution.created_at).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(execution)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Execution Details Dialog */}
      <WorkflowExecutionDetails
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedExecution(null);
        }}
        execution={selectedExecution}
      />
    </>
  );
};

export default WorkflowExecutions;