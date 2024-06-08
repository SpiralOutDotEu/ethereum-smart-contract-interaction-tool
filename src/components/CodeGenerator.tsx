import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Highlight from "react-highlight";

import "highlight.js/styles/github.css";

interface CodeGeneratorProps {
  abi: any[];
}

const CodeGenerator: React.FC<CodeGeneratorProps> = ({ abi }) => {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [language, setLanguage] = useState<"javascript" | "typescript">(
    "javascript"
  );
  const [inlineAbi, setInlineAbi] = useState<boolean>(false);

  useEffect(() => {
    if (abi.length > 0) {
      const code = generateCode(abi, language, inlineAbi);
      setGeneratedCode(code);
    } else {
      setGeneratedCode("");
    }
  }, [abi, language, inlineAbi]);

  const generateCode = (
    abi: any[],
    lang: "javascript" | "typescript",
    inlineAbi: boolean
  ): string => {
    const solidityToTsType = (solidityType: string): string => {
      const mapping: { [key: string]: string } = {
        uint: "BigInt",
        uint8: "number",
        uint16: "number",
        uint32: "number",
        uint64: "BigInt",
        uint128: "BigInt",
        uint256: "BigInt",
        int: "BigInt",
        int8: "number",
        int16: "number",
        int32: "number",
        int64: "BigInt",
        int128: "BigInt",
        int256: "BigInt",
        address: "string",
        bool: "boolean",
        string: "string",
        bytes: "string",
        bytes1: "string",
        bytes2: "string",
        bytes3: "string",
        bytes4: "string",
        bytes5: "string",
        bytes6: "string",
        bytes7: "string",
        bytes8: "string",
        bytes9: "string",
        bytes10: "string",
        bytes11: "string",
        bytes12: "string",
        bytes13: "string",
        bytes14: "string",
        bytes15: "string",
        bytes16: "string",
        bytes17: "string",
        bytes18: "string",
        bytes19: "string",
        bytes20: "string",
        bytes21: "string",
        bytes22: "string",
        bytes23: "string",
        bytes24: "string",
        bytes25: "string",
        bytes26: "string",
        bytes27: "string",
        bytes28: "string",
        bytes29: "string",
        bytes30: "string",
        bytes31: "string",
        bytes32: "string",
      };

      return mapping[solidityType] || "any";
    };

    let code = "";
    if (lang === "typescript") {
      code += `import React, { useState, useEffect } from 'react';\n`;
      code += `import { ethers } from 'ethers';\n\n`;
      code += `interface Props {\n`;
      code += `  contractAddress: string;\n`;
      code += `}\n\n`;
      code += `// remove this if you handle window error with another way\n`;
      code += `declare let window: any;\n\n`;
      if (inlineAbi) {
        code += `const abi = ${JSON.stringify(abi, null, 2)};\n\n`;
      } else {
        code += `import abi from './abi.json';\n\n`;
      }
      code += `const ContractComponent: React.FC<Props> = ({ contractAddress }) => {\n`;
    } else {
      code += `import React, { useState, useEffect } from 'react';\n`;
      code += `import { ethers } from 'ethers';\n\n`;
      if (inlineAbi) {
        code += `const abi = ${JSON.stringify(abi, null, 2)};\n\n`;
      } else {
        code += `import abi from './abi.json';\n\n`;
      }
      code += `const ContractComponent = ({ contractAddress }) => {\n`;
    }

    code += `  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);\n`;
    code += `  const [signer, setSigner] = useState<ethers.Signer | null>(null);\n`;
    code += `  const [contract, setContract] = useState<ethers.Contract | null>(null);\n`;
    code += `  const [results, setResults] = useState<Record<string, any>>({});\n`;
    code += `  const [walletAddress, setWalletAddress] = useState<string>("");\n\n`;

    code += `  useEffect(() => {\n`;
    code += `    if (window.ethereum) {\n`;
    code += `      const provider = new ethers.BrowserProvider(window.ethereum);\n`;
    code += `      setProvider(provider);\n`;
    code += `      provider.getSigner().then(signer => {\n`;
    code += `        setSigner(signer);\n`;
    code += `        signer.getAddress().then(address => {\n`;
    code += `          setWalletAddress(address);\n`;
    code += `        });\n`;
    code += `        const contractInstance = new ethers.Contract(contractAddress, abi, signer);\n`;
    code += `        setContract(contractInstance);\n`;
    code += `      });\n`;
    code += `    } else {\n`;
    code += `      alert('No wallet found. Please install MetaMask.');\n`;
    code += `    }\n`;
    code += `  }, [contractAddress]);\n\n`;

    code += `  const connectWallet = async () => {\n`;
    code += `    if (window.ethereum) {\n`;
    code += `      try {\n`;
    code += `        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });\n`;
    code += `        setWalletAddress(accounts[0]);\n`;
    code += `      } catch (error) {\n`;
    code += `        alert('Failed to connect wallet');\n`;
    code += `      }\n`;
    code += `    } else {\n`;
    code += `      alert('No wallet found. Please install MetaMask.');\n`;
    code += `    }\n`;
    code += `  };\n\n`;

    abi.forEach((item) => {
      if (item.type === "function") {
        code += `  const call${
          item.name.charAt(0).toUpperCase() + item.name.slice(1)
        } = async (${item.inputs
          .map(
            (input: { name: any; type: any }) =>
              `${input.name}: ${solidityToTsType(input.type)}`
          )
          .join(", ")}) => {\n`;
        code += `    try {\n`;
        code += `      if (contract) {\n`;
        code += `        const result = await contract.${
          item.name
        }(${item.inputs
          .map((input: { name: any; type: any }) => input.name)
          .join(", ")});\n`;
        code += `        if (result.wait) {\n`;
        code += `          alert('Waiting for transaction confirmation...');\n`;
        code += `          const tx = await result.wait();\n`;
        code += `          setResults((prevResults) => ({ ...prevResults, ${item.name}: tx.logs }));\n`;
        code += `        } else {\n`;
        code += `          setResults((prevResults) => ({ ...prevResults, ${item.name}: result }));\n`;
        code += `        }\n`;
        code += `      }\n`;
        code += `    } catch (error: any) {\n`;
        code += `      alert('Error: ' + error.message);\n`;
        code += `    }\n`;
        code += `  }\n\n`;
      }
    });

    code += `  const stringifyResult = (result: any) => {\n`;
    code += `    return JSON.stringify(result, (key, value) =>\n`;
    code += `      typeof value === 'bigint' ? value.toString() : value\n`;
    code += `    );\n`;
    code += `  };\n\n`;

    code += `  return (\n`;
    code += `    <div>\n`;
    code += `      <button onClick={connectWallet}>\n`;
    code += `        {walletAddress ? \`Connected: \${walletAddress.slice(0, 6)}...\${walletAddress.slice(-4)}\` : 'Connect Wallet'}\n`;
    code += `      </button>\n\n`;
    abi.forEach((item) => {
      if (item.type === "function") {
        code += `      <div>\n`;
        item.inputs.forEach((input: { name: string; type: string }) => {
          code += `        <label>${input.name}:</label>\n`;
          code += `        <input type="text" id="${item.name}-${input.name}" />\n`;
        });
        code += `        <button onClick={() => call${
          item.name.charAt(0).toUpperCase() + item.name.slice(1)
        }(${item.inputs
          .map((input: { name: any; type: string }) => {
            const elementId = `${item.name}-${input.name}`;
            return input.type === "BigInt" ||
              input.type === "uint" ||
              input.type === "uint256" ||
              input.type === "int" ||
              input.type === "int256"
              ? `BigInt((document.getElementById('${elementId}') as HTMLInputElement)?.value || '0')`
              : `(document.getElementById('${elementId}') as HTMLInputElement)?.value || ''`;
          })
          .join(", ")})}>\n`;
        code += `          Call ${item.name}\n`;
        code += `        </button>\n`;
        code += `        {results.${item.name} && (\n`;
        code += `          <p>\n`;
        code += `            Result: {stringifyResult(results.${item.name})}\n`;
        code += `          </p>\n`;
        code += `        )}\n`;
        code += `      </div>\n`;
      }
    });
    code += `    </div>\n`;
    code += `  );\n`;
    code += `}\n\n`;
    code += `export default ContractComponent;\n`;

    return code;
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedCode], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `ContractComponent.${
      language === "typescript" ? "tsx" : "js"
    }`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <Box sx={{ marginTop: 3 }}>
      <FormControl fullWidth>
        <InputLabel>Language</InputLabel>
        <Select
          value={language}
          onChange={(e) =>
            setLanguage(e.target.value as "javascript" | "typescript")
          }
        >
          <MenuItem value="javascript">JavaScript</MenuItem>
          <MenuItem value="typescript">TypeScript</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        control={
          <Switch
            checked={inlineAbi}
            onChange={() => setInlineAbi(!inlineAbi)}
          />
        }
        label="Inline ABI"
        sx={{ marginTop: 2 }}
      />
      {abi.length > 0 && (
        <Accordion sx={{ marginTop: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Generated React Component Code</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Highlight className={language}>{generatedCode}</Highlight>
          </AccordionDetails>
        </Accordion>
      )}
      <Box display="flex" justifyContent="space-between" sx={{ marginTop: 2 }}>
        <CopyToClipboard text={generatedCode}>
          <Button variant="contained">Copy to Clipboard</Button>
        </CopyToClipboard>
        <Button variant="contained" onClick={downloadCode}>
          Download Code
        </Button>
      </Box>
    </Box>
  );
};

export default CodeGenerator;
