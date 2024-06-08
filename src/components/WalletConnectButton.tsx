import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Box, Chip } from '@mui/material';

const WalletConnectButton: React.FC<{ onWalletConnected: (address: string, network: string) => void }> = ({ onWalletConnected }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const network = await provider.getNetwork();
      setAddress(userAddress);
      setNetwork(network.name);
      onWalletConnected(userAddress, network.name);
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const userAddress = await signer.getAddress();
          const network = await provider.getNetwork();
          setAddress(userAddress);
          setNetwork(network.name);
          onWalletConnected(userAddress, network.name);
        }
      }
    };

    checkExistingConnection();
  }, [onWalletConnected]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-2)}`;
  };

  return (
    <Box display="flex" alignItems="center">
      {network && (
        <Chip label={network} color="primary" />
      )}
      <Button variant="contained" onClick={connectWallet} sx={{ marginRight: 2 }}>
        {address ? formatAddress(address) : 'Connect Wallet'}
      </Button>
      
    </Box>
  );
};

export default WalletConnectButton;