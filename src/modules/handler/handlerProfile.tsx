import { Button, DialogActions, DialogContent, DialogContentText, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import Label from "../../shared/components/Label";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import { useEffect, useState } from "react";
import DialogComponent from "../../shared/components/Dialog";
import { useMutation } from "@apollo/client";
import { DELETE_HANDLER } from "../../shared/graphQL/handler/queries";
import { useNavigate, useParams } from "react-router";

const HandlerProfileComponent = ({ handlerData }) => {
  const { id } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteProduct, { data: deleteProductData }] = useMutation(DELETE_HANDLER);

  if (!handlerData) {
    return null; // or return a placeholder or error message
  }

  useEffect(() => {
    setOpenDelete(false);
    if (deleteProductData) {
      navigate(`/handler`);
    }
  }, [deleteProductData]);

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
  };

  type Color = "error" | "info" | "secondary";
  const getStatusLabel = (status: "active" | "inactive" | "suspended"): JSX.Element => {
    let color = "";
    let text = "";
    switch (status) {
      case "active":
        text = "Active";
        color = "success";
        break;
      case "inactive":
        text = "Inactive";
        color = "secondary";
        break;
      case "suspended":
        text = "Suspended";
        color = "error";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  const handleDeleteClick = (row) => {
    setOpenDelete(true);
  };

  const handleClose = (rw) => {
    setOpenDelete(false);
  };

  const handleDelete = () => {
    deleteProduct({ variables: { id: { id: id } } });
  };

  return (
    <Box>
      <Box display="flex" justifyContent={"space-between"}>
        <Typography variant="h6" style={{ fontSize: 30, fontWeight: 700 }}>
          Details of {handlerData.name}
        </Typography>
        <IconButton
          sx={{
            "&:hover": { background: theme.colors.error.lighter },
            color: theme.palette.error.main,
          }}
          color="inherit"
          size="small"
          onClick={() => handleDeleteClick(handlerData)}
        >
          <DeleteTwoToneIcon fontSize="small" />
        </IconButton>
      </Box>

      <Paper elevation={3} sx={{ padding: 1.5 }}>
        <Grid container spacing={2} gap={3}>
          <Grid item xs={2} display="flex" flexDirection="column">
            <Box flexGrow={1} display="flex" flexDirection="column" sx={{ pe: 2 }}>
              <Paper style={{ marginBottom: "16px", height: 164, width: 164 }}>
                {handlerData.profile_image && <img src={handlerData.profile_image} alt="Sponsor" style={{ width: "100%", height: "100%" }} />}
              </Paper>
              <Typography variant="h6" style={{ fontSize: 16, fontWeight: 700, textAlign: "center" }}>
                {handlerData?.name ? handlerData?.name : ""}
              </Typography>
              <Typography variant="body1" style={{ textAlign: "center" }}>
                {getStatusLabel(handlerData.status) || "N/A"}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={9} sx={{ display: "flex", mt: 2 }}>
            <Grid container spacing={2} gap={2}>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Email Address:
                  </Typography>
                  <Typography variant="body1">{handlerData.email || "N/A"}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Handler ID:
                  </Typography>
                  <Typography variant="body1">{"WDF" + handlerData?.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", my: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontSize: 16, minWidth: 150 }}>
                    Created On:
                  </Typography>
                  <Typography variant="body1">{formatDate(handlerData.createdAt)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
      <DialogComponent
        open={openDelete}
        width={324}
        height={240}
        handleClose={handleClose}
        content={
          <DialogContent>
            <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Dog?</DialogContentText>
          </DialogContent>
        }
        actions={
          <DialogActions>
            <Button onClick={handleClose}>No</Button>
            <Button onClick={handleDelete} autoFocus>
              Yes
            </Button>
          </DialogActions>
        }
      />
    </Box>
  );
};

export default HandlerProfileComponent;
