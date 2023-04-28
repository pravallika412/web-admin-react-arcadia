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
  useTheme,
  Grid,
  Typography,
} from "@mui/material";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { makeStyles } from "@mui/styles";
import { CREATE_SUBSCRIPTION, GET_PLAN, GET_PLANS, UPDATE_PLAN } from "../../shared/graphQL/subscription/queries";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";

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
  { id: "description", label: "Description", minWidth: 170 },
  { id: "plan_image", label: "Plan Image", minWidth: 170 },
  { id: "default_price", subid1: "renewal_number", subid2: "renewal_period", label: "Recurring Period", minWidth: 170 },
  { id: "default_price", subid: "price", label: "Price", minWidth: 170 },
  { id: "default_price", subid: "supportable_product_count", label: "Product Count", minWidth: 170 },
  { id: "action", label: "Action" },
];

const renewalPeriodOptions = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

const Subscription = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [createSubscription, { data: createSub }] = useMutation(CREATE_SUBSCRIPTION);
  const [updateSubscription, { data: updateSub }] = useMutation(UPDATE_PLAN);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [getPlans, { data: getAllPlans, refetch }] = useLazyQuery(GET_PLANS);
  const [getPlan, { data: getPlanById }] = useLazyQuery(GET_PLAN);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

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

  useEffect(() => {
    getPlans();
  }, []);

  useEffect(() => {
    if (getAllPlans) {
      setProducts(getAllPlans.GetPlans);
    }
    if (selectedData) {
      getPlan({ variables: { input: selectedData } });
    }
  }, [getAllPlans, selectedData]);

  useEffect(() => {
    if (getPlanById) {
      let data = getPlanById.GetPlan;
      let initial_values = {
        name: data.name,
        description: data.description,
        recurring: data.default_price.recurring ? "yes" : "no",
        renewalPeriod: data.default_price.renewal_period,
        planImage: data.plan_image,
        price: data.default_price.price,
        renewalNumber: data.default_price.renewal_number,
        supportableProductCount: data.default_price.supportable_product_count,
      };
      reset(initial_values);
    }
  }, [getPlanById, reset]);

  useEffect(() => {
    if (createSub) {
      refetch();
    }
  }, [createSub]);

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
    if (isEditing) {
      let updatePayload = {
        planId: selectedData.planId,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        supportableProductCount: Number(data.supportableProductCount),
      };
      updateSubscription({ variables: { input: updatePayload } });
    } else {
      let payload = {
        name: data.name,
        description: data.description,
        recurring: true,
        planImage: uploadFile.includes("?") ? uploadFile.split("?")[0] : uploadFile,
        renewalPeriod: data.renewalPeriod,
        price: Number(data.price),
        renewalNumber: Number(data.renewalNumber),
        supportableProductCount: Number(data.supportableProductCount),
      };
      createSubscription({ variables: { input: payload } });
    }

    setOpen(false);
  };

  const handleEditClick = (row) => {
    let payload = {
      planId: row._id,
    };
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
    reset();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Subscriptions
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
                    <TableRow hover role="checkbox" tabIndex={-1} key={product._id}>
                      {columns.map((column) => {
                        const value = product[column.id];
                        return (
                          <TableCell key={column.id}>
                            {column.id === "plan_image" ? (
                              <img src={value} alt="Plan Image" className={classes.image} />
                            ) : column.id === "default_price" ? (
                              column.subid === "price" ? (
                                "$" + value[column.subid]
                              ) : column.subid === "supportable_product_count" ? (
                                value[column.subid]
                              ) : (
                                value[column.subid1] + " " + value[column.subid2]
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
                    value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                    message: "Please enter a valid name",
                  },
                  maxLength: {
                    value: 15,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => <TextField {...field} label="Plan Name" margin="normal" fullWidth error={!!errors.name} helperText={errors?.name?.message} />}
              />
            </div>

            <div>
              <Controller
                name="description"
                control={control}
                defaultValue=""
                rules={{
                  required: "Description is required",
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                    message: "Please enter a valid Description",
                  },
                  maxLength: {
                    value: 50,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => <TextField {...field} label="Plan Description" margin="normal" fullWidth error={!!errors.description} helperText={errors?.description?.message} />}
              />
            </div>

            <div>
              {!isEditing && (
                <TextField
                  label="Plan Image"
                  name="planImage"
                  margin="normal"
                  required
                  fullWidth
                  {...register("planImage", {
                    onChange: (e) => handleFileChange(e),
                    required: {
                      value: true,
                      message: "This is required",
                    },
                  })}
                  type="file"
                  InputLabelProps={{ shrink: true }}
                  error={!!errors.planImage}
                  helperText={errors?.planImage?.message}
                />
              )}
            </div>

            <div>
              {!isEditing && (
                <Controller
                  name="renewalPeriod"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Renewal period is required" }}
                  render={({ field, fieldState: { error } }) => (
                    <TextField {...field} select label="Renewal Period" error={Boolean(error)} helperText={error?.message} fullWidth>
                      {renewalPeriodOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              )}
            </div>

            <div>
              <Controller
                name="price"
                control={control}
                defaultValue=""
                rules={{
                  required: "Price is required",
                  pattern: {
                    value: /^[1-9]\d*\.?\d*$/,
                    message: "Please enter a positive number",
                  },
                }}
                render={({ field }) => <TextField {...field} type="number" label="Price" margin="normal" fullWidth error={!!errors.price} helperText={errors?.price?.message} />}
              />
            </div>

            <div>
              {!isEditing && (
                <Controller
                  name="renewalNumber"
                  control={control}
                  defaultValue=""
                  rules={{
                    required: "Renewal Number is required",
                    pattern: {
                      value: /^[1-9]\d*\.?\d*$/,
                      message: "Please enter a positive number",
                    },
                  }}
                  render={({ field }) => (
                    <TextField {...field} type="number" label="Renewal Number" margin="normal" fullWidth error={!!errors.renewalNumber} helperText={errors?.renewalNumber?.message} />
                  )}
                />
              )}
            </div>

            <div>
              <Controller
                name="supportableProductCount"
                control={control}
                defaultValue=""
                rules={{
                  required: "Supportable Product Count is required",
                  pattern: {
                    value: /^[1-9]\d*\.?\d*$/,
                    message: "Please enter a positive number",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Supportable Product Count"
                    margin="normal"
                    fullWidth
                    error={!!errors.supportableProductCount}
                    helperText={errors?.supportableProductCount?.message}
                  />
                )}
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
    </Container>
  );
};

export default Subscription;
