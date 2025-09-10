import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { Add, Delete, Code, Preview } from '@mui/icons-material';
import { Button } from '@/components/core';

interface WebhookDataEditorProps {
  value: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export const WebhookDataEditor: React.FC<WebhookDataEditorProps> = ({
  value,
  onChange,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [jsonText, setJsonText] = useState(() => JSON.stringify(value, null, 2));

  const addKeyValuePair = () => {
    onChange({
      ...value,
      [`key_${Date.now()}`]: '',
    });
  };

  const updateKeyValuePair = (oldKey: string, newKey: string, newValue: any) => {
    const newData = { ...value };
    delete newData[oldKey];
    newData[newKey] = newValue;
    onChange(newData);
  };

  const removeKeyValuePair = (key: string) => {
    const newData = { ...value };
    delete newData[key];
    onChange(newData);
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

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Webhook Data (Optional)
      </Typography>
      
      <Paper sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Key-Value Editor" />
          <Tab label="JSON Editor" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {tabValue === 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add custom data to include in the webhook payload
              </Typography>

              {Object.entries(value).map(([key, val]) => (
                <Box key={key} display="flex" alignItems="center" gap={1} mb={1}>
                  <TextField
                    size="small"
                    label="Key"
                    value={key}
                    onChange={(e) => updateKeyValuePair(key, e.target.value, val)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Value"
                    value={val}
                    onChange={(e) => updateKeyValuePair(key, key, e.target.value)}
                    sx={{ flex: 2 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removeKeyValuePair(key)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}

              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={addKeyValuePair}
                sx={{ mt: 1 }}
              >
                Add Field
              </Button>
            </Box>
          )}

          {tabValue === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" color="text.secondary">
                  Edit webhook data as JSON
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
          <strong>Available Variables:</strong> You can use template variables like {{`{{invitee_name}}`}}, {{`{{event_type_name}}`}}, etc. in your webhook data values.
        </Typography>
      </Alert>
    </Box>
  );
};