import { Alert, Snackbar } from "@mui/material";

const SnackbarComponent = (props) => {
  return (
    <Snackbar open={props.open} autoHideDuration={6000}>
      <Alert severity="error" sx={{ width: "100%" }}>
        {props.message}
      </Alert>
    </Snackbar>
  );
};
export default SnackbarComponent;
