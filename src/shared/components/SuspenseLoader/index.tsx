import { useEffect } from "react";
import NProgress from "nprogress";
import { Box, CircularProgress } from "@mui/material";

function SuspenseLoader(props) {
  useEffect(() => {
    NProgress.start();

    return () => {
      NProgress.done();
    };
  }, []);

  return (
    <Box
      sx={{
        position: "fixed",
        left: props.left,
        top: 0,
        width: "100%",
        height: "100%",
      }}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress size={64} disableShrink thickness={3} />
    </Box>
  );
}

export default SuspenseLoader;
