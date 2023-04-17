import { Controller, useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import {
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
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
} from "@mui/material";
import { useMutation } from "@apollo/client";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { useEffect, useState } from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { useLazyQuery } from "@apollo/client";
import { makeStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";
import { CREATE_HANDLER, GET_HANDLERS, UPDATE_HANDLER } from "../../shared/graphQL/handler/queries";

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
  { id: "email", label: "Name", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "handling_products_count", label: "Product Count", minWidth: 170 },
  { id: "joining_date", label: "Joining Date", minWidth: 170 },
  { id: "action", label: "Action" },
];

const renewalPeriodOptions = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

const Handler = () => {
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [createHandler, { data: createHandlerData }] = useMutation(CREATE_HANDLER);
  const [updateSubscription, { data: updateSub }] = useMutation(UPDATE_HANDLER);
  const [getHandlers, { loading, error, data: getAllHandlers, refetch }] = useLazyQuery(GET_HANDLERS);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (uploadFile) {
      uploadImageFn(uploadFile, file);
    }
  }, [uploadFile]);

  useEffect(() => {
    getHandlers();
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
    if (updateSub) {
      refetch();
    }
  }, [updateSub]);

  const uploadImageFn = async (url, data) => {
    await fetch(url, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": data.type,
      },
    });
  };

  const onSubmit = (data) => {
    console.log(data);
    setUploadFile(data.planImage);
    let payload = {
      name: data.name,
      description: data.description,
      recurring: data.recurring === "yes" ? true : false,
      planImage: data.planImage,
      renewalPeriod: data.renewalPeriod,
      price: Number(data.price),
      renewalNumber: Number(data.renewalNumber),
      supportableProductCount: Number(data.supportableProductCount),
    };

    console.log("Add/Update Payload:", payload);
    if (isEditing) {
      let updatePayload = {
        planId: selectedData.planId,
        name: data.name,
        price: Number(data.price),
        supportableProductCount: Number(data.supportableProductCount),
      };
      updateSubscription({ variables: { input: updatePayload } });
    } else {
      createHandler({ variables: { input: payload } });
    }

    setOpen(false);
  };

  const handleEditClick = (row) => {
    // Handle edit click for the selected row
    let payload = {
      planId: row._id,
    };
    setIsEditing(true);
    setSelectedData(payload);
    setOpen(true);
  };

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    reset({});
  };

  const handleClose = () => {
    setOpen(false);
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

  // if (loading) return <SuspenseLoader />;

  // if (error) {
  //   return <h1>{error.message}</h1>;
  // }

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
                            <IconButton onClick={() => handleEditClick(product)}>
                              <EditIcon />
                            </IconButton>
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
                    message: "Please enter valid name",
                  },
                })}
              />
              <ErrorMessage errors={errors} name="email" render={({ message }) => <p>{message}</p>} />
            </div>

            <div>
              <TextField
                label="Official Email"
                name="officialEmail"
                margin="normal"
                required
                fullWidth
                {...register("officialEmail", {
                  required: {
                    value: true,
                    message: "Official Email is required",
                  },
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Please enter valid Email",
                  },
                })}
              />
              <ErrorMessage errors={errors} name="officialEmail" render={({ message }) => <p>{message}</p>} />
            </div>

            <div>
              <TextField
                {...register("password", {
                  required: {
                    value: true,
                    message: "Password is required",
                  },
                  pattern: {
                    value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[.@_])[A-Za-z0-9.@_]{8,}$/,
                    message: "Password requires atleast one uppercase, one lowercase, one digit and one special character",
                  },
                  minLength: {
                    value: 8,
                    message: "Password must be 8 characters long",
                  },
                })}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <ErrorMessage errors={errors} name="password" render={({ message }) => <span>{message}</span>} />
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
    </Container>
  );
};

export default Handler;
