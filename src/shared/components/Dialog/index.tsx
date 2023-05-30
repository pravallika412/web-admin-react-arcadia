import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem, Select } from "@mui/material";
import { Box } from "@mui/system";
import CancelIcon from "@mui/icons-material/Cancel";

const DialogComponent = (props) => {
  const { open, width, height, handleClose, content, actions } = props;
  return (
    <Dialog
      open={open}
      PaperProps={{
        style: {
          width: width,
          height: height, // Ensure it does not exceed screen width
        },
      }}
    >
      <Box display="flex" justifyContent="flex-end" p={1} sx={{ overflow: "hidden" }}>
        <IconButton edge="end" color="primary" onClick={handleClose} aria-label="close">
          <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
        </IconButton>
      </Box>
      <DialogContent sx={{ overflow: "hidden" }}>{content}</DialogContent>
      <DialogActions>{actions}</DialogActions>
    </Dialog>
  );
};
export default DialogComponent;
