// Workflows Module Utilities

/**
 * Format workflow trigger for display
 */
export const formatTriggerDisplay = (trigger: string): string => {
  const triggerMap = {
    booking_created: 'Booking Created',
    booking_cancelled: 'Booking Cancelled', 
    booking_completed: 'Booking Completed',
    before_meeting: 'Before Meeting',
    after_meeting: 'After Meeting',
  };
  
  return triggerMap[trigger as keyof typeof triggerMap] || trigger;
};

/**
 * Format action type for display
 */
export const formatActionTypeDisplay = (actionType: string): string => {
  const actionMap = {
    send_email: 'Send Email',
    send_sms: 'Send SMS',
    webhook: 'Trigger Webhook',
    update_booking: 'Update Booking',
  };
  
  return actionMap[actionType as keyof typeof actionMap] || actionType;
};

/**
 * Format recipient type for display
 */
export const formatRecipientDisplay = (recipient: string): string => {
  const recipientMap = {
    organizer: 'Organizer',
    invitee: 'Invitee',
    both: 'Both',
    custom: 'Custom Email',
  };
  
  return recipientMap[recipient as keyof typeof recipientMap] || recipient;
};

/**
 * Get status color for workflow execution status
 */
export const getExecutionStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' | 'default' => {
  switch (status) {
    case 'completed':
      return 'success';
    case 'failed':
      return 'error';
    case 'running':
      return 'info';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Calculate workflow health score based on success rate and execution count
 */
export const calculateWorkflowHealth = (successRate: number, totalExecutions: number): {
  score: number;
  label: string;
  color: 'success' | 'warning' | 'error';
} => {
  if (totalExecutions === 0) {
    return { score: 0, label: 'No Data', color: 'warning' };
  }
  
  if (successRate >= 95) {
    return { score: 100, label: 'Excellent', color: 'success' };
  } else if (successRate >= 80) {
    return { score: 80, label: 'Good', color: 'success' };
  } else if (successRate >= 60) {
    return { score: 60, label: 'Fair', color: 'warning' };
  } else {
    return { score: 40, label: 'Poor', color: 'error' };
  }
};

/**
 * Format delay minutes for display
 */
export const formatDelayDisplay = (delayMinutes: number): string => {
  if (delayMinutes === 0) return 'Immediate';
  if (delayMinutes < 60) return `${delayMinutes} minutes`;
  
  const hours = Math.floor(delayMinutes / 60);
  const minutes = delayMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${minutes}m`;
};

/**
 * Validate condition rule structure
 */
export const validateConditionRule = (rule: any): { isValid: boolean; error?: string } => {
  if (!rule || typeof rule !== 'object') {
    return { isValid: false, error: 'Rule must be an object' };
  }
  
  if (!rule.field) {
    return { isValid: false, error: 'Field is required' };
  }
  
  if (!rule.operator) {
    return { isValid: false, error: 'Operator is required' };
  }
  
  const operatorsNeedingValue = [
    'equals', 'not_equals', 'greater_than', 'less_than', 
    'contains', 'not_contains', 'starts_with', 'ends_with',
    'in_list', 'not_in_list', 'regex_match'
  ];
  
  if (operatorsNeedingValue.includes(rule.operator) && !rule.value) {
    return { isValid: false, error: 'Value is required for this operator' };
  }
  
  return { isValid: true };
};

/**
 * Validate condition group structure
 */
export const validateConditionGroup = (group: any): { isValid: boolean; error?: string } => {
  if (!group || typeof group !== 'object') {
    return { isValid: false, error: 'Group must be an object' };
  }
  
  if (!group.operator || !['AND', 'OR'].includes(group.operator)) {
    return { isValid: false, error: 'Group operator must be AND or OR' };
  }
  
  if (!Array.isArray(group.rules) || group.rules.length === 0) {
    return { isValid: false, error: 'Group must have at least one rule' };
  }
  
  for (const rule of group.rules) {
    const ruleValidation = validateConditionRule(rule);
    if (!ruleValidation.isValid) {
      return ruleValidation;
    }
  }
  
  return { isValid: true };
};

/**
 * Validate complete conditions array
 */
export const validateConditions = (conditions: any[]): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Array.isArray(conditions)) {
    return { isValid: false, errors: ['Conditions must be an array'] };
  }
  
  conditions.forEach((group, index) => {
    const groupValidation = validateConditionGroup(group);
    if (!groupValidation.isValid) {
      errors.push(`Group ${index + 1}: ${groupValidation.error}`);
    }
  });
  
  return { isValid: errors.length === 0, errors };
};

/**
 * Generate sample webhook payload for testing
 */
export const generateSampleWebhookPayload = (customData: Record<string, any> = {}) => {
  return {
    action: 'sample_action',
    workflow_id: 'sample-workflow-id',
    workflow_name: 'Sample Workflow',
    booking_id: 'sample-booking-id',
    event_type_name: 'Discovery Call',
    event_type_slug: 'discovery-call',
    organizer_email: 'organizer@example.com',
    invitee_name: 'John Doe',
    invitee_email: 'john.doe@example.com',
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 30 * 60000).toISOString(),
    duration_minutes: 30,
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    ...customData,
  };
};

/**
 * Parse and format execution log for display
 */
export const formatExecutionLog = (log: any[]) => {
  return log.map(entry => ({
    ...entry,
    formattedTimestamp: new Date(entry.timestamp).toLocaleString(),
    formattedDuration: entry.execution_time_ms < 1000 
      ? `${entry.execution_time_ms}ms`
      : `${(entry.execution_time_ms / 1000).toFixed(2)}s`,
  }));
};

/**
 * Calculate workflow complexity score
 */
export const calculateWorkflowComplexity = (workflow: Workflow): {
  score: number;
  factors: string[];
} => {
  let score = 0;
  const factors: string[] = [];
  
  // Base complexity
  score += workflow.actions.length * 10;
  factors.push(`${workflow.actions.length} actions`);
  
  // Conditional complexity
  const conditionsCount = workflow.actions.reduce((sum, action) => sum + action.conditions.length, 0);
  if (conditionsCount > 0) {
    score += conditionsCount * 15;
    factors.push(`${conditionsCount} conditions`);
  }
  
  // Delay complexity
  if (workflow.delay_minutes > 0) {
    score += 5;
    factors.push('delayed execution');
  }
  
  // Action type complexity
  const hasWebhooks = workflow.actions.some(a => a.action_type === 'webhook');
  const hasBookingUpdates = workflow.actions.some(a => a.action_type === 'update_booking');
  
  if (hasWebhooks) {
    score += 10;
    factors.push('webhook actions');
  }
  
  if (hasBookingUpdates) {
    score += 15;
    factors.push('booking updates');
  }
  
  return { score, factors };
};

/**
 * Get recommended optimizations for workflow
 */
export const getWorkflowOptimizations = (workflow: Workflow): string[] => {
  const optimizations: string[] = [];
  
  if (workflow.success_rate < 80) {
    optimizations.push('Review failed executions and fix configuration issues');
  }
  
  if (workflow.actions.length > 5) {
    optimizations.push('Consider splitting into multiple workflows for better maintainability');
  }
  
  const hasComplexConditions = workflow.actions.some(a => a.conditions.length > 2);
  if (hasComplexConditions) {
    optimizations.push('Simplify complex conditions to improve reliability');
  }
  
  const hasInactiveActions = workflow.actions.some(a => !a.is_active);
  if (hasInactiveActions) {
    optimizations.push('Remove or activate inactive actions to clean up workflow');
  }
  
  if (workflow.delay_minutes > 1440) { // More than 24 hours
    optimizations.push('Consider reducing delay time for better user experience');
  }
  
  return optimizations;
};

/**
 * Format template category for display
 */
export const formatTemplateCategoryDisplay = (category: string): string => {
  const categoryMap = {
    booking: 'Booking Management',
    follow_up: 'Follow-up',
    reminder: 'Reminders',
    feedback: 'Feedback Collection',
  };
  
  return categoryMap[category as keyof typeof categoryMap] || category;
};

/**
 * Generate workflow summary text
 */
export const generateWorkflowSummary = (workflow: Workflow): string => {
  const actionTypes = workflow.actions.reduce((acc, action) => {
    acc[action.action_type] = (acc[action.action_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const actionSummary = Object.entries(actionTypes)
    .map(([type, count]) => `${count} ${formatActionTypeDisplay(type).toLowerCase()}`)
    .join(', ');
  
  const delayText = workflow.delay_minutes > 0 
    ? ` with ${formatDelayDisplay(workflow.delay_minutes)} delay`
    : '';
  
  return `Triggers on ${workflow.trigger_display.toLowerCase()}${delayText}. Executes ${actionSummary}.`;
};