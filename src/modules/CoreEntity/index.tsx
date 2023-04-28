import { Button, Grid } from "@mui/material";
import { useState } from "react";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";

const CoreEntity = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  return (
    <Grid container justifyContent="end" alignItems="center" sx={{ ms: 2, mt: 2 }}>
      <Grid item>
        <Button sx={{ my: 2 }} variant="contained" onClick={handleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
          Add Collection
        </Button>
      </Grid>
    </Grid>
  );
};
export default CoreEntity;
