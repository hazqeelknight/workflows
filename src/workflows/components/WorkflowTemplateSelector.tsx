import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { 
  BookmarkBorder,
  Email,
  Feedback,
  Schedule,
  TrendingUp,
} from '@mui/icons-material';
import { Button } from '@/components/core';
import { useWorkflowTemplates, useCreateWorkflowFromTemplate } from '../hooks/useWorkflowsApi';
import type { WorkflowTemplate, WorkflowFromTemplateRequest } from '../types';

interface WorkflowTemplateSelectorProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const WorkflowTemplateSelector: React.FC<WorkflowTemplateSelectorProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { data: templates = [], isLoading } = useWorkflowTemplates();
  const createFromTemplate = useCreateWorkflowFromTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [customName, setCustomName] = useState('');
  const [customizeActions, setCustomizeActions] = useState(false);

  const handleTemplateSelect = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setCustomName(template.name);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    const data: WorkflowFromTemplateRequest = {
      template_id: selectedTemplate.id,
      name: customName || selectedTemplate.name,
      customize_actions: customizeActions,
    };

    try {
      await createFromTemplate.mutateAsync(data);
      onSuccess?.();
      onClose();
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'booking': return <BookmarkBorder />;
      case 'follow_up': return <Email />;
      case 'reminder': return <Schedule />;
      case 'feedback': return <Feedback />;
      default: return <TrendingUp />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'booking': return 'primary';
      case 'follow_up': return 'secondary';
      case 'reminder': return 'warning';
      case 'feedback': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        Create Workflow from Template
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {!selectedTemplate ? (
            <>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Choose from our pre-built workflow templates to get started quickly
              </Typography>

              <Grid container spacing={2}>
                {templates.map((template) => (
                  <Grid item xs={12} md={6} key={template.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 4,
                        },
                      }}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {getCategoryIcon(template.category)}
                          <Typography variant="h6">
                            {template.name}
                          </Typography>
                          <Chip
                            label={template.category_display}
                            color={getCategoryColor(template.category) as any}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {template.description}
                        </Typography>

                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary">
                            Used {template.usage_count} times
                          </Typography>
                          <Button size="small" variant="outlined">
                            Select Template
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {templates.length === 0 && !isLoading && (
                <Alert severity="info">
                  No workflow templates are currently available.
                </Alert>
              )}
            </>
          ) : (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  <strong>Selected Template:</strong> {selectedTemplate.name}
                </Typography>
                <Typography variant="body2">
                  {selectedTemplate.description}
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label="Workflow Name"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                margin="normal"
                helperText="Customize the name for your workflow"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={customizeActions}
                    onChange={(e) => setCustomizeActions(e.target.checked)}
                  />
                }
                label="Allow me to customize actions after creation"
                sx={{ mt: 2 }}
              />

              {/* Template Preview */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Template Preview
                </Typography>
                
                <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Trigger:</strong> {selectedTemplate.template_data.workflow?.trigger || 'Not specified'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Actions ({selectedTemplate.template_data.actions?.length || 0}):</strong>
                  </Typography>
                  
                  {selectedTemplate.template_data.actions?.map((action, index) => (
                    <Box key={index} sx={{ ml: 2, mb: 1 }}>
                      <Typography variant="caption">
                        {index + 1}. {action.name} ({action.action_type})
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Box>

              <Box display="flex" gap={1} mt={2}>
                <Button
                  variant="outlined"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Choose Different Template
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        {selectedTemplate && (
          <Button
            onClick={handleCreateFromTemplate}
            variant="contained"
            loading={createFromTemplate.isPending}
          >
            Create Workflow
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};