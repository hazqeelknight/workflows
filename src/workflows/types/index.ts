// Workflows Module TypeScript Types

export interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: 'booking_created' | 'booking_cancelled' | 'booking_completed' | 'before_meeting' | 'after_meeting';
  trigger_display: string;
  event_types_count: number;
  delay_minutes: number;
  is_active: boolean;
  success_rate: number;
  execution_stats: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    last_executed_at: string | null;
  };
  actions: WorkflowAction[];
  created_at: string;
  updated_at: string;
}

export interface WorkflowAction {
  id: string;
  name: string;
  action_type: 'send_email' | 'send_sms' | 'webhook' | 'update_booking';
  action_type_display: string;
  order: number;
  recipient: 'organizer' | 'invitee' | 'both' | 'custom';
  recipient_display: string;
  custom_email: string;
  subject: string;
  message: string;
  webhook_url: string;
  webhook_data: Record<string, any>;
  conditions: ConditionGroup[];
  update_booking_fields: Record<string, any>;
  is_active: boolean;
  success_rate: number;
  execution_stats: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    last_executed_at: string | null;
  };
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_name: string;
  booking_invitee: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  status_display: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string;
  actions_executed: number;
  actions_failed: number;
  execution_log: ExecutionLogEntry[];
  execution_summary: ExecutionSummary;
  execution_time_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'booking' | 'follow_up' | 'reminder' | 'feedback';
  category_display: string;
  template_data: {
    workflow: Partial<WorkflowFormData>;
    actions: Partial<WorkflowActionFormData>[];
  };
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// Condition system types
export interface ConditionGroup {
  operator: 'AND' | 'OR';
  rules: ConditionRule[];
}

export interface ConditionRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty' | 'in_list' | 'not_in_list' | 'regex_match';
  value?: string;
}

export interface ExecutionLogEntry {
  action_id: string;
  action_name: string;
  action_type: string;
  status: 'success' | 'failed' | 'skipped_conditions';
  result?: any;
  error?: string;
  message?: string;
  conditions_evaluated?: ConditionGroup[];
  timestamp: string;
  execution_time_ms: number;
}

export interface ExecutionSummary {
  summary: string;
  total_actions: number;
  successful_actions: number;
  failed_actions: number;
  skipped_actions: number;
  success_rate: number;
}

// Form data types
export interface WorkflowFormData {
  name: string;
  description: string;
  trigger: Workflow['trigger'];
  event_types: string[];
  delay_minutes: number;
  is_active: boolean;
}

export interface WorkflowActionFormData {
  name: string;
  action_type: WorkflowAction['action_type'];
  order: number;
  recipient: WorkflowAction['recipient'];
  custom_email: string;
  subject: string;
  message: string;
  webhook_url: string;
  webhook_data: Record<string, any>;
  conditions: ConditionGroup[];
  update_booking_fields: Record<string, any>;
  is_active: boolean;
}

// API request/response types
export interface WorkflowTestRequest {
  test_type: 'mock_data' | 'real_data' | 'live_test';
  booking_id?: string;
  live_test?: boolean;
}

export interface WorkflowTestResponse {
  message: string;
  task_id: string;
  test_type: string;
  booking_id?: string;
  warning?: string;
}

export interface WorkflowValidationResponse {
  valid: boolean;
  warnings: string[];
  errors: string[];
  runtime_checks: string[];
  overall_status: 'valid' | 'issues_found';
}

export interface WorkflowFromTemplateRequest {
  template_id: string;
  name?: string;
  customize_actions?: boolean;
}

export interface WorkflowPerformanceStats {
  total_workflows: number;
  active_workflows: number;
  inactive_workflows: number;
  execution_stats_30_days: {
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    success_rate: number;
  };
  top_performing_workflows: Array<{
    workflow_id: string;
    workflow_name: string;
    total_executions: number;
    successful_executions: number;
    success_rate: number;
    last_executed: string | null;
  }>;
  problematic_workflows: Array<{
    workflow_id: string;
    workflow_name: string;
    total_executions: number;
    successful_executions: number;
    success_rate: number;
    last_executed: string | null;
  }>;
}

export interface BulkTestRequest {
  workflow_ids: string[];
  test_type: 'mock_data';
}

export interface BulkTestResponse {
  message: string;
  task_id: string;
  workflow_count: number;
}

// Constants
export const TRIGGER_OPTIONS = [
  { value: 'booking_created', label: 'Booking Created' },
  { value: 'booking_cancelled', label: 'Booking Cancelled' },
  { value: 'booking_completed', label: 'Booking Completed' },
  { value: 'before_meeting', label: 'Before Meeting' },
  { value: 'after_meeting', label: 'After Meeting' },
] as const;

export const ACTION_TYPE_OPTIONS = [
  { value: 'send_email', label: 'Send Email' },
  { value: 'send_sms', label: 'Send SMS' },
  { value: 'webhook', label: 'Trigger Webhook' },
  { value: 'update_booking', label: 'Update Booking' },
] as const;

export const RECIPIENT_OPTIONS = [
  { value: 'organizer', label: 'Organizer' },
  { value: 'invitee', label: 'Invitee' },
  { value: 'both', label: 'Both' },
  { value: 'custom', label: 'Custom Email' },
] as const;

export const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does Not Contain' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'is_empty', label: 'Is Empty' },
  { value: 'is_not_empty', label: 'Is Not Empty' },
  { value: 'in_list', label: 'In List' },
  { value: 'not_in_list', label: 'Not In List' },
  { value: 'regex_match', label: 'Regex Match' },
] as const;

export const CONDITION_FIELDS = [
  { value: 'invitee_name', label: 'Invitee Name' },
  { value: 'invitee_email', label: 'Invitee Email' },
  { value: 'invitee_domain', label: 'Invitee Email Domain' },
  { value: 'event_type_name', label: 'Event Type Name' },
  { value: 'duration', label: 'Duration (minutes)' },
  { value: 'attendee_count', label: 'Attendee Count' },
  { value: 'booking_hour', label: 'Booking Hour (24h)' },
  { value: 'booking_day_of_week', label: 'Day of Week (0=Mon)' },
  { value: 'is_weekend', label: 'Is Weekend' },
  { value: 'is_business_hours', label: 'Is Business Hours' },
  { value: 'has_phone', label: 'Has Phone Number' },
  { value: 'organizer_company', label: 'Organizer Company' },
] as const;

export const TEMPLATE_CATEGORIES = [
  { value: 'booking', label: 'Booking Management' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'reminder', label: 'Reminders' },
  { value: 'feedback', label: 'Feedback Collection' },
] as const;

export const BOOKING_UPDATE_FIELDS = [
  { value: 'status', label: 'Status', type: 'select', options: ['confirmed', 'cancelled', 'rescheduled', 'completed'] },
  { value: 'cancellation_reason', label: 'Cancellation Reason', type: 'text' },
  { value: 'meeting_link', label: 'Meeting Link', type: 'url' },
  { value: 'meeting_id', label: 'Meeting ID', type: 'text' },
  { value: 'meeting_password', label: 'Meeting Password', type: 'text' },
  { value: 'custom_answers', label: 'Custom Answers', type: 'json' },
] as const;