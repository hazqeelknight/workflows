import React, { useState } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Add, Delete, Code } from '@mui/icons-material';
import { Button } from '@/components/core';
import { BOOKING_UPDATE_FIELDS } from '../types';

interface BookingUpdateFieldsEditorProps {
  value: Record<string, any>;
  onChange: (fields: Record<string, any>) => void;
}

export const BookingUpdateFieldsEditor: React.FC<BookingUpdateFieldsEditorProps> = ({
  value,
  onChange,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));

  const addField = () => {
    const availableFields = BOOKING_UPDATE_FIELDS.filter(
      field => !Object.keys(value).includes(field.value)
    );
    
    if (availableFields.length > 0) {
      const firstAvailable = availableFields[0];
      onChange({
        ...value,
        [firstAvailable.value]: firstAvailable.type === 'select' && firstAvailable.options 
          ? firstAvailable.options[0] 
          : '',
      });
    }
  };

  const updateField = (fieldName: string, newValue: any) => {
    onChange({
      ...value,
      [fieldName]: newValue,
    });
  };

  const removeField = (fieldName: string) => {
    const newFields = { ...value };
    delete newFields[fieldName];
    onChange(newFields);
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      onChange(parsed);
    } catch (error) {
      setJsonError('Invalid JSON format');
    }
  };

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setJsonError(null);
    } catch (error) {
      setJsonError('Cannot format invalid JSON');
    }
  };

  const getFieldConfig = (fieldName: string) => {
    return BOOKING_UPDATE_FIELDS.find(field => field.value === fieldName);
  };

  const renderFieldInput = (fieldName: string, fieldValue: any) => {
    const config = getFieldConfig(fieldName);
    if (!config) return null;

    switch (config.type) {
      case 'select':
        return (
          <FormControl size="small" sx={{ flex: 2 }}>
            <InputLabel>Value</InputLabel>
            <Select
              value={fieldValue}
              label="Value"
              onChange={(e) => updateField(fieldName, e.target.value)}
            >
              {config.options?.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      case 'json':
        return (
          <TextField
            size="small"
            label="Value (JSON)"
            value={typeof fieldValue === 'object' ? JSON.stringify(fieldValue) : fieldValue}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateField(fieldName, parsed);
              } catch {
                updateField(fieldName, e.target.value);
              }
            }}
            sx={{ flex: 2 }}
            multiline
            rows={2}
          />
        );
      default:
        return (
          <TextField
            size="small"
            label="Value"
            value={fieldValue}
            onChange={(e) => updateField(fieldName, e.target.value)}
            sx={{ flex: 2 }}
            type={config.type === 'url' ? 'url' : 'text'}
          />
        );
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Booking Fields to Update
      </Typography>
      
      <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Field Editor" />
          <Tab label="JSON Editor" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select which booking fields to update when this action executes
              </Typography>

              {Object.entries(value).map(([fieldName, fieldValue]) => {
                const config = getFieldConfig(fieldName);
                return (
                  <Box key={fieldName} display="flex" alignItems="center" gap={1} mb={2}>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                      {config?.label || fieldName}
                    </Typography>
                    
                    {renderFieldInput(fieldName, fieldValue)}

                    <IconButton
                      size="small"
                      onClick={() => removeField(fieldName)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                );
              })}

              {Object.keys(value).length === 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No fields selected for update. This action will not modify the booking.
                </Alert>
              )}

              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={addField}
                disabled={Object.keys(value).length >= BOOKING_UPDATE_FIELDS.length}
              >
                Add Field
              </Button>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Edit booking update fields as JSON
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Code />}
                  onClick={formatJson}
                >
                  Format JSON
                </Button>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={jsonText}
                onChange={(e) => handleJsonChange(e.target.value)}
                error={!!jsonError}
                helperText={jsonError}
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                  },
                }}
              />

              {jsonError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {jsonError}
                </Alert>
              )}
            </Box>
          )}
        </Box>
      </Paper>

      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Allowed Fields:</strong> status, cancellation_reason, meeting_link, meeting_id, meeting_password, custom_answers
        </Typography>
      </Alert>
    </Box>
  );
};