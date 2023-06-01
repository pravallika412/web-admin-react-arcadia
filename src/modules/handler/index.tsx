import { Controller, useForm } from "react-hook-form";
import {
  MenuItem,
  TextField,
  Button,
  Box,
  Container,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  IconButton,
  DialogContentText,
  useTheme,
  Grid,
  Typography,
  InputAdornment,
  Skeleton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER, DELETE_HANDLER } from "../../shared/graphQL/handler/queries";
import { DatePicker } from "@mui/lab";
import Label from "../../shared/components/Label";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import SharedTable from "../../shared/components/Table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router";

const columns = [
  { id: "name", label: "Handler Name", minWidth: 170 },
  { id: "email", label: "Email Address", minWidth: 170 },
  { id: "createdAt", label: "Created On", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "action", label: "Action", minWidth: 170 },
];

const handlerStatus = [
  { value: "inactive", label: "Select Status" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspend" },
];

const Handler = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [openDelete, setOpenDelete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openHandlerStatus, setOpenHandlerStatus] = useState(false);
  const [createHandler, { data: createHandlerData, loading: addHandlerLoader }] = useMutation(CREATE_HANDLER);
  const [updateHandler, { data: updateHandlerData, loading: updateHandlerLoader }] = useMutation(UPDATE_HANDLER);
  const [deleteHandler, { data: deleteHandlerData }] = useMutation(DELETE_HANDLER);
  const [getHandlers, { data: getAllHandlers, loading: handlerLoader, refetch }] = useLazyQuery(GET_HANDLERS);
  const navigate = useNavigate();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    getHandlers({ variables: { input: {} } });
  }, []);

  useEffect(() => {
    if (getAllHandlers) {
      setProducts(getAllHandlers.listHandlers.handlers);
      setTotalCount(getAllHandlers.listHandlers.totalCount);
    }
  }, [getAllHandlers]);

  useEffect(() => {
    if (createHandlerData) {
      setOpen(false);
      setIsDeleting(false);
      setOpenHandlerStatus(true);
      refetch();
    }
  }, [createHandlerData]);

  useEffect(() => {
    if (updateHandlerData) {
      setOpen(false);
      setIsDeleting(false);
      setOpenHandlerStatus(true);
      refetch();
    }
  }, [updateHandlerData]);

  useEffect(() => {
    if (deleteHandlerData) {
      setIsDeleting(true);
      setOpenDelete(false);
      setOpenHandlerStatus(true);
      refetch();
    }
  }, [deleteHandlerData]);

  const handleDelete = () => {
    deleteHandler({ variables: { id: { id: deleteId } } });
    setOpenDelete(false);
  };

  const onSubmit = (data) => {
    let joiningDate = new Date(data.joiningDate);
    let payload = {
      name: data.name,
      email: data.email,
      status: data.status,
    };
    if (isEditing) {
      updateHandler({ variables: { id: { id: selectedData }, input: payload } });
    } else {
      createHandler({ variables: { input: payload } });
    }
  };

  const handleEditClick = (row) => {
    let editData = getAllHandlers.listHandlers.handlers.filter((e) => e.id === row.id)[0];
    let updatepayload = {
      name: editData.name,
      email: editData.email,
      joiningDate: formatDate(editData.joining_date),
      status: editData.status,
    };
    reset(updatepayload);
    setIsEditing(true);
    setSelectedData(row.id);
    setOpen(true);
  };

  const handleDeleteClick = (row) => {
    console.log(row);
    setDeleteId(row.id);
    setOpenDelete(true);
  };

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    reset({});
  };

  const handleClose = () => {
    setOpen(false);
    setOpenDelete(false);
    setSelectedData(null);
    reset();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  const handleRowClick = (id) => {
    console.log(id);
    navigate(`/handlerdetails/${id}`);
  };

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
        color = "info";
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

  const handleClickOpen = (product) => {
    console.log(product);
  };

  const handleHandlerStatusClose = () => {
    setOpenHandlerStatus(false);
  };

  const formattedData = products.map((row) => {
    let imageUrl = row.profile_image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
      id: row.id,
      name: (
        <>
          <div style={{ display: "flex" }}>
            {imageUrl ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundImage: "linear-gradient(to right, rgba(85, 105, 255, 1), rgba(30, 136, 229, 1), rgba(52, 163, 83, 1))",
                  borderRadius: "50%",
                  padding: "2px",
                  width: "50px",
                  height: "50px",
                }}
              >
                <img src={imageUrl} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt={row.name} />
              </div>
            ) : (
              ""
            )}
            <div style={{ alignItems: "center", paddingTop: "15px", paddingLeft: "10px" }}>
              <strong>{row.name ? row.name : "N/A"}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.product}</Typography>
            </div>
          </div>
        </>
      ),
      email: row.email ? row.email : "",
      createdAt: formatDate(row.createdAt),
      status: row.status ? getStatusLabel(row.status) : "",
      action: (
        <>
          <Tooltip title="View">
            <IconButton onClick={() => handleClickOpen(row)}>
              <VisibilityIcon color="primary" />
            </IconButton>
          </Tooltip>
        </>
      ),
    };
  });

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Handlers
          </Typography>
        </Grid>
        <Grid item>
          <Button sx={{ my: 2 }} variant="contained" onClick={handleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
            Add Handler
          </Button>
        </Grid>
      </Grid>

      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={handlerLoader}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchFilter={undefined}
        onSearch={undefined}
        searchFilterVisible={false}
        selectableRows={true}
        onRowClick={handleRowClick}
      ></SharedTable>
      <Dialog open={open} onClose={handleClose} scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle id="scroll-dialog-title" sx={{ padding: "16px 24px 0px 16px" }}>
          {isEditing ? "Update Handler" : "Create Handler"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: 500 }}>
          <DialogContent>
            <div>
              <TextField
                label="Name"
                name="name"
                margin="normal"
                required
                fullWidth
                {...register("name", {
                  required: {
                    value: true,
                    message: "Name is required",
                  },
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid name",
                  },
                  maxLength: {
                    value: 15,
                    message: "Max length exceeded",
                  },
                })}
                error={!!errors.name}
                helperText={errors?.name?.message}
              />
            </div>

            <div>
              <TextField
                label="Email"
                name="email"
                margin="normal"
                required
                fullWidth
                {...register("email", {
                  required: {
                    value: true,
                    message: "Email is required",
                  },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter valid Email",
                  },
                })}
                error={!!errors.email}
                helperText={errors?.email?.message}
              />
            </div>

            <div>
              {isEditing && (
                <Controller
                  name="status"
                  control={control}
                  defaultValue=""
                  rules={!isEditing ? { required: "Status is required" } : {}}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select label="Status" sx={{ mt: 1 }} error={Boolean(error)} helperText={error?.message} fullWidth>
                      {handlerStatus.map((option) => {
                        if (option.value === "inactive") {
                          return (
                            <MenuItem key={option.value} value={option.value} disabled>
                              {option.label}
                            </MenuItem>
                          ); // don't render MenuItem if option value is "inactive"
                        }
                        return (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )}
                />
              )}
            </div>
          </DialogContent>

          <DialogActions>
            <Button type="submit" variant="contained" disabled={addHandlerLoader || updateHandlerLoader}>
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
          {(addHandlerLoader || updateHandlerLoader) && <SuspenseLoader left="0%" />}
        </Box>
      </Dialog>
      <Dialog open={openDelete} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: 400, height: 300 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <DeleteIcon sx={{ fontSize: 70, m: 2, color: "rgba(204, 43, 53, 1)" }} />
            <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>Delete</Typography>
            <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600 }}>
              Are you sure you want to delete this Handler? Deleting will remove all handler details, but posts uploaded by the handler will remain.
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" sx={{ background: "rgba(204, 43, 53, 1)" }} onClick={handleDelete} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openHandlerStatus} onClose={handleHandlerStatusClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box display="flex" justifyContent="flex-end" p={1} sx={{ overflow: "hidden" }}>
          <IconButton edge="end" color="primary" onClick={handleHandlerStatusClose} aria-label="close">
            <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ width: 324, height: 240 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 70, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong>Handler {isDeleting ? "Deleted" : isEditing ? "Updated" : "Created"} Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Handler;
