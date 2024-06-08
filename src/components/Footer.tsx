import React from 'react';
import { Box, Typography, Link, Container, useTheme } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        mt: 'auto',
        backgroundColor: theme.palette.grey[200],
        textAlign: 'center',
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <GitHubIcon sx={{ mr: 1 }} />
        <Typography variant="body1">
          <Link
            href="https://github.com/SpiralOutDotEu/ethereum-smart-contract-interaction-tool"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 'bold' }}
          >
            Source on GitHub
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
