import { api } from '@/api/client';
import type {
  Workflow,
  WorkflowAction,
  WorkflowExecution,
  WorkflowTemplate,
  WorkflowFormData,
  WorkflowActionFormData,
  WorkflowTestRequest,
  WorkflowTestResponse,
  WorkflowValidationResponse,
  WorkflowFromTemplateRequest,
  WorkflowPerformanceStats,
  BulkTestRequest,
  BulkTestResponse,
} from '../types';

// Workflows API
export const workflowsApi = {
  // Core CRUD operations
  getAll: async (): Promise<Workflow[]> => {
    const response = await api.get('/workflows/');
    return response.data.results || response.data;
  },

  getById: async (id: string): Promise<Workflow> => {
    const response = await api.get(`/workflows/${id}/`);
    return response.data;
  },

  create: async (data: WorkflowFormData): Promise<Workflow> => {
    const response = await api.post('/workflows/', data);
    return response.data;
  },

  update: async (id: string, data: Partial<WorkflowFormData>): Promise<Workflow> => {
    const response = await api.patch(`/workflows/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/${id}/`);
  },

  // Advanced operations
  test: async (id: string, testData: WorkflowTestRequest): Promise<WorkflowTestResponse> => {
    const response = await api.post(`/workflows/${id}/test/`, testData);
    return response.data;
  },

  validate: async (id: string): Promise<WorkflowValidationResponse> => {
    const response = await api.post(`/workflows/${id}/validate/`);
    return response.data;
  },

  getExecutionSummary: async (id: string): Promise<any> => {
    const response = await api.get(`/workflows/${id}/execution-summary/`);
    return response.data;
  },

  duplicate: async (id: string): Promise<Workflow> => {
    const response = await api.post(`/workflows/${id}/duplicate/`);
    return response.data;
  },

  bulkTest: async (data: BulkTestRequest): Promise<BulkTestResponse> => {
    const response = await api.post('/workflows/bulk-test/', data);
    return response.data;
  },

  getPerformanceStats: async (): Promise<WorkflowPerformanceStats> => {
    const response = await api.get('/workflows/performance-stats/');
    return response.data;
  },
};

// Workflow Actions API
export const workflowActionsApi = {
  getAll: async (workflowId: string): Promise<WorkflowAction[]> => {
    const response = await api.get(`/workflows/${workflowId}/actions/`);
    return response.data.results || response.data;
  },

  getById: async (id: string): Promise<WorkflowAction> => {
    const response = await api.get(`/workflows/actions/${id}/`);
    return response.data;
  },

  create: async (workflowId: string, data: WorkflowActionFormData): Promise<WorkflowAction> => {
    const response = await api.post(`/workflows/${workflowId}/actions/`, data);
    return response.data;
  },

  update: async (id: string, data: Partial<WorkflowActionFormData>): Promise<WorkflowAction> => {
    const response = await api.patch(`/workflows/actions/${id}/`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/workflows/actions/${id}/`);
  },
};

// Workflow Executions API
export const workflowExecutionsApi = {
  getAll: async (): Promise<WorkflowExecution[]> => {
    const response = await api.get('/workflows/executions/');
    return response.data.results || response.data;
  },
};

// Workflow Templates API
export const workflowTemplatesApi = {
  getAll: async (): Promise<WorkflowTemplate[]> => {
    const response = await api.get('/workflows/templates/');
    return response.data.results || response.data;
  },

  createFromTemplate: async (data: WorkflowFromTemplateRequest): Promise<Workflow> => {
    const response = await api.post('/workflows/templates/create-from/', data);
    return response.data;
  },
};