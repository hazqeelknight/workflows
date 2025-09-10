import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Paper,
  Alert,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email,
  Sms,
  Webhook,
  Update,
  DragIndicator,
  MoreVert,
  Edit,
  Delete,
  PlayArrow,
  Visibility,
  Add,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/core';
import { useWorkflowActions, useDeleteWorkflowAction } from '../hooks/useWorkflowsApi';
import { WorkflowActionForm } from './WorkflowActionForm';
import type { WorkflowAction, WorkflowActionFormData } from '../types';

interface WorkflowActionsListProps {
  workflowId: string;
  onActionUpdate?: () => void;
}

export const WorkflowActionsList: React.FC<WorkflowActionsListProps> = ({
  workflowId,
  onActionUpdate,
}) => {
  const { data: actions = [], isLoading } = useWorkflowActions(workflowId);
  const deleteAction = useDeleteWorkflowAction(workflowId);

  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<WorkflowAction | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAction, setMenuAction] = useState<WorkflowAction | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, action: WorkflowAction) => {
    setAnchorEl(event.currentTarget);
    setMenuAction(action);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAction(null);
  };

  const handleEdit = (action: WorkflowAction) => {
    setSelectedAction(action);
    setActionFormOpen(true);
    handleMenuClose();
  };

  const handleDelete = (action: WorkflowAction) => {
    setSelectedAction(action);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (selectedAction) {
      try {
        await deleteAction.mutateAsync(selectedAction.id);
        setDeleteDialogOpen(false);
        setSelectedAction(null);
        onActionUpdate?.();
      } catch (error) {
        // Error handling is done by the mutation
      }
    }
  };

  const handleActionSubmit = async (data: WorkflowActionFormData) => {
    // This would be handled by the action form component
    setActionFormOpen(false);
    setSelectedAction(null);
    onActionUpdate?.();
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return <Email color="primary" />;
      case 'send_sms': return <Sms color="secondary" />;
      case 'webhook': return <Webhook color="info" />;
      case 'update_booking': return <Update color="warning" />;
      default: return <PlayArrow />;
    }
  };

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'send_email': return 'primary';
      case 'send_sms': return 'secondary';
      case 'webhook': return 'info';
      case 'update_booking': return 'warning';
      default: return 'default';
    }
  };

  const sortedActions = [...actions].sort((a, b) => a.order - b.order);

  if (isLoading) {
    return (
      <Box display="flex" alignItems="center" gap={2} p={2}>
        <Typography variant="body2" color="text.secondary">
          Loading actions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Workflow Actions ({actions.length})
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedAction(null);
            setActionFormOpen(true);
          }}
          size="small"
        >
          Add Action
        </Button>
      </Box>

      {actions.length === 0 ? (
        <Alert severity="info">
          <Typography variant="body2">
            No actions configured yet. Add your first action to get started.
          </Typography>
        </Alert>
      ) : (
        <List disablePadding>
          <AnimatePresence>
            {sortedActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Paper
                  sx={{
                    mb: 1,
                    border: '1px solid',
                    borderColor: action.is_active ? 'divider' : 'action.disabled',
                    opacity: action.is_active ? 1 : 0.6,
                  }}
                >
                  <ListItem>
                    <ListItemIcon>
                      <DragIndicator sx={{ color: 'text.secondary', mr: 1 }} />
                      {getActionIcon(action.action_type)}
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {action.order}. {action.name}
                          </Typography>
                          <Chip
                            label={action.action_type_display}
                            color={getActionColor(action.action_type) as any}
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
                          {action.conditions.length > 0 && (
                            <Chip
                              label={`${action.conditions.length} condition${action.conditions.length !== 1 ? 's' : ''}`}
                              size="small"
                              color="info"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          {action.subject && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Subject: {action.subject.length > 50 
                                ? `${action.subject.substring(0, 50)}...`
                                : action.subject
                              }
                            </Typography>
                          )}
                          {action.webhook_url && (
                            <Typography variant="caption" display="block" color="text.secondary">
                              Webhook: {action.webhook_url}
                            </Typography>
                          )}
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Typography variant="caption" color="text.secondary">
                              Success Rate: {action.success_rate}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ({action.execution_stats.total_executions} executions)
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                    
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => handleMenuOpen(e, action)}
                        size="small"
                      >
                        <MoreVert />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        </List>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEdit(menuAction!)}>
          <Edit sx={{ mr: 1 }} />
          Edit Action
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menuAction!)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Delete Action
        </MenuItem>
      </Menu>

      {/* Action Form Dialog */}
      <WorkflowActionForm
        open={actionFormOpen}
        onClose={() => {
          setActionFormOpen(false);
          setSelectedAction(null);
        }}
        onSubmit={handleActionSubmit}
        action={selectedAction}
        workflowId={workflowId}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Action</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the action "{selectedAction?.name}"? This action cannot be undone.
          </Typography>
          {selectedAction && selectedAction.execution_stats.total_executions > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action has {selectedAction.execution_stats.total_executions} execution records.
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
            loading={deleteAction.isPending}
          >
            Delete Action
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};