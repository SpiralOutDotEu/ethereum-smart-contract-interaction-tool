import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Box } from '@mui/material';
import { styled } from '@mui/system';

const StyledButton = styled(Button)({
  textTransform: 'none',
  marginLeft: '10px',
});

const NetworkButton = styled(Button)({
  textTransform: 'none',
  color: 'white',
  backgroundColor: '#1976d2',
});

const WalletConnectButton: React.FC = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [networkName, setNetworkName] = useState<string | null>(null);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
      } else {
        setAddress(null);
      }
    };

    const handleChainChanged = async (chainId: string) => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setNetworkName(network.name);
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', async (accounts: string[]) => {
        await handleAccountsChanged(accounts);
      });

      window.ethereum.on('chainChanged', async (chainId: string) => {
        await handleChainChanged(chainId);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setAddress(accounts[0]);

        const network = await provider.getNetwork();
        setNetworkName(network.name);
      } catch (error) {
        console.error(error);
      }
    } else {
      console.error('No Ethereum provider found. Install MetaMask.');
    }
  };

  const trimAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Box>
      {networkName && <NetworkButton variant="contained">{networkName}</NetworkButton>}
      <StyledButton variant="contained" onClick={connectWallet}>
        {address ? trimAddress(address) : 'Connect Wallet'}
      </StyledButton>
    </Box>
  );
};

export default WalletConnectButton;
