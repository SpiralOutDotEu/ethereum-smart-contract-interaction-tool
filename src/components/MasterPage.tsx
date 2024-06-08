import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import ABIUploader from "./ABIUploader";
import WalletConnectButton from "./WalletConnectButton";
import {
  Container,
  Box,
  Typography,
  TextField,
  AppBar,
  Toolbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Button,
  CircularProgress,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeGenerator from "./CodeGenerator";
import Highlight from "react-highlight";
import 'highlight.js/styles/github.css';

const MasterPage: React.FC = () => {
  const [abi, setAbi] = useState<any[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});

  const isErrorWithMessage = (error: unknown): error is Error => {
    return (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as Error).message === "string"
    );
  };

  const handleABIUpload = (uploadedAbi: any) => {
    setAbi(uploadedAbi);
    setWarning(null);
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setContractAddress(address);
    if (provider && abi.length > 0) {
      provider.getSigner().then((signer) => {
        const contractInstance = new ethers.Contract(address, abi, signer);
        setContract(contractInstance);
      });
    }
  };

  const handleFunctionCall = async (func: any) => {
    if (!contract) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [func.name]: "Please enter a valid contract address",
      }));
      return;
    }
    setLoading((prevLoading) => ({ ...prevLoading, [func.name]: true }));
    setErrors((prevErrors) => ({ ...prevErrors, [func.name]: null }));
    setResults((prevResults) => ({ ...prevResults, [func.name]: null })); // Clear previous results

    try {
      const args = func.inputs.map((input: any, index: number) => {
        const value = (
          document.getElementById(`${func.name}-${index}`) as HTMLInputElement
        ).value;
        return func.inputs[index].type === "uint256" ? BigInt(value) : value;
      });

      const result = await contract[func.name](...args);

      if (result.wait) {
        const receipt = await result.wait();
        setResults((prevResults) => ({
          ...prevResults,
          [func.name]: JSON.stringify(receipt, (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2),
        }));
      } else {
        setResults((prevResults) => ({
          ...prevResults,
          [func.name]: JSON.stringify(result, (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
          2),
        }));
      }
    } catch (error) {
      if (isErrorWithMessage(error)) {
        const errorMessage = error.message;
        setErrors((prevErrors) => ({ ...prevErrors, [func.name]: errorMessage }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [func.name]: "An unknown error occurred.",
        }));
      }
    }
    setLoading((prevLoading) => ({ ...prevLoading, [func.name]: false }));
  };

  const renderComponents = () => {
    return abi.map((item) => {
      if (item.type === "function") {
        const functionType =
          item.stateMutability === "view" || item.stateMutability === "pure"
            ? "Read"
            : "Write";
        return (
          <Accordion
            key={item.name}
            className="accordion"
            sx={{ marginTop: 2 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              className="accordion-summary"
            >
              <Typography>{`${functionType} Function: ${item.name}`}</Typography>
            </AccordionSummary>
            <AccordionDetails className="accordion-details">
              <Box sx={{ marginBottom: 2 }}>
                {item.inputs.map((input: any, index: number) => (
                  <TextField
                    key={index}
                    id={`${item.name}-${index}`}
                    label={input.name}
                    variant="outlined"
                    sx={{ marginBottom: 1 }}
                    fullWidth
                  />
                ))}
                <Button
                  variant="contained"
                  onClick={() => handleFunctionCall(item)}
                  sx={{ marginTop: 2 }}
                >
                  Call {item.name}
                </Button>
                {loading[item.name] && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: 2,
                    }}
                  >
                    <CircularProgress />
                  </Box>
                )}
                {errors[item.name] && (
                  <Alert severity="error" sx={{ marginTop: 2 }}>
                    {errors[item.name]}
                  </Alert>
                )}
                {results[item.name] && (
                  <Box className="result-box">
                    <Typography variant="body1">Result:</Typography>
                    <Highlight className="json">{results[item.name]}</Highlight>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      }
      return null;
    });
  };

  const handleReset = () => {
    setAbi([]);
    setContract(null);
    setResults({});
    setWarning(null);
    setContractAddress("");
  };

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    } else {
      setWarning("No Ethereum provider found. Please install MetaMask.");
    }
  }, []);

  return (
    <Container>
      <AppBar position="static" sx={{ marginBottom: 3 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Ethereum Smart Contract Interaction Tool
          </Typography>
          <WalletConnectButton />
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Interact with Ethereum Smart Contracts and Generate Code
        </Typography>
        <Typography
          variant="body1"
          className="description"
          sx={{ marginBottom: 2 }}
        >
          This application allows you to interact with Ethereum smart contracts by uploading their ABI, connecting to your wallet, and calling read and write functions on the contract directly from this interface. Additionally, you can generate a React component for your ABI to copy or download.
        </Typography>
        <ABIUploader
          onUpload={handleABIUpload}
          warning={warning}
          reset={handleReset}
        />
        <TextField
          label="Contract Address"
          fullWidth
          variant="outlined"
          value={contractAddress}
          onChange={handleAddressChange}
          sx={{ marginBottom: 2 }}
        />
        {warning && <Alert severity="warning">{warning}</Alert>}
        {abi.length > 0 && (
          <Accordion
            className="code-generation-accordion"
            sx={{ marginTop: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Code Generation</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <CodeGenerator abi={abi} />
            </AccordionDetails>
          </Accordion>
        )}
        {renderComponents()}
      </Box>
    </Container>
  );
};

export default MasterPage;
