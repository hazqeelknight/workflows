import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
} from '@mui/material';
import {
  Add,
  Edit,
  DragIndicator,
  Email,
  Sms,
  Webhook,
  Update,
  PlayArrow,
  BugReport,
  Save,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader, LoadingSpinner, Button } from '@/components/core';
import {
  useWorkflow,
  useCreateWorkflow,
  useUpdateWorkflow,
  useWorkflowActions,
  useTestWorkflow,
  useValidateWorkflow,
} from '../hooks/useWorkflowsApi';
import { WorkflowForm } from '../components/WorkflowForm';
import { WorkflowActionForm } from '../components/WorkflowActionForm';
import { WorkflowTestDialog } from '../components/WorkflowTestDialog';
import { WorkflowValidationDialog } from '../components/WorkflowValidationDialog';
import type { WorkflowFormData, WorkflowActionFormData, WorkflowAction, WorkflowValidationResponse } from '../types';

const WorkflowBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: workflow, isLoading: workflowLoading } = useWorkflow(id || '', { enabled: !!id });
  const { data: actions = [], isLoading: actionsLoading } = useWorkflowActions(id || '', { enabled: !!id });
  const createWorkflow = useCreateWorkflow();
  const updateWorkflow = useUpdateWorkflow(id || '');
  const testWorkflow = useTestWorkflow();
  const validateWorkflow = useValidateWorkflow();

  // Dialog states
  const [workflowFormOpen, setWorkflowFormOpen] = useState(!isEditing);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  // Current states
  const [currentWorkflow, setCurrentWorkflow] = useState<any>(null);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [validationResult, setValidationResult] = useState<WorkflowValidationResponse | null>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (workflow) {
      setCurrentWorkflow(workflow);
      setActiveStep(1); // Move to actions step
    }
  }, [workflow]);

  const handleWorkflowSubmit = async (data: WorkflowFormData) => {
    try {
      if (isEditing && id) {
        const updatedWorkflow = await updateWorkflow.mutateAsync(data);
        setCurrentWorkflow(updatedWorkflow);
      } else {
        const newWorkflow = await createWorkflow.mutateAsync(data);
        setCurrentWorkflow(newWorkflow);
        navigate(`/workflows/builder/${newWorkflow.id}`, { replace: true });
      }
      setWorkflowFormOpen(false);
      setActiveStep(1);
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const handleActionSubmit = async () => {
    // This would be handled by the action form component
    setActionFormOpen(false);
    setSelectedAction(null);
  };

  const handleEditAction = (action: WorkflowAction) => {
    setSelectedAction(action);
    setActionFormOpen(true);
  };

  const handleTestWorkflow = async (testData: any) => {
    if (currentWorkflow) {
      await testWorkflow.mutateAsync({ id: currentWorkflow.id, testData });
      setTestDialogOpen(false);
    }
  };

  const handleValidateWorkflow = async () => {
    if (currentWorkflow) {
      try {
        const result = await validateWorkflow.mutateAsync(currentWorkflow.id);
        setValidationResult(result);
        setValidationDialogOpen(true);
      } catch (error) {
        // Error handling is done by the mutation
      }
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Email />;
      case 'send_sms': return <Sms />;
      case 'webhook': return <Webhook />;
      case 'update_booking': return <Update />;
      default: return <PlayArrow />;
    }
  };

  const steps = [
    {
      label: 'Workflow Configuration',
      description: 'Set up basic workflow settings and triggers',
    },
    {
      label: 'Add Actions',
      description: 'Configure actions to execute when workflow triggers',
    },
    {
      label: 'Test & Validate',
      description: 'Test your workflow and validate configuration',
    },
  ];

  if (isEditing && workflowLoading) {
    return <LoadingSpinner message="Loading workflow..." />;
  }

  return (
    <>
      <PageHeader
        title={isEditing ? `Edit Workflow: ${workflow?.name}` : 'Create New Workflow'}
        subtitle={isEditing ? 'Modify your existing workflow configuration' : 'Build a new automated workflow'}
        actions={
          currentWorkflow && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<BugReport />}
                onClick={handleValidateWorkflow}
                loading={validateWorkflow.isPending}
              >
                Validate
              </Button>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => setTestDialogOpen(true)}
              >
                Test
              </Button>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={() => navigate('/workflows/list')}
              >
                Save & Exit
              </Button>
            </Box>
          )
        }
      />

      <Card>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  onClick={() => setActiveStep(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  {step.label}
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>

                  {/* Step 0: Workflow Configuration */}
                  {index === 0 && (
                    <Box>
                      {currentWorkflow ? (
                        <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Current Configuration
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            <Chip label={`Trigger: ${currentWorkflow.trigger_display}`} />
                            <Chip label={`Delay: ${currentWorkflow.delay_minutes} min`} />
                            <Chip 
                              label={currentWorkflow.is_active ? 'Active' : 'Inactive'}
                              color={currentWorkflow.is_active ? 'success' : 'default'}
                            />
                          </Box>
                          <Button
                            variant="outlined"
                            startIcon={<Edit />}
                            onClick={() => setWorkflowFormOpen(true)}
                          >
                            Edit Configuration
                          </Button>
                        </Paper>
                      ) : (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => setWorkflowFormOpen(true)}
                        >
                          Configure Workflow
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Step 1: Actions */}
                  {index === 1 && (
                    <Box>
                      {!currentWorkflow ? (
                        <Alert severity="warning">
                          Please complete workflow configuration first.
                        </Alert>
                      ) : (
                        <Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="subtitle2">
                              Workflow Actions ({actions.length})
                            </Typography>
                            <Button
                              variant="contained"
                              startIcon={<Add />}
                              onClick={() => {
                                setSelectedAction(null);
                                setActionFormOpen(true);
                              }}
                            >
                              Add Action
                            </Button>
                          </Box>

                          {actions.length === 0 ? (
                            <Alert severity="info">
                              No actions configured yet. Add your first action to get started.
                            </Alert>
                          ) : (
                            <List>
                              <AnimatePresence>
                                {actions
                                  .sort((a, b) => a.order - b.order)
                                  .map((action, index) => (
                                    <motion.div
                                      key={action.id}
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -20 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ListItem
                                        sx={{
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                          mb: 1,
                                        }}
                                      >
                                        <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                                        {getActionIcon(action.action_type)}
                                        <ListItemText
                                          primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                              <Typography variant="subtitle2">
                                                {action.order}. {action.name}
                                              </Typography>
                                              <Chip
                                                label={action.action_type_display}
                                                size="small"
                                                variant="outlined"
                                              />
                                              <Chip
                                                label={action.recipient_display}
                                                size="small"
                                              />
                                              {!action.is_active && (
                                                <Chip
                                                  label="Inactive"
                                                  size="small"
                                                  color="default"
                                                />
                                              )}
                                            </Box>
                                          }
                                          secondary={
                                            <Box>
                                              {action.subject && (
                                                <Typography variant="caption" display="block">
                                                  Subject: {action.subject}
                                                </Typography>
                                              )}
                                              {action.conditions.length > 0 && (
                                                <Chip
                                                  label={`${action.conditions.length} condition${action.conditions.length !== 1 ? 's' : ''}`}
                                                  size="small"
                                                  color="info"
                                                  sx={{ mt: 0.5 }}
                                                />
                                              )}
                                            </Box>
                                          }
                                        />
                                        <ListItemSecondaryAction>
                                          <IconButton
                                            edge="end"
                                            onClick={() => handleEditAction(action)}
                                          >
                                            <Edit />
                                          </IconButton>
                                        </ListItemSecondaryAction>
                                      </ListItem>
                                    </motion.div>
                                  ))}
                              </AnimatePresence>
                            </List>
                          )}
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Step 2: Test & Validate */}
                  {index === 2 && (
                    <Box>
                      {!currentWorkflow ? (
                        <Alert severity="warning">
                          Please complete workflow configuration and add actions first.
                        </Alert>
                      ) : actions.length === 0 ? (
                        <Alert severity="warning">
                          Please add at least one action before testing.
                        </Alert>
                      ) : (
                        <Box display="flex" gap={2}>
                          <Button
                            variant="outlined"
                            startIcon={<BugReport />}
                            onClick={handleValidateWorkflow}
                            loading={validateWorkflow.isPending}
                          >
                            Validate Configuration
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<PlayArrow />}
                            onClick={() => setTestDialogOpen(true)}
                          >
                            Test Workflow
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}

                  <Box sx={{ mb: 1, mt: 2 }}>
                    <Button
                      disabled={index === 0}
                      onClick={() => setActiveStep(index - 1)}
                      sx={{ mr: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(index + 1)}
                      disabled={
                        (index === 0 && !currentWorkflow) ||
                        (index === 1 && actions.length === 0) ||
                        index === steps.length - 1
                      }
                    >
                      {index === steps.length - 1 ? 'Finish' : 'Continue'}
                    </Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Workflow Form Dialog */}
      <WorkflowForm
        open={workflowFormOpen}
        onClose={() => setWorkflowFormOpen(false)}
        onSubmit={handleWorkflowSubmit}
        workflow={currentWorkflow}
        loading={createWorkflow.isPending || updateWorkflow.isPending}
      />

      {/* Action Form Dialog */}
      {currentWorkflow && (
        <WorkflowActionForm
          open={actionFormOpen}
          onClose={() => {
            setActionFormOpen(false);
            setSelectedAction(null);
          }}
          onSubmit={handleActionSubmit}
          action={selectedAction || undefined}
          workflowId={currentWorkflow.id}
        />
      )}

      {/* Test Dialog */}
      <WorkflowTestDialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        onTest={handleTestWorkflow}
        workflowName={currentWorkflow?.name || ''}
        loading={testWorkflow.isPending}
      />

      {/* Validation Dialog */}
      <WorkflowValidationDialog
        open={validationDialogOpen}
        onClose={() => {
          setValidationDialogOpen(false);
          setValidationResult(null);
        }}
        validation={validationResult}
        workflowName={currentWorkflow?.name || ''}
      />
    </>
  );
};

export default WorkflowBuilder;