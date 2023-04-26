import { Button, ListItemIcon } from "@mui/material";
import { useState } from "react";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MetamaskIcon from "../../../../../assets/images/Metamask.png";

function ConnectWallet() {
  const [showModal, setShowModal] = useState(false);
  const connectHandler = () => {
    setShowModal(true);
  };
  const handleClose = (value: string) => {
    setShowModal(false);
  };

  return (
    <>
      <Button variant="contained" onClick={connectHandler}>
        Connect
      </Button>
      <Dialog onClose={handleClose} open={showModal}>
        <DialogTitle>Choose Wallet</DialogTitle>
        <List sx={{ pt: 0 }}>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <img src={MetamaskIcon} alt="metamask" height={30} width={30} />
              </ListItemIcon>
              <ListItemText primary="Metamask" />
            </ListItemButton>
          </ListItem>
        </List>
      </Dialog>
    </>
  );
}

export default ConnectWallet;
