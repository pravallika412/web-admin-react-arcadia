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
  Typography,
  Grid,
  useTheme,
  FormControl,
  InputLabel,
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
import { Link, Route, Routes, useNavigate } from "react-router-dom";
import AddDog from "./addDog";
import Label from "../../shared/components/Label";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import SharedTable from "../../shared/components/Table";

const columns = [
  { id: "name", label: "Dog's Name", minWidth: 170 },
  { id: "createdAt", label: "Created On", minWidth: 170 },
  { id: "barcode", label: "Barcode", minWidth: 170 },
  { id: "status", label: "Dog's status", minWidth: 170 },
];

const dogStatus = [
  {
    id: "all",
    name: "All",
  },
  {
    id: "active",
    name: "Active",
  },
  {
    id: "inactive",
    name: "Inactive",
  },
  {
    id: "adopted",
    name: "Adopted",
  },
  {
    id: "atheaven",
    name: "At Heaven",
  },
  {
    id: "suspended",
    name: "Suspended",
  },
];

const SearchFilter = ({ handleStatusChange }) => {
  return (
    <Box width={160} sx={{ m: 1 }}>
      <FormControl fullWidth variant="outlined">
        <InputLabel>Dog Status</InputLabel>
        <Select onChange={(e) => handleStatusChange(e)} label="Post Status" defaultValue={""} autoWidth>
          {dogStatus.map((statusOption) => (
            <MenuItem key={statusOption.id} value={statusOption.id}>
              {statusOption.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const Dog = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);
  const [uploadFile, setUploadFile] = useState("");
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchValue, setSearchValue] = useState("");
  const [filters, setFilters] = useState({
    dogStatus: null,
  });
  const [deleteProduct, { data: deleteProductData }] = useMutation(DELETE_PRODUCT);
  const [getProducts, { data: getAllProducts, refetch, loading: productLoading }] = useLazyQuery(GET_PRODUCTS, { fetchPolicy: "no-cache" });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(DogValidationSchema) });
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});

  const steps = ["Basic Information", "Other Information"];

  const handleChange = (fieldName, value) => {
    setFormData((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  useEffect(() => {
    getProducts({ variables: { input: { pageDto: { page: page + 1, limit: rowsPerPage }, search: searchValue, status: filters.dogStatus } } });
  }, [page, rowsPerPage, searchValue, filters]);

  useEffect(() => {
    if (getAllProducts) {
      setProducts(JSON.parse(getAllProducts.retrieveProductsList.productsDataList));
      console.log(JSON.parse(getAllProducts.retrieveProductsList.productsDataList));
      setTotalCount(getAllProducts.retrieveProductsList.totalCount);
    }
  }, [getAllProducts]);

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
    deleteProduct({ variables: { id: { id: deleteId } } });
    setOpenDelete(false);
    refetch();
  };

  const handleDeleteClick = (row) => {
    setDeleteId(row._id);
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

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  type Color = "error" | "info" | "secondary" | "primary" | "warning" | "success";
  const getStatusLabel = (status: "active" | "inactive" | "suspended" | "atheaven" | "adopted"): JSX.Element => {
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
      case "atheaven":
        text = "At Heaven";
        color = "error";
        break;
      case "adopted":
        text = "Adopted";
        color = "success";
        break;
      default:
        color = "warning";
        text = "Inactive";
        break;
    }
    return <Label color={color as Color}>{text}</Label>;
  };

  const formatDate = (dateToFormat) => {
    if (dateToFormat) {
      const date = new Date(dateToFormat);
      const year = date.getFullYear();
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const formattedDate = `${day}-${month}-${year}`;
      return formattedDate;
    } else {
      return "";
    }
  };

  const formattedData = products.map((row) => {
    let imageUrl = row.image || "";

    if (imageUrl.includes("?")) {
      imageUrl = imageUrl.split("?")[0];
    }

    return {
      id: row._id,
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
              <strong>{row?.name}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row._id}</Typography>
            </div>
          </div>
        </>
      ),
      createdAt: formatDate(row.createdAt),
      barcode: "",
      status: getStatusLabel(row.status),
    };
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (rowperpage) => {
    const newRowsPerPage = parseInt(rowperpage, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset page when changing rows per page
  };

  const handleStatusChange = (e: any): void => {
    const value = e.target.value === "all" ? null : e.target.value;
    setFilters((prevFilters) => ({
      ...prevFilters,
      dogStatus: value,
    }));
  };

  const handleRowClick = (id) => {
    navigate(`/dogdetails/${id}`);
  };

  // const renderColumn = (column, product, value) => {
  //   switch (column.id) {
  //     case "name":
  //       return (
  //         <div style={{ display: "flex" }}>
  //           {product["image"] ? (
  //             <div
  //               style={{
  //                 display: "flex",
  //                 justifyContent: "center",
  //                 alignItems: "center",
  //                 backgroundImage: "linear-gradient(to right, rgba(85, 105, 255, 1), rgba(30, 136, 229, 1), rgba(52, 163, 83, 1))",
  //                 borderRadius: "50%",
  //                 padding: "2px",
  //                 width: "50px",
  //                 height: "50px",
  //               }}
  //             >
  //               <img src={product["image"]} style={{ width: "45px", height: "45px", borderRadius: "50%" }} alt="profile" />
  //             </div>
  //           ) : (
  //             ""
  //           )}
  //           <div style={{ alignItems: "center", paddingTop: "15px", paddingLeft: "10px" }}>
  //             <strong>{value ? value : ""}</strong>
  //           </div>
  //         </div>
  //       );
  //     case "status":
  //       return getStatusLabel(value);
  //     case "createdAt":
  //       return formatDate(value);
  //     default:
  //       return value;
  //   }
  // };

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Dogs
          </Typography>
        </Grid>
        <Grid item>
          <Link to="/dog/addDog">
            <Button sx={{ my: 2 }} variant="contained" onClick={handleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
              Add Dog
            </Button>
          </Link>
        </Grid>
      </Grid>

      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={productLoading}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSearch={handleSearch}
        searchFilter={<SearchFilter handleStatusChange={handleStatusChange} />}
        searchFilterVisible={true}
        selectableRows={true}
        onRowClick={handleRowClick}
      ></SharedTable>

      {/* <Paper>
        <TableContainer>
          <Table aria-label="Product table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.id} style={{ minWidth: column.minWidth, textTransform: "none" }}>
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
                        const value = product[column.id] ? product[column.id] : "";
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
                            ) : (
                              renderColumn(column, product, value)
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
      </Paper> */}
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
