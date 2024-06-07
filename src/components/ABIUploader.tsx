import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Typography,
  TextField,
  Alert,
  Paper,
  Chip,
} from "@mui/material";
import { UploadFile as UploadFileIcon } from "@mui/icons-material";

interface ABIUploaderProps {
  onUpload: (abi: any) => void;
  warning: string | null;
  reset: () => void;
}

const ABIUploader: React.FC<ABIUploaderProps> = ({
  onUpload,
  warning,
  reset,
}) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [abiText, setAbiText] = useState<string>("");

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

  const handleAbiPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAbiText(value);
    try {
      const parsedAbi = JSON.parse(value);
      onUpload(parsedAbi);
    } catch (error) {
      // Handle JSON parse error
    }
  };

  const handleReset = () => {
    setFileContent(null);
    setAbiText("");
    reset();
  };

  return (
    <Box sx={{ textAlign: "center", marginBottom: 3 }}>
      {fileContent || abiText ? (
        <Box>
          <Chip label="ABI loaded" color="success" sx={{ marginBottom: 2 }} />
          <Typography>Press the button below to replace the ABI</Typography>
          <Button
            variant="contained"
            onClick={handleReset}
            sx={{ marginTop: 2 }}
          >
            Reset ABI
          </Button>
        </Box>
      ) : (
        <Box>
          <Paper
            {...getRootProps()}
            className="dropzone"
            elevation={3}
            sx={{ padding: 3, cursor: "pointer" }}
          >
            <input {...getInputProps()} />
            <UploadFileIcon fontSize="large" color="primary" />
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Drag & drop ABI file here, or click to select file
            </Typography>
          </Paper>
          <TextField
            label="Paste ABI JSON here"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={abiText}
            onChange={handleAbiPaste}
            sx={{ marginTop: 2 }}
          />
        </Box>
      )}
      {warning && (
        <Alert severity="warning" sx={{ marginTop: 2 }}>
          {warning}
        </Alert>
      )}
    </Box>
  );
};

export default ABIUploader;
