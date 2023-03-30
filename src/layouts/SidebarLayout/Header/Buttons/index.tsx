import { Box } from '@mui/material';
import ConnectWallet from './ConnectWallet';
import HeaderNotifications from './Notifications';

function HeaderButtons() {
  return (
    <Box sx={{ mr: 1 }}>
      <Box sx={{ mx: 0.5 }} component="span">
        <ConnectWallet />
        <HeaderNotifications />
      </Box>
    </Box>
  );
}

export default HeaderButtons;
