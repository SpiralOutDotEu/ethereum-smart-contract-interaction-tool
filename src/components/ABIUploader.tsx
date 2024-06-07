import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Button, Typography, TextField, Alert } from '@mui/material';

interface ABIUploaderProps {
  onUpload: (abi: any) => void;
  onAddressSubmit: (address: string) => void;
  warning: string | null;
}

const ABIUploader: React.FC<ABIUploaderProps> = ({ onUpload, onAddressSubmit, warning }) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [abiText, setAbiText] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      const content = reader.result as string;
      setFileContent(content);
      onUpload(JSON.parse(content));
    };
    reader.readAsText(file);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleAbiPaste = () => {
    try {
      const parsedAbi = JSON.parse(abiText);
      onUpload(parsedAbi);
    } catch (error) {
      alert('Invalid ABI JSON');
    }
  };

  return (
    <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
      <Box {...getRootProps()} className="dropzone">
        <input {...getInputProps()} />
        <Typography variant="h6">Drag & drop ABI file here, or click to select file</Typography>
        {fileContent && <Typography variant="body1">File uploaded</Typography>}
      </Box>
      <TextField
        label="Paste ABI JSON here"
        multiline
        rows={4}
        fullWidth
        variant="outlined"
        value={abiText}
        onChange={(e) => setAbiText(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Button variant="contained" onClick={handleAbiPaste} sx={{ marginBottom: 2 }}>
        Submit ABI
      </Button>
      {warning && <Alert severity="warning" sx={{ marginTop: 2 }}>{warning}</Alert>}
    </Box>
  );
};

export default ABIUploader;