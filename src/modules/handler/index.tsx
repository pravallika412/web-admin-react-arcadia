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
} from "@mui/material";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { makeStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER, DELETE_HANDLER } from "../../shared/graphQL/handler/queries";
import DeleteIcon from "@mui/icons-material/Delete";
import { DatePicker } from "@mui/lab";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  image: {
    maxWidth: 50,
    maxHeight: 50,
  },
});

const columns = [
  { id: "name", label: "Name", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "handling_products_count", label: "Product Count", minWidth: 170 },
  { id: "joining_date", label: "Joining Date", minWidth: 170 },
  { id: "action", label: "Action" },
];

const handlerStatus = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspend" },
];

const Handler = () => {
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

  return (
    <Container component="main">
      <Button onClick={handleOpen} sx={{ margin: 1 }} variant="contained">
        Add Handler
      </Button>
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
              {products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={product.id}>
                    {columns.map((column) => {
                      const value = product[column.id];
                      return (
                        <TableCell key={column.id}>
                          {column.id === "action" ? (
                            <>
                              <IconButton onClick={() => handleEditClick(product)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteClick(product)}>
                                <DeleteIcon />
                              </IconButton>
                            </>
                          ) : column.id === "joining_date" ? (
                            formatDate(value)
                          ) : (
                            value
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
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
        <DialogTitle id="scroll-dialog-title">{isEditing ? "Update Handler" : "Create Handler"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: 500 }}>
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
                defaultValue=""
                rules={!isEditing ? { required: "Joining Date is required" } : {}}
                render={({ field: { onChange, value } }) => (
                  <DatePicker
                    label="Joining Date"
                    value={value}
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
                    <TextField {...field} select label="Status" error={Boolean(error)} helperText={error?.message} fullWidth>
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
