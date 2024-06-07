// src/components/WalletConnectButton.tsx
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Box } from '@mui/material';

const WalletConnectButton: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      const network = await provider.getNetwork();
      setNetwork(network.name);
    } else {
      alert('Please install MetaMask!');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-2)}`;
  };

  return (
    <Box display="flex" alignItems="center">
      <Button variant="contained" onClick={connectWallet} sx={{ marginRight: 2 }}>
        {address ? formatAddress(address) : 'Connect Wallet'}
      </Button>
      {network && (
        <Button variant="outlined">
          {network}
        </Button>
      )}
    </Box>
  );
};

export default WalletConnectButton;
