import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/api/queryClient';
import { toast } from 'react-toastify';
import {
  workflowsApi,
  workflowActionsApi,
  workflowExecutionsApi,
  workflowTemplatesApi,
} from '../api/workflowsApi';
import type {
  WorkflowFormData,
  WorkflowActionFormData,
  WorkflowTestRequest,
  WorkflowFromTemplateRequest,
  BulkTestRequest,
} from '../types';

// Workflows hooks
export const useWorkflows = () => {
  return useQuery({
    queryKey: queryKeys.workflows.list(),
    queryFn: workflowsApi.getAll,
  });
};

export const useWorkflow = (id: string) => {
  return useQuery({
    queryKey: queryKeys.workflows.workflow(id),
    queryFn: () => workflowsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WorkflowFormData) => workflowsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
      toast.success('Workflow created successfully');
    },
  });
};

export const useUpdateWorkflow = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<WorkflowFormData>) => workflowsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.workflow(id) });
      toast.success('Workflow updated successfully');
    },
  });
};

export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workflowsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
      toast.success('Workflow deleted successfully');
    },
  });
};

export const useTestWorkflow = () => {
  return useMutation({
    mutationFn: ({ id, testData }: { id: string; testData: WorkflowTestRequest }) =>
      workflowsApi.test(id, testData),
    onSuccess: (data) => {
      if (data.warning) {
        toast.warning(data.message);
      } else {
        toast.success(data.message);
      }
    },
  });
};

export const useValidateWorkflow = () => {
  return useMutation({
    mutationFn: (id: string) => workflowsApi.validate(id),
  });
};

export const useWorkflowExecutionSummary = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.workflows.workflow(id), 'execution-summary'],
    queryFn: () => workflowsApi.getExecutionSummary(id),
    enabled: !!id,
  });
};

export const useDuplicateWorkflow = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workflowsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
      toast.success('Workflow duplicated successfully');
    },
  });
};

export const useBulkTestWorkflows = () => {
  return useMutation({
    mutationFn: (data: BulkTestRequest) => workflowsApi.bulkTest(data),
    onSuccess: (data) => {
      toast.success(data.message);
    },
  });
};

export const useWorkflowPerformanceStats = () => {
  return useQuery({
    queryKey: queryKeys.workflows.performanceStats(),
    queryFn: workflowsApi.getPerformanceStats,
  });
};

// Workflow Actions hooks
export const useWorkflowActions = (workflowId: string) => {
  return useQuery({
    queryKey: queryKeys.workflows.actions(workflowId),
    queryFn: () => workflowActionsApi.getAll(workflowId),
    enabled: !!workflowId,
  });
};

export const useWorkflowAction = (id: string) => {
  return useQuery({
    queryKey: [...queryKeys.workflows.all, 'action', id],
    queryFn: () => workflowActionsApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateWorkflowAction = (workflowId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WorkflowActionFormData) => workflowActionsApi.create(workflowId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.actions(workflowId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.workflow(workflowId) });
      toast.success('Action created successfully');
    },
  });
};

export const useUpdateWorkflowAction = (workflowId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WorkflowActionFormData> }) =>
      workflowActionsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.actions(workflowId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.workflow(workflowId) });
      toast.success('Action updated successfully');
    },
  });
};

export const useDeleteWorkflowAction = (workflowId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => workflowActionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.actions(workflowId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.workflow(workflowId) });
      toast.success('Action deleted successfully');
    },
  });
};

// Workflow Executions hooks
export const useWorkflowExecutions = () => {
  return useQuery({
    queryKey: queryKeys.workflows.executions(),
    queryFn: workflowExecutionsApi.getAll,
  });
};

// Workflow Templates hooks
export const useWorkflowTemplates = () => {
  return useQuery({
    queryKey: queryKeys.workflows.templates(),
    queryFn: workflowTemplatesApi.getAll,
  });
};

export const useCreateWorkflowFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: WorkflowFromTemplateRequest) => workflowTemplatesApi.createFromTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows.list() });
      toast.success('Workflow created from template successfully');
    },
  });
};