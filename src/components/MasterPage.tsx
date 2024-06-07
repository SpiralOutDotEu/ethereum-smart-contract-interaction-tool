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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CodeGenerator from "./CodeGenerator";

const MasterPage: React.FC = () => {
  const [abi, setAbi] = useState<any[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>("");
  const [results, setResults] = useState<{ [key: string]: any }>({});

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
      setWarning("Please enter a valid contract address");
      return;
    }
    try {
      const args = func.inputs.map((input: any, index: number) => {
        const value = (
          document.getElementById(`${func.name}-${index}`) as HTMLInputElement
        ).value;
        return func.inputs[index].type === "uint256" ? BigInt(value) : value;
      });
      const result = await contract[func.name](...args);
      setResults((prevResults) => ({
        ...prevResults,
        [func.name]: JSON.stringify(result, (key, value) =>
          typeof value === "bigint" ? value.toString() : value
        ),
      }));
    } catch (error: unknown) {
      if (error instanceof Error) {
        setWarning(error.message);
      } else {
        setWarning("An unknown error occurred.");
      }
    }
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
                {results[item.name] && (
                  <Typography variant="body1" sx={{ marginTop: 2 }}>
                    Result: {results[item.name]}
                  </Typography>
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

  const handleWalletConnected = (address: string, network: string) => {
    // Logic to handle wallet connection
  };

  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
    }
  }, []);

  return (
    <Container>
      <AppBar position="static" sx={{ marginBottom: 3 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Fast Smart Contract Explorer
          </Typography>
          <WalletConnectButton onWalletConnected={handleWalletConnected} />
        </Toolbar>
      </AppBar>
      <Box sx={{ padding: 2 }}>
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Interact with any smart contract
        </Typography>
        <Typography
          variant="body1"
          className="description"
          sx={{ marginBottom: 2 }}
        >
          This app allows you to interact with Ethereum smart contracts by
          uploading their ABI and connecting to your wallet. You can call read
          and write functions on the contract directly from this interface.
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
           <Accordion className="code-generation-accordion" sx={{ marginTop: 2 }}>
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
