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
import { CREATE_PRODUCT, DELETE_PRODUCT, GET_PRODUCTS, UPDATE_PRODUCT } from "../../shared/graphQL/dog/queries";
import DeleteIcon from "@mui/icons-material/Delete";
import { yupResolver } from "@hookform/resolvers/yup";
import { DogValidationSchema } from "../../shared/utilities/dogValidationSchema";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";

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
  { id: "service", label: "Service", minWidth: 170 },
  { id: "status", label: "Status", minWidth: 170 },
  { id: "handlers_count", label: "Handlers Count", minWidth: 170 },
  { id: "breed_name", label: "Breed Name", minWidth: 170 },
  { id: "action", label: "Action" },
];

const Dog = () => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [uploadFile, setUploadFile] = useState("");
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [suspendId, setSuspendId] = useState(null);
  const [createHandler, { data: createHandlerData }] = useMutation(CREATE_PRODUCT);
  const [updateHandler, { data: updateHandlerData }] = useMutation(UPDATE_PRODUCT);
  const [deleteHandler, { data: deleteHandlerData }] = useMutation(DELETE_PRODUCT);
  const [getProducts, { data: getAllProducts, refetch }] = useLazyQuery(GET_PRODUCTS);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(DogValidationSchema) });

  useEffect(() => {
    getProducts({ variables: { input: {} } });
  }, []);

  useEffect(() => {
    if (getAllProducts) {
      setProducts(getAllProducts.listProducts.products);
    }
  }, [getAllProducts]);

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

  useEffect(() => {
    if (createPresignedUrl) {
      setUploadFile(createPresignedUrl.GeneratePresignedUrl.presignedUrl);
    }
  }, [createPresignedUrl]);

  useEffect(() => {
    if (uploadFile) {
      uploadImageFn(uploadFile, file);
    }
  }, [uploadFile]);

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

    setOpen(false);
  };

  const handleEditClick = (row) => {
    let editData = getAllProducts.listHandlers.handlers.filter((e) => e.id === row.id)[0];
    let updatepayload = {
      email: editData.email,
      officialEmail: editData.official_email,
    };
    reset(updatepayload);
    setIsEditing(true);
    setSelectedData(row.id);
    setOpen(true);
  };

  const handleDelete = () => {
    deleteHandler({ variables: { id: { id: suspendId } } });
    setOpenDelete(false);
  };

  const handleSuspendClick = (row) => {
    setSuspendId(row.id);
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

  const handleFileChange = (event: any) => {
    event.preventDefault();
    setFile(event.target.files[0]);
    let payload = {
      fileName: event.target.files[0].name,
      fileType: event.target.files[0].type,
      filePath: "sponsor",
    };
    generatePresignedUrl({ variables: { input: payload } });
  };

  return (
    <Container component="main">
      <Button onClick={handleOpen} sx={{ margin: 1 }} variant="contained">
        Add Dog
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
              {products.length > 0 ? (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
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
                                <IconButton onClick={() => handleSuspendClick(product)}>
                                  <DeleteIcon />
                                </IconButton>
                              </>
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
        <DialogTitle id="scroll-dialog-title">{isEditing ? "Update Handler" : "Create Handler"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: 500 }}>
          <DialogContent>
            <div>
              <TextField label="Name" margin="normal" required fullWidth {...register("name")} error={!!errors.name} helperText={errors.name?.message} />
            </div>
            <div>
              <TextField label="Service" margin="normal" defaultValue="" required fullWidth select {...register("service")} error={!!errors.service} helperText={errors.service?.message}>
                <MenuItem value="navy">Navy</MenuItem>
                <MenuItem value="army">Army</MenuItem>
              </TextField>
            </div>
            <div>
              <TextField
                label="Photo URL"
                name="photo_url"
                margin="normal"
                type="file"
                required
                fullWidth
                {...register("photo_url", {
                  onChange: (e) => handleFileChange(e),
                  required: {
                    value: true,
                    message: "This is required",
                  },
                })}
                InputLabelProps={{ shrink: true }}
                error={!!errors.photo_url}
                helperText={errors?.photo_url?.message}
              />
            </div>
            <Controller
              name="file"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <TextField
                  onChange={(e) => handleFileChange(e)}
                  {...field}
                  label="Upload File"
                  type="file"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  error={!!errors.file}
                  helperText={errors.file && errors.file.message}
                  fullWidth
                />
              )}
            />
            {/* <div>
              <Controller
                name="photo_url"
                control={control}
                defaultValue=""
                render={({ field }) => <TextField {...field} type="file" label="File" error={!!errors.photo_url} helperText={errors?.photo_url?.message} InputLabelProps={{ shrink: true }} />}
              />
            </div> */}
            <div>
              <TextField
                label="Gallery"
                margin="normal"
                required
                fullWidth
                {...register("gallery")}
                type="file"
                onChange={(e) => handleFileChange(e)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.gallery}
                helperText={errors?.gallery?.message}
              />
            </div>
            <div>
              <TextField label="Medals" margin="normal" required fullWidth {...register("medals")} error={!!errors.medals} helperText={errors.medals?.message} />
            </div>
            <div>
              <TextField
                label="Medical Report"
                margin="normal"
                required
                fullWidth
                {...register("medical_report", {
                  onChange: (e) => handleFileChange(e),
                })}
                type="file"
                InputLabelProps={{ shrink: true }}
                error={!!errors.medical_report}
                helperText={errors?.medical_report?.message}
              />
            </div>
            <div>
              <TextField label="Profile Status" margin="normal" required fullWidth {...register("profile_status")} error={!!errors.profile_status} helperText={errors.profile_status?.message} />
            </div>
            <div>
              <TextField label="Breed Name" margin="normal" required fullWidth {...register("breed_name")} error={!!errors.breed_name} helperText={errors.breed_name?.message} />
            </div>
            <div>
              <TextField
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
                fullWidth
                {...register("dob")}
                error={!!errors.dob}
                helperText={errors.dob?.message}
              />
            </div>
            <div>
              <TextField
                label="Service Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
                fullWidth
                {...register("service_start")}
                error={!!errors.service_start}
                helperText={errors.service_start?.message}
              />
            </div>
            <div>
              <TextField
                label="Service End Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
                fullWidth
                {...register("service_end")}
                error={!!errors.service_end}
                helperText={errors.service_end?.message}
              />
            </div>
            <div>
              <TextField
                label="Adoption Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                margin="normal"
                required
                fullWidth
                {...register("adoption_date")}
                error={!!errors.adoption_date}
                helperText={errors.adoption_date?.message}
              />
            </div>
            <div>
              <TextField
                label="Handlers Count"
                margin="normal"
                type="number"
                required
                fullWidth
                {...register("handlers_count")}
                error={!!errors.handlers_count}
                helperText={errors.handlers_count?.message}
              />
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
        <DialogTitle id="alert-dialog-title">Suspend</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Are you sure you want to delete this Dog?</DialogContentText>
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
export default Dog;
