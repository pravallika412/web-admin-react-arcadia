import { onError } from "@apollo/client/link/error";
import { Box, DialogContentText, Typography } from "@mui/material";
import React, { useState, useEffect } from "react";
import DialogComponent from "../../../../shared/components/Dialog";
import ServerErrorGif from "../../../../assets/images/servererror.gif";

// Network Error Dialog Component
const NetworkErrorDialog = ({ networkError, handleCloseDialog }) => {
  return (
    <DialogComponent
      open={networkError}
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
