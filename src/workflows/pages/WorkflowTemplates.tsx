import React, { useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  BookmarkBorder,
  Email,
  Feedback,
  Schedule,
  TrendingUp,
  Search,
  FilterList,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PageHeader, LoadingSpinner, Button } from '@/components/core';
import { useWorkflowTemplates, useCreateWorkflowFromTemplate } from '../hooks/useWorkflowsApi';
import { WorkflowTemplateSelector } from '../components/WorkflowTemplateSelector';
import type { WorkflowTemplate } from '../types';
import { TEMPLATE_CATEGORIES } from '../types';

const WorkflowTemplates: React.FC = () => {
  const { data: templates = [], isLoading } = useWorkflowTemplates();
  const createFromTemplate = useCreateWorkflowFromTemplate();
  
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

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

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = async (template: WorkflowTemplate) => {
    try {
      await createFromTemplate.mutateAsync({
        template_id: template.id,
        name: `${template.name} (Copy)`,
      });
    } catch (error) {
      // Error handling is done by the mutation
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading workflow templates..." />;
  }

  return (
    <>
      <PageHeader
        title="Workflow Templates"
        subtitle="Start with pre-built workflow templates to save time"
        actions={
          <Button
            variant="contained"
            onClick={() => setTemplateSelectorOpen(true)}
          >
            Create from Template
          </Button>
        }
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search templates..."
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
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="">All Categories</MenuItem>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={6}>
              <BookmarkBorder sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm || categoryFilter ? 'No Templates Found' : 'No Templates Available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || categoryFilter 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Workflow templates will appear here when available'
                }
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredTemplates.map((template, index) => (
            <Grid item xs={12} md={6} lg={4} key={template.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {getCategoryIcon(template.category)}
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {template.name}
                      </Typography>
                    </Box>
                    
                    <Chip
                      label={template.category_display}
                      color={getCategoryColor(template.category) as any}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>

                    {/* Template Details */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Trigger: {template.template_data.workflow?.trigger || 'Not specified'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Actions: {template.template_data.actions?.length || 0}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Used: {template.usage_count} times
                      </Typography>
                    </Box>

                    {/* Action Preview */}
                    {template.template_data.actions && template.template_data.actions.length > 0 && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Included Actions:
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {template.template_data.actions.slice(0, 3).map((action, actionIndex) => (
                            <Box key={actionIndex} display="flex" alignItems="center" gap={0.5} mb={0.5}>
                              {getActionIcon(action.action_type || 'send_email')}
                              <Typography variant="caption">
                                {action.name || `${action.action_type} action`}
                              </Typography>
                            </Box>
                          ))}
                          {template.template_data.actions.length > 3 && (
                            <Typography variant="caption" color="text.secondary">
                              +{template.template_data.actions.length - 3} more actions
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                  
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleUseTemplate(template)}
                      loading={createFromTemplate.isPending}
                    >
                      Use This Template
                    </Button>
                  </CardActions>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Template Selector Dialog */}
      <WorkflowTemplateSelector
        open={templateSelectorOpen}
        onClose={() => setTemplateSelectorOpen(false)}
        onSuccess={() => setTemplateSelectorOpen(false)}
      />
    </>
  );
};

export default WorkflowTemplates;