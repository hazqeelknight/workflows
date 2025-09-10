import React, { useState, useRef } from 'react';
import {
  Box,
  Avatar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  PhotoCamera,
  Delete,
  MoreVert,
  CloudUpload,
  Image as ImageIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/core';

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
  isUploading?: boolean;
  uploadProgress?: number;
  label: string;
  size?: number;
  variant?: 'circular' | 'square';
  acceptedTypes?: string[];
  maxSizeMB?: number;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImage,
  onUpload,
  onRemove,
  isUploading = false,
  uploadProgress = 0,
  label,
  size = 120,
  variant = 'circular',
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxSizeMB = 5,
  placeholder,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setError(`Please select a valid image file (${acceptedTypes.join(', ')})`);
      return;
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Call upload handler
    onUpload(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    handleMenuClose();
  };

  const handleRemoveClick = () => {
    setPreviewUrl(null);
    setError(null);
    onRemove();
    handleMenuClose();
  };

  const displayImage = previewUrl || currentImage;

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={displayImage || undefined}
            sx={{
              width: size,
              height: size,
              ...(variant === 'square' && { borderRadius: 2 }),
              border: '3px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            {!displayImage && (
              <ImageIcon sx={{ fontSize: size * 0.4, color: 'text.secondary' }} />
            )}
          </Avatar>

          {/* Upload Progress Overlay */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.7)',
                  borderRadius: variant === 'circular' ? '50%' : 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <CloudUpload sx={{ color: 'white', fontSize: 32, mb: 1 }} />
                <Typography variant="caption" sx={{ color: 'white' }}>
                  {uploadProgress > 0 ? `${uploadProgress}%` : 'Uploading...'}
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Menu Button */}
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              position: 'absolute',
              bottom: -8,
              right: -8,
              backgroundColor: 'background.paper',
              border: '2px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'primary.main',
                borderColor: 'primary.main',
                color: 'white',
              },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {placeholder || `Upload a ${label.toLowerCase()} to personalize your profile`}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Supported formats: {acceptedTypes.map(type => type.split('/')[1]).join(', ').toUpperCase()}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Maximum size: {maxSizeMB}MB
          </Typography>
        </Box>
      </Box>

      {/* Upload Progress Bar */}
      {isUploading && uploadProgress > 0 && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={{ borderRadius: 1, height: 6 }}
          />
        </Box>
      )}

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
          },
        }}
      >
        <MenuItem onClick={handleUploadClick} disabled={isUploading}>
          <ListItemIcon>
            <PhotoCamera fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {currentImage ? 'Change Image' : 'Upload Image'}
          </ListItemText>
        </MenuItem>
        
        {currentImage && (
          <MenuItem onClick={handleRemoveClick} disabled={isUploading}>
            <ListItemIcon>
              <Delete fontSize="small" />
            </ListItemIcon>
            <ListItemText>Remove Image</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};