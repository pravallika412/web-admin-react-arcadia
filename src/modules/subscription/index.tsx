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
import { CREATE_SUBSCRIPTION, GENERATE_PRESIGNED_URL, GET_PLAN, GET_PLANS } from "../../shared/graphQL/queries";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { useEffect, useState } from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import { useLazyQuery } from "@apollo/client";
import { makeStyles } from "@mui/styles";
import EditIcon from "@mui/icons-material/Edit";

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
  { id: "default_price", subid: "price", label: "Price", minWidth: 170 },
  { id: "action", label: "Action" },
];

const renewalPeriodOptions = [
  { value: "day", label: "Day" },
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
];

const Subscription = () => {
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
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [getPlans, { data: getAllPlans }] = useLazyQuery(GET_PLANS);
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
    if (getAllPlans) {
      setProducts(getAllPlans.GetPlans);
    }
    if (selectedData) {
      getPlan({ variables: { input: selectedData } });
    }
    if (getPlanById) {
      let data = getPlanById.GetPlan;
      let initial_values = {
        name: data.name,
        description: data.description,
        recurring: data.default_price.recurring ? "yes" : "no",
        renewal_period: data.default_price.renewal_period,
        planImage: data.plan_image,
        price: data.default_price.price,
        renewalNumber: data.default_price.renewal_number,
        supportableProductCount: data.default_price.supportable_product_count,
      };
      reset(initial_values);
    }
  }, [getAllPlans, selectedData, getPlanById, reset]);

  useEffect(() => {
    if (createSub) {
      getPlans();
    }
  }, [createSub]);

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
    setUploadFile(data.planImage);
    let payload = {
      name: data.name,
      description: data.description,
      recurring: data.recurring === "yes" ? true : false,
      planImage: uploadFile.includes("?") ? uploadFile.split("?")[0] : uploadFile,
      renewalPeriod: data.renewalPeriod,
      price: Number(data.price),
      renewalNumber: Number(data.renewalNumber),
      supportableProductCount: Number(data.supportableProductCount),
    };
    console.log("Add/Update Payload:", payload);
    createSubscription({ variables: { input: payload } });
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

  // if (loading) return <SuspenseLoader />;

  // if (error) {
  //   return <h1>{error.message}</h1>;
  // }

  return (
    <Container component="main">
      <Button onClick={handleOpen} sx={{ margin: 1 }} variant="contained">
        Add Plan
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
                  <TableRow hover role="checkbox" tabIndex={-1} key={product._id}>
                    {columns.map((column) => {
                      const value = product[column.id];
                      return (
                        <TableCell key={column.id}>
                          {column.id === "plan_image" ? (
                            <img src={value} alt="Plan Image" className={classes.image} />
                          ) : column.id === "default_price" ? (
                            value[column.subid]
                          ) : column.id === "action" ? (
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
        <DialogTitle id="scroll-dialog-title">{isEditing ? "Update Plan" : "Add Plan"}</DialogTitle>
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
                    value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                    message: "Please enter valid name",
                  },
                })}
              />
              <ErrorMessage errors={errors} name="name" render={({ message }) => <p>{message}</p>} />
            </div>

            <div>
              <TextField
                label="Description"
                name="desciption"
                margin="normal"
                required
                fullWidth
                {...register("description", {
                  required: {
                    value: true,
                    message: "Description is required",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                    message: "Please enter valid description",
                  },
                })}
              />
              <ErrorMessage errors={errors} name="description" render={({ message }) => <p>{message}</p>} />
            </div>

            <div>
              <Controller
                control={control}
                name="recurring"
                defaultValue=""
                rules={{ required: true }}
                render={({ field }) => (
                  <RadioGroup {...field}>
                    <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                    <FormControlLabel value="no" control={<Radio />} label="No" />
                  </RadioGroup>
                )}
              />
              {errors.recurring && <span>This field is required</span>}
            </div>
            <div>
              {/* {uploadFile?.split("?")[0] ? <img src={uploadFile?.split("?")[0]} alt="Plan Image" className={classes.image} /> : ""} */}
              <Button variant="contained" component="label" sx={{ margin: 1 }} {...register("planImage", { required: true })}>
                Upload
                <input hidden accept="image/*" multiple type="file" onChange={handleFileChange} />
              </Button>
              {errors.planImage && <span>This field is required</span>}
            </div>

            <div>
              {/* <Select label="Renewal Period" name="renewalPeriod" defaultValue="" fullWidth {...register("renewalPeriod", { required: true })}>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
              {errors.renewalPeriod && <span>This field is required</span>} */}
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
            </div>

            <div>
              <TextField label="Price" name="price" margin="normal" required fullWidth {...register("price", { required: true })} type="number" />
              {errors.price && <span>This field is required</span>}
            </div>

            <div>
              <TextField label="Renewal Number" name="renewalNumber" margin="normal" required fullWidth {...register("renewalNumber", { required: true })} type="number" />
              {errors.renewalNumber && <span>This field is required</span>}
            </div>

            <div>
              <TextField
                label="Supportable Product Count"
                name="supportableProductCount"
                margin="normal"
                required
                fullWidth
                {...register("supportableProductCount", { required: true })}
                type="number"
              />
              {errors.supportableProductCount && <span>This field is required</span>}
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
