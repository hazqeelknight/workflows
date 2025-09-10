import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import { 
  CheckCircle, 
  Warning, 
  Error, 
  Info,
  Security,
  Speed,
  BugReport,
} from '@mui/icons-material';
import { Button } from '@/components/core';
import type { WorkflowValidationResponse } from '../types';

interface WorkflowValidationDialogProps {
  open: boolean;
  onClose: () => void;
  validation: WorkflowValidationResponse | null;
  workflowName: string;
}

export const WorkflowValidationDialog: React.FC<WorkflowValidationDialogProps> = ({
  open,
  onClose,
  validation,
  workflowName,
}) => {
  if (!validation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'success';
      case 'issues_found': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle color="success" />;
      case 'issues_found': return <Warning color="warning" />;
      default: return <Info />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <BugReport />
          Workflow Validation: {workflowName}
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Overall Status */}
          <Alert 
            severity={validation.valid ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
            icon={getStatusIcon(validation.overall_status)}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Overall Status: {validation.overall_status.replace('_', ' ').toUpperCase()}
              </Typography>
              <Chip
                label={validation.valid ? 'Valid' : 'Issues Found'}
                color={getStatusColor(validation.overall_status) as any}
                size="small"
              />
            </Box>
          </Alert>

          {/* Errors */}
          {validation.errors.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="error" gutterBottom>
                <Error sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuration Errors
              </Typography>
              <List dense>
                {validation.errors.map((error, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Error color="error" />
                    </ListItemIcon>
                    <ListItemText
                      primary={error}
                      primaryTypographyProps={{ color: 'error' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Warnings */}
          {validation.warnings.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="warning.main" gutterBottom>
                <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                Configuration Warnings
              </Typography>
              <List dense>
                {validation.warnings.map((warning, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={warning}
                      primaryTypographyProps={{ color: 'warning.main' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Runtime Checks */}
          {validation.runtime_checks.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" color="info.main" gutterBottom>
                <Security sx={{ mr: 1, verticalAlign: 'middle' }} />
                Runtime Checks
              </Typography>
              <List dense>
                {validation.runtime_checks.map((check, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Info color="info" />
                    </ListItemIcon>
                    <ListItemText
                      primary={check}
                      primaryTypographyProps={{ color: 'info.main' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Success State */}
          {validation.valid && validation.warnings.length === 0 && validation.runtime_checks.length === 0 && (
            <Box textAlign="center" py={4}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main" gutterBottom>
                Workflow Configuration is Valid
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No issues found. This workflow is ready for production use.
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            <strong>Validation includes:</strong> Action configuration, recipient settings, 
            webhook URLs, condition syntax, booking update fields, and external service connectivity.
          </Typography>
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