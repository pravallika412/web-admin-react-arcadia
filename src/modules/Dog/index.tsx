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
  Select,
  TableBody,
  TablePagination,
  IconButton,
  DialogContentText,
  TextareaAutosize,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
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
import { DatePicker } from "@mui/lab";
import { Link, Route, Routes } from "react-router-dom";
import AddDog from "./addDog";

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

const datatypes = [
  {
    order: 1,
    name: "String",
    fieldType: "Text",
  },
  {
    order: 2,
    name: "Number",
    fieldType: "Text",
  },
  {
    order: 3,
    name: "Date",
    fieldType: "DatePicker",
  },
  {
    order: 4,
    name: "Boolean",
    fieldType: "Select",
  },
  {
    order: 5,
    name: "Enum",
    fieldType: "Text(comma-separated)",
  },
  {
    order: 6,
    name: "Textarea",
    fieldType: "Textarea",
  },
  {
    order: 7,
    name: "File",
    fieldType: "File",
  },
  {
    order: 8,
    name: "Files",
    fieldType: "Files",
  },
];
const data = [
  { fieldName: "name", dataType: 1, data: "" },
  { fieldName: "dob", dataType: 3, data: "" },
  { fieldName: "adoption_date", dataType: 3, data: "" },
  { fieldName: "rest_date", dataType: 3, data: "" },
  { fieldName: "service", dataType: 5, data: ["army", "navy"] },
  {
    fieldName: "service_start",
    dataType: 3,
    data: "",
  },
  {
    fieldName: "service_end",
    dataType: 3,
    data: "",
  },
  {
    fieldName: "photo_url",
    dataType: 7,
    data: "",
  },
  {
    fieldName: "gallery",
    dataType: 8,
    data: "",
  },
  {
    fieldName: "medals",
    dataType: 8,
    data: "",
  },
  {
    fieldName: "medical_reports",
    dataType: 8,
    data: "",
  },
  {
    fieldName: "status",
    dataType: 5,
    data: ["active", "inactive"],
  },
  {
    fieldName: "Profile_status",
    dataType: 5,
    data: ["sleeping", "playing"],
  },
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

  const [formData, setFormData] = useState({});

  const steps = ["Basic Information", "Other Information"];

  const handleChange = (fieldName, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  const getFieldComponent = (field) => {
    const fieldType = datatypes.find((type) => type.order === field.dataType).fieldType;
    const fieldName = field.fieldName;
    const fieldValue = formData[fieldName] || "";

    switch (fieldType) {
      case "Text":
        return <TextField label={fieldName} value={fieldValue} onChange={(e) => handleChange(fieldName, e.target.value)} />;
      // case "DatePicker":
      //   return <DatePicker label={fieldName} value={fieldValue} onChange={(date) => handleChange(fieldName, date)} />;
      case "Select":
        const options = field.data;
        return (
          <Select label={fieldName} value={fieldValue} onChange={(e) => handleChange(fieldName, e.target.value)}>
            {options.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      case "Text(comma-separated)":
        const enumOptions = field.data;
        return <TextField label={fieldName} value={fieldValue} onChange={(e) => handleChange(fieldName, e.target.value)} helperText={`Choose one of these options: ${enumOptions.join(", ")}`} />;
      case "Textarea":
        return <TextareaAutosize value={fieldValue} onChange={(e) => handleChange(fieldName, e.target.value)} />;
      case "Checkbox":
        return <FormControlLabel control={<Checkbox />} label={fieldName} checked={fieldValue} />;
      default:
        return null;
    }
  };

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
      <Link to="/dog/addDog">
        <Button onClick={handleOpen} sx={{ margin: 1 }} variant="contained">
          Add Dog
        </Button>
      </Link>
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
      {/* <Dialog open={open} onClose={handleClose} scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description">
        <DialogTitle id="scroll-dialog-title">{isEditing ? "Update Handler" : "Create Handler"}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: 500 }}>
          <DialogContent>
            <div>
              {data.map((field) => (
                <div key={field.fieldName}>{getFieldComponent(field)}</div>
              ))}
            </div>
            <Box sx={{ width: "100%" }}>
              <Stepper alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained">
              Submit
            </Button>
            <Button onClick={handleClose}>Cancel</Button>
          </DialogActions>
        </Box>
      </Dialog> */}
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
