import { Box, styled, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import Logoo from "../../../assets/images/logo.jpeg";

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.palette.text.primary};
        display: flex;
        text-decoration: none;
        width: 53px;
        margin: 0 auto;
        font-weight: ${theme.typography.fontWeightBold};
`
);

function Logo() {
  const theme = useTheme();

  return (
    <>
      <LogoWrapper to="/dashboards/overview">
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 50, md: 50 },
            maxWidth: { xs: 50, md: 50 },
          }}
          alt="logo"
          src={Logoo}
        />
      </LogoWrapper>
    </>
  );
}

export default Logo;
