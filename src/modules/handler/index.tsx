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

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 170 },
  { id: "handling_products_count", label: "Product Count", minWidth: 170 },
  { id: "joining_date", label: "Joining Date", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "action", label: "Action" },
];

const handlerStatus = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspend" },
];

const Handler = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [createHandler, { data: createHandlerData }] = useMutation(CREATE_HANDLER);
  const [updateHandler, { data: updateHandlerData }] = useMutation(UPDATE_HANDLER);
  const [deleteHandler, { data: deleteHandlerData }] = useMutation(DELETE_HANDLER);
  const [getHandlers, { data: getAllHandlers, refetch }] = useLazyQuery(GET_HANDLERS);

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
    }
  }, [getAllHandlers]);

  useEffect(() => {
    if (createHandlerData) {
      refetch();
    }
  }, [createHandlerData]);

  useEffect(() => {
    if (updateHandlerData) {
      refetch();
    }
  }, [updateHandlerData]);

  useEffect(() => {
    if (deleteHandlerData) {
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
      password: data.password,
      joiningDate: joiningDate.getFullYear() + "-" + (joiningDate.getMonth() + 1) + "-" + joiningDate.getDate(),
      status: data.status,
    };
    if (isEditing) {
      updateHandler({ variables: { id: { id: selectedData }, input: payload } });
    } else {
      createHandler({ variables: { input: payload } });
    }

    setOpen(false);
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

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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

      <Paper>
        <TableContainer>
          <Table aria-label="Product table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {products.length > 0 ? (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                  return (
                    <TableRow hover tabIndex={-1} key={product.id}>
                      {columns.map((column) => {
                        const value = product[column.id];
                        return (
                          <TableCell key={column.id}>
                            {column.id === "action" ? (
                              <>
                                <IconButton
                                  sx={{
                                    "&:hover": {
                                      background: theme.colors.primary.lighter,
                                    },
                                    color: theme.palette.primary.main,
                                  }}
                                  color="inherit"
                                  size="small"
                                  onClick={() => handleEditClick(product)}
                                >
                                  <EditTwoToneIcon fontSize="small" sx={{ color: "#0481D9" }} />
                                </IconButton>
                                <IconButton
                                  sx={{
                                    "&:hover": { background: theme.colors.error.lighter },
                                    color: theme.palette.error.main,
                                  }}
                                  color="inherit"
                                  size="small"
                                  onClick={() => handleDeleteClick(product)}
                                >
                                  <DeleteTwoToneIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : column.id === "joining_date" ? (
                              formatDate(value)
                            ) : column.id === "handling_products_count" ? (
                              value == null ? (
                                0
                              ) : (
                                value
                              )
                            ) : column.id === "status" ? (
                              getStatusLabel(value)
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell align="center" colSpan={6}>
                    No results found!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={products.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
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
              <TextField
                {...register(
                  "password",
                  !isEditing
                    ? {
                        required: {
                          value: true,
                          message: "Password is required",
                        },
                        pattern: {
                          value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[.@_])[A-Za-z0-9.@_]{8,}$/,
                          message: "Password requires atleast one uppercase, one lowercase, one digit and one special character",
                        },
                        minLength: {
                          value: 8,
                          message: "Password must be 8 characters long",
                        },
                      }
                    : {}
                )}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                error={!!errors.password}
                helperText={errors?.password?.message}
              />
            </div>
            <div>
              <Controller
                name="joiningDate"
                control={control}
                defaultValue={null}
                rules={
                  !isEditing
                    ? {
                        required: "Joining Date is required",
                        validate: (value) => {
                          const date = new Date(value).getTime();
                          if (isNaN(date)) {
                            console.log(date);
                            return "Invalid date format";
                          } else if (date == 0) {
                            return "Please enter joining date";
                          }
                        },
                      }
                    : {}
                }
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Joining Date"
                    value={value}
                    disablePast={!isEditing ? true : false}
                    onChange={(date) => onChange(formatDate(date))}
                    renderInput={(params) => <TextField {...params} margin="normal" fullWidth error={Boolean(errors?.joiningDate)} helperText={errors?.joiningDate?.message} />}
                  />
                )}
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
                      {handlerStatus.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={openDelete} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title">Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Handler?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button onClick={handleDelete} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Handler;