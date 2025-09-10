import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Chip,
  Paper,
  Divider,
  Alert,
} from '@mui/material';
import { Add, Delete, ContentCopy } from '@mui/icons-material';
import { Button } from '@/components/core';
import type { ConditionGroup, ConditionRule } from '../types';
import { CONDITION_OPERATORS, CONDITION_FIELDS } from '../types';

interface ConditionBuilderProps {
  value: ConditionGroup[];
  onChange: (conditions: ConditionGroup[]) => void;
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({
  value,
  onChange,
}) => {
  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      operator: 'AND',
      rules: [{ field: 'invitee_name', operator: 'equals', value: '' }],
    };
    onChange([...value, newGroup]);
  };

  const removeConditionGroup = (groupIndex: number) => {
    onChange(value.filter((_, index) => index !== groupIndex));
  };

  const updateConditionGroup = (groupIndex: number, updates: Partial<ConditionGroup>) => {
    const newConditions = [...value];
    newConditions[groupIndex] = { ...newConditions[groupIndex], ...updates };
    onChange(newConditions);
  };

  const addRule = (groupIndex: number) => {
    const newRule: ConditionRule = {
      field: 'invitee_name',
      operator: 'equals',
      value: '',
    };
    const newConditions = [...value];
    newConditions[groupIndex].rules.push(newRule);
    onChange(newConditions);
  };

  const removeRule = (groupIndex: number, ruleIndex: number) => {
    const newConditions = [...value];
    newConditions[groupIndex].rules = newConditions[groupIndex].rules.filter(
      (_, index) => index !== ruleIndex
    );
    onChange(newConditions);
  };

  const updateRule = (groupIndex: number, ruleIndex: number, updates: Partial<ConditionRule>) => {
    const newConditions = [...value];
    newConditions[groupIndex].rules[ruleIndex] = {
      ...newConditions[groupIndex].rules[ruleIndex],
      ...updates,
    };
    onChange(newConditions);
  };

  const duplicateGroup = (groupIndex: number) => {
    const groupToDuplicate = value[groupIndex];
    const duplicatedGroup = JSON.parse(JSON.stringify(groupToDuplicate));
    onChange([...value, duplicatedGroup]);
  };

  const needsValue = (operator: string) => {
    return !['is_empty', 'is_not_empty'].includes(operator);
  };

  if (value.length === 0) {
    return (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            No conditions set. This action will execute for all bookings that trigger this workflow.
          </Typography>
        </Alert>
        
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={addConditionGroup}
        >
          Add Condition Group
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Conditions are evaluated as: (Group 1) AND (Group 2) AND (Group 3)...
        Within each group, rules are combined using the group operator.
      </Typography>

      {value.map((group, groupIndex) => (
        <Paper key={groupIndex} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Condition Group {groupIndex + 1}
            </Typography>
            
            <Box display="flex" gap={1}>
              <IconButton
                size="small"
                onClick={() => duplicateGroup(groupIndex)}
                title="Duplicate Group"
              >
                <ContentCopy />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => removeConditionGroup(groupIndex)}
                color="error"
                title="Delete Group"
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>

          <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
            <InputLabel>Group Operator</InputLabel>
            <Select
              value={group.operator}
              label="Group Operator"
              onChange={(e) => updateConditionGroup(groupIndex, { operator: e.target.value as 'AND' | 'OR' })}
            >
              <MenuItem value="AND">
                <Box>
                  <Typography variant="body2">AND</Typography>
                  <Typography variant="caption" color="text.secondary">
                    All rules must be true
                  </Typography>
                </Box>
              </MenuItem>
              <MenuItem value="OR">
                <Box>
                  <Typography variant="body2">OR</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Any rule can be true
                  </Typography>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>

          {group.rules.map((rule, ruleIndex) => (
            <Box key={ruleIndex} sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Field</InputLabel>
                  <Select
                    value={rule.field}
                    label="Field"
                    onChange={(e) => updateRule(groupIndex, ruleIndex, { field: e.target.value })}
                  >
                    {CONDITION_FIELDS.map((field) => (
                      <MenuItem key={field.value} value={field.value}>
                        {field.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Operator</InputLabel>
                  <Select
                    value={rule.operator}
                    label="Operator"
                    onChange={(e) => updateRule(groupIndex, ruleIndex, { operator: e.target.value as any })}
                  >
                    {CONDITION_OPERATORS.map((op) => (
                      <MenuItem key={op.value} value={op.value}>
                        {op.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {needsValue(rule.operator) && (
                  <TextField
                    size="small"
                    label="Value"
                    value={rule.value || ''}
                    onChange={(e) => updateRule(groupIndex, ruleIndex, { value: e.target.value })}
                    sx={{ minWidth: 150 }}
                  />
                )}

                <IconButton
                  size="small"
                  onClick={() => removeRule(groupIndex, ruleIndex)}
                  color="error"
                  disabled={group.rules.length === 1}
                >
                  <Delete />
                </IconButton>
              </Box>

              {ruleIndex < group.rules.length - 1 && (
                <Box display="flex" justifyContent="center" my={1}>
                  <Chip
                    label={group.operator}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          ))}

          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={() => addRule(groupIndex)}
          >
            Add Rule
          </Button>

          {groupIndex < value.length - 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Chip
                label="AND"
                color="secondary"
                variant="filled"
              />
            </Box>
          )}
        </Paper>
      ))}

      <Button
        variant="outlined"
        startIcon={<Add />}
        onClick={addConditionGroup}
        sx={{ mt: 1 }}
      >
        Add Condition Group
      </Button>
    </Box>
  );
};