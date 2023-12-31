import { Box, styled, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import Logoo from "../../../assets/images/WDF.png";

const LogoWrapper = styled(Link)(
  ({ theme }) => `
        color: ${theme.palette.text.primary};
        display: flex;
        text-decoration: none;
        margin: 0 auto;
        font-weight: ${theme.typography.fontWeightBold};
`
);

function Logo() {
  return (
    <>
      <LogoWrapper to="/overview">
        <Box
          component="img"
          sx={{
            maxHeight: { xs: 50, md: 88 },
            maxWidth: { xs: 50, md: 88 },
          }}
          alt="logo"
          src={Logoo}
        />
      </LogoWrapper>
    </>
  );
}

export default Logo;
