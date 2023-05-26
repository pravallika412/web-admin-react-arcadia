import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  useTheme,
  Grid,
  Typography,
  InputAdornment,
  Skeleton,
  CircularProgress,
  DialogContentText,
  Backdrop,
} from "@mui/material";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { makeStyles } from "@mui/styles";
import { CREATE_SUBSCRIPTION, GET_PLAN, GET_PLANS, UPDATE_PLAN } from "../../shared/graphQL/subscription/queries";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SuspenseLoader from "../../shared/components/SuspenseLoader";

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
  { _id: 1, id: "name", label: "Name", minWidth: 170 },
  { _id: 2, id: "plan_image", label: "Plan Image", minWidth: 170 },
  { _id: 3, id: "default_price", subid: "price", label: "Price", minWidth: 170 },
  { _id: 4, id: "default_price", subid: "supportable_product_count", label: "Product Count", minWidth: 170 },
  { _id: 5, id: "action", label: "Action" },
];

const Subscription = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileEdit, setUploadFileEdit] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [openPlanStatus, setOpenPlanStatus] = useState(false);
  const [createSubscription, { data: createSub, loading: addPlanLoader }] = useMutation(CREATE_SUBSCRIPTION);
  const [updateSubscription, { data: updateSub, loading: updatePlanLoader }] = useMutation(UPDATE_PLAN);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [getPlans, { data: getAllPlans, loading: planLoader, refetch }] = useLazyQuery(GET_PLANS);
  const [getPlan, { data: getPlanById }] = useLazyQuery(GET_PLAN);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      descriptions: [{ description: "" }],
      planImage: "",
      price: "",
      name: "",
      supportableProductCount: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "descriptions",
  });

  useEffect(() => {
    if (createPresignedUrl && !isEditing) {
      setUploadFile(createPresignedUrl.GeneratePresignedUrl.presignedUrl);
    }
    if (createPresignedUrl && isEditing) {
      setUploadFileEdit(createPresignedUrl.GeneratePresignedUrl.presignedUrl);
    }
  }, [createPresignedUrl]);

  useEffect(() => {
    if (uploadFile) {
      uploadImageFn(uploadFile, file);
    }
  }, [uploadFile]);

  useEffect(() => {
    if (uploadFileEdit) {
      uploadImageFn(uploadFileEdit, file);
    }
  }, [uploadFileEdit]);

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (getAllPlans) {
      setProducts(getAllPlans.GetPlans);
    }
  }, [getAllPlans]);

  useEffect(() => {
    if (createSub) {
      setOpen(false);
      setOpenPlanStatus(true);
      refetch();
    }
  }, [createSub]);

  useEffect(() => {
    if (updateSub) {
      setOpen(false);
      setOpenPlanStatus(true);
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
    if (isEditing) {
      let updatePayload = {
        planId: selectedData.planId,
        description: JSON.stringify(data.descriptions.map((item) => item.description)),
        name: data.name,
        price: Number(data.price),
        planImage: uploadFileEdit
          ? uploadFileEdit.includes("?")
            ? uploadFileEdit.split("?")[0]
            : uploadFileEdit
          : uploadFile
          ? uploadFile.includes("?")
            ? uploadFile.split("?")[0]
            : uploadFile
          : uploadFile,
        supportableProductCount: data.supportableProductCount,
        tokenUri: "https://gateway.pinata.cloud/ipfs/Qmc9jo1vohFdHM9Nffq7gGjvDH5T3S3m5Dgfw56wDyXBw9",
      };
      updateSubscription({ variables: { input: updatePayload } });
    } else {
      let payload = {
        name: data.name,
        description: JSON.stringify(data.descriptions.map((item) => item.description)),
        recurring: true,
        planImage: uploadFile.includes("?") ? uploadFile.split("?")[0] : uploadFile,
        renewalPeriod: "month",
        price: Number(data.price),
        renewalNumber: 1,
        supportableProductCount: data.supportableProductCount,
        tokenUri: "https://gateway.pinata.cloud/ipfs/Qmc9jo1vohFdHM9Nffq7gGjvDH5T3S3m5Dgfw56wDyXBw9",
      };
      createSubscription({ variables: { input: payload } });
    }
  };

  const handleEditClick = (row) => {
    console.log(row);
    let payload = {
      planId: row._id,
    };
    let editData = getAllPlans.GetPlans.filter((e) => e._id === row._id)[0];
    let initial_values = {
      name: editData.name,
      descriptions: [],
      planImage: editData.plan_image,
      price: editData.default_price.price,
      supportableProductCount: editData.default_price.supportable_product_count,
    };
    let descriptions;
    try {
      descriptions = JSON.parse(editData.description);
    } catch (error) {
      descriptions = [editData.description];
    }
    initial_values.descriptions = []; // Initialize descriptions array
    descriptions.forEach((description) => {
      initial_values.descriptions.push({ description }); // Append each description to the array
    });
    reset(initial_values);
    setIsEditing(true);
    setSelectedData(payload);
    setOpen(true);
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

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    reset({});
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
    reset({ descriptions: [{ description: "" }] });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handlePlanStatusClose = () => {
    setOpenPlanStatus(false);
  };

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Plans
          </Typography>
        </Grid>
        <Grid item>
          <Button sx={{ my: 2 }} variant="contained" onClick={handleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
            Add Plan
          </Button>
        </Grid>
      </Grid>
      <Paper>
        <TableContainer>
          <Table aria-label="Product table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column._id} style={{ minWidth: column.minWidth }}>
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {planLoader ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <Skeleton variant="rectangular" animation="wave" height={400} />
                  </TableCell>
                </TableRow>
              ) : products.length > 0 ? (
                products.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((product) => {
                  return (
                    <TableRow hover role="checkbox" tabIndex={-1} key={product._id}>
                      {columns.map((column) => {
                        const value = product[column.id];
                        return (
                          <TableCell key={column._id}>
                            {column.id === "plan_image" ? (
                              <img src={value} alt="Plan Image" className={classes.image} />
                            ) : column.id === "default_price" ? (
                              column.subid === "price" ? (
                                "$" + value[column.subid]
                              ) : (
                                value[column.subid]
                              )
                            ) : column.id === "action" ? (
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
        <DialogTitle id="scroll-dialog-title" sx={{ padding: "16px 24px 0px 24px" }}>
          {isEditing ? "Update Plan" : "Add Plan"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: 500 }}>
          <DialogContent>
            <div>
              <Controller
                name="name"
                control={control}
                defaultValue=""
                rules={{
                  required: "Name is required",
                  pattern: {
                    value: /^[^\s][\w\s!@#$%^&*()_+=[\]{}|\\;:'",.<>/?-]*$/,
                    message: "Please enter a valid name",
                  },
                  maxLength: {
                    value: 20,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => <TextField {...field} label="Plan Name" margin="normal" fullWidth error={!!errors.name} helperText={errors?.name?.message} />}
              />
            </div>

            <div>
              {console.log(fields)}
              {fields.map((item, index) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center" }}>
                  <Controller
                    control={control}
                    name={`descriptions.${index}.description`}
                    defaultValue=""
                    rules={{
                      required: "Description is required",
                      maxLength: {
                        value: 100,
                        message: "Max length exceeded",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Plan Description"
                        margin="normal"
                        fullWidth
                        error={!!errors.descriptions?.[index]?.description}
                        helperText={errors.descriptions?.[index]?.description?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => remove(index)}>
                                <DeleteIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </div>
              ))}

              <Button onClick={() => append({ description: "" })}>Add New Item</Button>
            </div>

            <div>
              <TextField
                label="Plan Image"
                name="planImage"
                margin="normal"
                fullWidth
                {...register(
                  "planImage",
                  !isEditing
                    ? {
                        onChange: (e) => handleFileChange(e),
                        required: {
                          value: true,
                          message: "This is required",
                        },
                      }
                    : { onChange: (e) => handleFileChange(e) }
                )}
                type="file"
                InputLabelProps={{ shrink: true }}
                error={!!errors.planImage}
                helperText={errors?.planImage?.message}
              />
            </div>

            <div>
              <Controller
                name="price"
                control={control}
                defaultValue="$"
                rules={{
                  required: "Price is required",
                  pattern: {
                    value: /^[1-9]\d*\.?\d*$/,
                    message: "Please enter a positive number",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Price"
                    margin="normal"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    error={!!errors.price}
                    helperText={errors?.price?.message}
                  />
                )}
              />
            </div>

            <div>
              <Controller
                name="supportableProductCount"
                control={control}
                defaultValue=""
                rules={{
                  required: "Supportable Product Count is required",
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                    message: "Please enter a valid Product Count",
                  },
                }}
                render={({ field }) => (
                  <TextField {...field} label="Product Count" margin="normal" fullWidth error={!!errors.supportableProductCount} helperText={errors?.supportableProductCount?.message} />
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained" disabled={addPlanLoader || updatePlanLoader}>
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Box>
        {(addPlanLoader || updatePlanLoader) && <SuspenseLoader left="0%" />}
      </Dialog>

      <Dialog open={openPlanStatus} onClose={handlePlanStatusClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box display="flex" justifyContent="flex-end" p={1} sx={{ overflow: "hidden" }}>
          <IconButton edge="end" color="primary" onClick={handlePlanStatusClose} aria-label="close">
            <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ width: 324, height: 240 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 70, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong>Plan {isEditing ? "Updated" : "Created"} Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Subscription;
