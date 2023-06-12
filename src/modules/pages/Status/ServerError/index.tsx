import { onError } from "@apollo/client/link/error";
import { Box, DialogContentText, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import DialogComponent from "../../../../shared/components/Dialog";
import ServerErrorGif from "../../../../assets/images/servererror.gif";

// Network Error Dialog Component
const NetworkErrorDialog = () => {
  const [networkError, setNetworkError] = useState(false);

  useEffect(() => {
    onError(({ networkError }) => {
      if (networkError) {
        const match = networkError.message.match(/status code (\d+)/i);
        if (match && match[1] === "500") {
          setNetworkError(true);
        }
      }
    });
  }, []);

  if (!networkError) return null;

  const handleCloseDialog = () => {
    setNetworkError(true);
  };

  return (
    <DialogComponent
      open={networkError ? true : false}
      width={436}
      height={355}
      handleClose={handleCloseDialog}
      content={
        <Box display="flex" flexDirection="column" alignItems="center">
          <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600, textAlign: "center" }}>
            <img src={ServerErrorGif} alt="GIF Image" />
            <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>Server Error</Typography>
          </DialogContentText>
        </Box>
      }
      actions={undefined}
    />
  );
};

export default NetworkErrorDialog;
