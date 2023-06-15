import { Box, DialogContentText, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import DialogComponent from "../../../../shared/components/Dialog";
import NoInternetGif from "../../../../assets/images/nointernet.gif";

const NoInternet = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const updateNetwork = () => {
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    console.log(isOnline);
    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
    };
  }, []);

  const handleCloseDialog = () => {
    setIsOnline(true);
  };

  return (
    <DialogComponent
      open={isOnline ? false : true}
      width={436}
      height={460}
      handleClose={handleCloseDialog}
      content={
        <Box display="flex" flexDirection="column" alignItems="center">
          <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600, textAlign: "center" }}>
            <img src={NoInternetGif} alt="GIF Image" />
            <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>No Internet</Typography>
          </DialogContentText>
        </Box>
      }
      actions={undefined}
    />
  );
};

export default NoInternet;
