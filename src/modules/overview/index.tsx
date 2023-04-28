import { Box } from "@mui/material";
import { Helmet } from "react-helmet-async";

import { styled } from "@mui/material/styles";

const OverviewWrapper = styled(Box)(
  () => `
    overflow: auto;
    flex: 1;
    overflow-x: hidden;
    align-items: center;
`
);

function Overview() {
  return (
    <OverviewWrapper>
      <Helmet>
        <title>Lavabee Admin</title>
      </Helmet>
    </OverviewWrapper>
  );
}

export default Overview;
