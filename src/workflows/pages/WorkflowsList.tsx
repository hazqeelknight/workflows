import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Checkbox,
  Toolbar,
  LinearProgress,
} from '@mui/material';
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  PlayArrow,
  BugReport,
  ContentCopy,
} from '@mui/icons-material';
import ScienceIcon from '@mui/icons-material/Science';
import AccountTree from '@mui/icons-material/AccountTree';
import { PageHeader, LoadingSpinner, Button } from '@/components/core';
import {
  useWorkflows,
  useDeleteWorkflow,
  useTestWorkflow,
  useValidateWorkflow,
  useDuplicateWorkflow,
  useBulkTestWorkflows,
} from '../hooks/useWorkflowsApi';
import { WorkflowForm } from '../components/WorkflowForm';
import { WorkflowTestDialog } from '../components/WorkflowTestDialog';
import { WorkflowValidationDialog } from '../components/WorkflowValidationDialog';
import { WorkflowTemplateSelector } from '../components/WorkflowTemplateSelector';
import type { Workflow, WorkflowValidationResponse } from '../types';

const WorkflowsList: React.FC = () => {
  const { data: workflows = [], isLoading } = useWorkflows();
  const deleteWorkflow = useDeleteWorkflow();
  const testWorkflow = useTestWorkflow();
  const validateWorkflow = useValidateWorkflow();
  const duplicateWorkflow = useDuplicateWorkflow();
  const bulkTestWorkflows = useBulkTestWorkflows();

  // Dialog states
  const [workflowFormOpen, setWorkflowFormOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Current workflow states
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [validationResult, setValidationResult] = useState<WorkflowValidationResponse | null>(null);

  // Menu and selection states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuWorkflow, setMenuWorkflow] = useState<Workflow | null>(null);
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);

  // Sorting state
  const [orderBy, setOrderBy] = useState<keyof Workflow>('created_at');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, workflow: Workflow) => {
    setAnchorEl(event.currentTarget);
    setMenuWorkflow(workflow);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuWorkflow(null);
  };

  const handleEdit = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setWorkflowFormOpen(true);
    handleMenuClose();
  };

  const handleTest = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setTestDialogOpen(true);
    handleMenuClose();
  };

  const handleValidate = async (workflow: Workflow) => {
    try {
      const result = await validateWorkflow.mutateAsync(workflow.id);
      setValidationResult(result);
      setSelectedWorkflow(workflow);
      setValidationDialogOpen(true);
    } catch {
      // handled by mutation
    }
    handleMenuClose();
  };

  const handleDuplicate = async (workflow: Workflow) => {
    try {
      await duplicateWorkflow.mutateAsync(workflow.id);
    } catch {
      // handled by mutation
    }
    handleMenuClose();
  };

  const handleDelete = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedWorkflow) {
      try {
        await deleteWorkflow.mutateAsync(selectedWorkflow.id);
        setDeleteDialogOpen(false);
        setSelectedWorkflow(null);
      } catch {
        // handled by mutation
      }
    }
  };

  const handleSort = (property: keyof Workflow) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAll = () => {
    if (selectedWorkflows.length === workflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(workflows.map((w) => w.id));
    }
  };

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflows((prev) =>
      prev.includes(workflowId) ? prev.filter((id) => id !== workflowId) : [...prev, workflowId]
    );
  };

  const handleBulkTest = async () => {
    if (selectedWorkflows.length === 0) return;
    try {
      await bulkTestWorkflows.mutateAsync({
        workflow_ids: selectedWorkflows,
        test_type: 'mock_data',
      });
      setSelectedWorkflows([]);
    } catch {
      // handled by mutation
    }
  };

  const sortedWorkflows = React.useMemo(() => {
    return [...workflows].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      if (order === 'asc') return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    });
  }, [workflows, orderBy, order]);

  if (isLoading) {
    return <LoadingSpinner message="Loading workflows..." />;
  }

  return (
    <>
      <PageHeader
        title="Workflows"
        subtitle="Manage your automated scheduling workflows"
        actions={
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setTemplateSelectorOpen(true)}
            >
              From Template
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedWorkflow(null);
                setWorkflowFormOpen(true);
              }}
            >
              Create Workflow
            </Button>
          </Box>
        }
      />

      {/* Bulk Actions Toolbar */}
      {selectedWorkflows.length > 0 && (
        <Toolbar
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            borderRadius: 1,
            mb: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            {selectedWorkflows.length} workflow
            {selectedWorkflows.length !== 1 ? 's' : ''} selected
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ScienceIcon />}
            onClick={handleBulkTest}
            loading={bulkTestWorkflows.isPending}
            sx={{
              color: 'inherit',
              borderColor: 'currentColor',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
            }}
          >
            Bulk Test
          </Button>
        </Toolbar>
      )}

      {workflows.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <AccountTree sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Workflows Created Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first workflow to automate your scheduling processes
              </Typography>
              <Box display="flex" gap={2} justifyContent="center">
                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  onClick={() => setTemplateSelectorOpen(true)}
                >
                  Use Template
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setWorkflowFormOpen(true)}
                >
                  Create from Scratch
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selectedWorkflows.length > 0 &&
                        selectedWorkflows.length < workflows.length
                      }
                      checked={
                        workflows.length > 0 &&
                        selectedWorkflows.length === workflows.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'name'}
                      direction={orderBy === 'name' ? order : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Name
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Trigger</TableCell>
                  <TableCell>Actions</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'success_rate'}
                      direction={orderBy === 'success_rate' ? order : 'asc'}
                      onClick={() => handleSort('success_rate')}
                    >
                      Success Rate
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'created_at'}
                      direction={orderBy === 'created_at' ? order : 'asc'}
                      onClick={() => handleSort('created_at')}
                    >
                      Created
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedWorkflows.map((workflow) => (
                  <TableRow
                    key={workflow.id}
                    hover
                    selected={selectedWorkflows.includes(workflow.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedWorkflows.includes(workflow.id)}
                        onChange={() => handleSelectWorkflow(workflow.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {workflow.name}
                        </Typography>
                        {workflow.description && (
                          <Typography variant="caption" color="text.secondary">
                            {workflow.description.length > 60
                              ? `${workflow.description.substring(0, 60)}...`
                              : workflow.description}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.trigger_display}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.actions.length} action
                        {workflow.actions.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.is_active ? 'Active' : 'Inactive'}
                        color={workflow.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {workflow.success_rate}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={workflow.success_rate}
                            color={
                              workflow.success_rate >= 90
                                ? 'success'
                                : workflow.success_rate >= 70
                                ? 'warning'
                                : 'error'
                            }
                            sx={{ width: 60, height: 4, borderRadius: 2 }}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {workflow.execution_stats.total_executions} executions
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(workflow.created_at).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => handleMenuOpen(e, workflow)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleEdit(menuWorkflow!)}>
          <Edit sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleTest(menuWorkflow!)}>
          <PlayArrow sx={{ mr: 1 }} />
          Test
        </MenuItem>
        <MenuItem onClick={() => handleValidate(menuWorkflow!)}>
          <BugReport sx={{ mr: 1 }} />
          Validate
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate(menuWorkflow!)}>
          <ContentCopy sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuWorkflow!)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Workflow Form Dialog */}
      <WorkflowForm
        open={workflowFormOpen}
        onClose={() => {
          setWorkflowFormOpen(false);
          setSelectedWorkflow(null);
        }}
        onSubmit={async () => {
          setWorkflowFormOpen(false);
          setSelectedWorkflow(null);
        }}
        workflow={selectedWorkflow || undefined}
      />

      {/* Test Dialog */}
      <WorkflowTestDialog
        open={testDialogOpen}
        onClose={() => {
          setTestDialogOpen(false);
          setSelectedWorkflow(null);
        }}
        onTest={async (testData) => {
          if (selectedWorkflow) {
            await testWorkflow.mutateAsync({ id: selectedWorkflow.id, testData });
            setTestDialogOpen(false);
            setSelectedWorkflow(null);
          }
        }}
        workflowName={selectedWorkflow?.name || ''}
        loading={testWorkflow.isPending}
      />

      {/* Validation Dialog */}
      <WorkflowValidationDialog
        open={validationDialogOpen}
        onClose={() => {
          setValidationDialogOpen(false);
          setValidationResult(null);
          setSelectedWorkflow(null);
        }}
        validation={validationResult}
        workflowName={selectedWorkflow?.name || ''}
      />

      {/* Template Selector */}
      <WorkflowTemplateSelector
        open={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSuccess={() => setTemplateSelectorOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Workflow</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedWorkflow?.name}"? This action cannot be undone.
          </Typography>
          {selectedWorkflow && selectedWorkflow.execution_stats.total_executions > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This workflow has {selectedWorkflow.execution_stats.total_executions} execution records
              that will also be deleted.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            loading={deleteWorkflow.isPending}
          >
            Delete Workflow
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default WorkflowsList;
