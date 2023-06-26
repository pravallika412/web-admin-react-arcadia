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
import { CREATE_SUBSCRIPTION, DELETE_PLAN, GET_PLAN, GET_PLANS, UPDATE_PLAN } from "../../shared/graphQL/subscription/queries";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import axios from "axios";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import SharedTable from "../../shared/components/Table";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  { id: "name", label: "Name of Plan", minWidth: 170 },
  { id: "createdAt", label: "Created On", minWidth: 170 },
  { id: "price", label: "Price", minWidth: 170 },
  { id: "count", label: "No. of Dogs", minWidth: 170 },
  { id: "action", label: "Action", minWidth: 170 },
];

const Subscription = () => {
  const pinata_api_key = process.env.PINATA_API_KEY;
  const pinata_secret_api_key = process.env.PINATA_API_SECRET_KEY;
  const theme = useTheme();
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const [open, setOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFileEdit, setUploadFileEdit] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isEditing, setIsEditing] = useState(false);
  const [iPFSLoader, setIPFSLoader] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageIpfs, setImageIpfs] = useState("");
  const [iPFSFile, setIPFSFile] = useState("");
  const [presignedLoader, setPresignedLoader] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [openPlanStatus, setOpenPlanStatus] = useState(false);
  const [imageEdit, setImageEdit] = useState("");
  const [createSubscription, { data: createSub, loading: addPlanLoader }] = useMutation(CREATE_SUBSCRIPTION);
  const [updateSubscription, { data: updateSub, loading: updatePlanLoader }] = useMutation(UPDATE_PLAN);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [getPlans, { data: getAllPlans, loading: planLoader, refetch }] = useLazyQuery(GET_PLANS);
  const [getPlan, { data: getPlanById }] = useLazyQuery(GET_PLAN);
  const [deletePlan, { data: deletePlanData }] = useMutation(DELETE_PLAN);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      descriptions: [{ description: "" }],
      planImage: "",
      price: "",
      name: "",
      supportableProductCount: "",
      mtdescription: "",
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
    getPlans({ variables: { input: { pageDto: { page: page + 1, limit: rowsPerPage }, search: searchValue } } });
  }, [page, rowsPerPage, searchValue]);

  useEffect(() => {
    if (getAllPlans) {
      setProducts(getAllPlans.GetPlans.plans);
      setTotalCount(getAllPlans.GetPlans.totalCount);
    }
  }, [getAllPlans]);

  useEffect(() => {
    if (createSub) {
      setOpen(false);
      setIsDeleting(false);
      setOpenPlanStatus(true);
      refetch();
    }
  }, [createSub]);

  useEffect(() => {
    if (updateSub) {
      setOpen(false);
      setIsDeleting(false);

      setOpenPlanStatus(true);
      refetch();
    }
  }, [updateSub]);

  useEffect(() => {
    if (deletePlanData) {
      setIsDeleting(true);
      setOpenDelete(false);
      refetch();
    }
  }, [deletePlanData]);

  const handleDelete = () => {
    deletePlan({ variables: { id: { id: deleteId } } });
    setOpenDelete(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
  };

  const uploadImageFn = async (url, data) => {
    await fetch(url, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": data.type,
      },
    });
    setPresignedLoader(false);
  };

  const onSubmit = async (data) => {
    setIPFSLoader(true);
    let data1 = JSON.stringify({
      pinataContent: {
        description: data.mtdescription,
        external_url: "https://dev.d50w243ncde5q.amplifyapp.com/",
        image: imageIpfs,
        name: data.name,
        attributes: [
          {
            trait_type: "price",
            value: Number(data.price),
          },
          {
            trait_type: "supportableProductCount",
            value: data.supportableProductCount,
          },
        ],
      },
    });
    let config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: pinata_api_key,
        pinata_secret_api_key: pinata_secret_api_key,
      },
      data: data1,
    };

    const res = await axios(config);
    if (isEditing) {
      setIPFSLoader(false);
      let updatePayload = {
        planId: selectedData.planId,
        description: JSON.stringify(data.descriptions.map((item) => item.description)),
        name: data.name,
        price: Number(data.price),
        planImage: uploadFileEdit ? (uploadFileEdit.includes("?") ? uploadFileEdit.split("?")[0] : uploadFileEdit) : imageEdit,
        supportableProductCount: data.supportableProductCount,
        tokenUri: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
      };
      updateSubscription({ variables: { input: updatePayload } });
    } else {
      setIPFSLoader(false);
      let payload = {
        name: data.name,
        description: JSON.stringify(data.descriptions.map((item) => item.description)),
        recurring: true,
        planImage: uploadFile.includes("?") ? uploadFile.split("?")[0] : uploadFile,
        renewalPeriod: "month",
        price: Number(data.price),
        renewalNumber: 1,
        supportableProductCount: data.supportableProductCount,
        tokenUri: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
      };
      createSubscription({ variables: { input: payload } });
    }
  };

  const handleEditClick = (row) => {
    let payload = {
      planId: row._id,
    };
    fetch(row.nft_media_url)
      .then((response) => response.json())
      .then((data) => {
        setValue("mtdescription", data.description);
        setImageIpfs(data.image);
      })
      .catch((error) => console.error("Error:", error));

    let editData = getAllPlans.GetPlans.plans.filter((e) => e._id === row._id)[0];
    let initial_values = {
      name: editData.name,
      descriptions: [],
      price: editData.default_price.price,
      supportableProductCount: editData.default_price.supportable_product_count,
    };
    setImageEdit(editData.plan_image);
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

  const handleDeleteClick = (row) => {
    setDeleteId(row._id);
    setOpenDelete(true);
  };

  const handleFileChange = async (event: any) => {
    const file = event.target.files[0];
    setFileName(file.name);
    event.preventDefault();
    setFile(event.target.files[0]);
    let payload = {
      fileName: event.target.files[0].name,
      fileType: event.target.files[0].type,
      filePath: "sponsor",
    };
    setPresignedLoader(true);
    generatePresignedUrl({ variables: { input: payload } });
    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: pinata_api_key,
        pinata_secret_api_key: pinata_secret_api_key,
      },
    });

    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
    setImageIpfs(ipfsUrl);
  };

  const handleOpen = () => {
    setOpen(true);
    setIsEditing(false);
    reset({});
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);
    setFileName("");
    setOpenDelete(false);
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

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const formattedData = products.map((row) => {
    let imageUrl = row.plan_image || "";

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
            <div style={{ alignItems: "center", paddingTop: "7px", paddingLeft: "10px" }}>
              <strong>{row.name ? row.name : "N/A"}</strong>
              <Typography sx={{ fontSize: "10px", fontWeight: 400 }}>WDF{row.product}</Typography>
            </div>
          </div>
        </>
      ),
      price: row?.default_price ? row.default_price?.price : "",
      count: row?.default_price ? row.default_price?.supportable_product_count : "",
      createdAt: formatDate(row?.createdAt),
      action: (
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
            onClick={() => handleEditClick(row)}
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
            onClick={() => handleDeleteClick(row)}
          >
            <DeleteTwoToneIcon fontSize="small" />
          </IconButton>
        </>
      ),
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

  return (
    <Container component="main">
      <Grid container justifyContent="space-between" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid item>
          <Typography variant="h3" component="h3" gutterBottom>
            List of Subscription Plans
          </Typography>
        </Grid>
        <Grid item>
          <Button sx={{ my: 2 }} variant="contained" onClick={handleOpen} startIcon={<AddTwoToneIcon fontSize="small" />}>
            Add Plan
          </Button>
        </Grid>
      </Grid>

      <SharedTable
        columns={columns}
        data={formattedData}
        page={page}
        tableBodyLoader={planLoader}
        rowsPerPage={rowsPerPage}
        totalRows={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        searchFilter={undefined}
        searchFilterVisible={true}
        onSearch={handleSearch}
        selectableRows={false}
        onRowClick={undefined}
      ></SharedTable>

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
                                <DeleteIcon sx={{ color: theme.palette.error.main }} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </div>
              ))}

              <Button onClick={() => append({ description: "" })} sx={{ fontSize: 13, fontWeight: 400 }} color="secondary" startIcon={<AddTwoToneIcon fontSize="small" />}>
                Add New Item
              </Button>
            </div>

            {/* <div>
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
            </div> */}

            <div>
              <Controller
                name="planImage"
                control={control}
                defaultValue=""
                rules={
                  !isEditing
                    ? {
                        required: {
                          value: true,
                          message: "This is required",
                        },
                      }
                    : {}
                }
                render={({ field }) => (
                  <>
                    <input
                      {...field}
                      id="file-upload"
                      type="file"
                      hidden
                      onChange={(e) => {
                        field.onChange(e); // use field.onChange to notify the form when a file is selected
                        handleFileChange(e);
                      }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => document.getElementById("file-upload").click()}
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "450px",
                        height: "131px",
                        background: "#FFFFFF",
                        border: "1px dashed #999999",
                        borderRadius: "6px",
                      }}
                    >
                      {fileName ? fileName : "Upload Plan Image"}
                    </Button>
                    {errors.planImage && <Typography color="error">{errors.planImage.message}</Typography>}
                  </>
                )}
              />
            </div>

            <Controller
              name="mtdescription"
              control={control}
              defaultValue=""
              rules={{
                required: "Description is required",
                pattern: {
                  value: /^[^\s][\w\s!@#$%^&*()_+=[\]{}|\\;:'",.<>/?-]*$/,
                  message: "Please enter a valid description",
                },
                maxLength: {
                  value: 200,
                  message: "Max length exceeded",
                },
              }}
              render={({ field }) => <TextField {...field} label="Metadata Description" margin="normal" fullWidth error={!!errors.mtdescription} helperText={errors?.mtdescription?.message} />}
            />

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
                  maxLength: {
                    value: 3,
                    message: "Max length exceeded",
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
        {(iPFSLoader || presignedLoader || updatePlanLoader || addPlanLoader) && <SuspenseLoader left="0%" />}
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
              <strong>Plan {isDeleting ? "Deleted" : isEditing ? "Updated" : "Created"} Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={openDelete} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogContent sx={{ width: 400, height: 300 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <DeleteIcon sx={{ fontSize: 70, m: 2, color: "rgba(204, 43, 53, 1)" }} />
            <Typography sx={{ fontSize: "24px", fontWeight: 700 }}>Delete</Typography>
            <DialogContentText id="alert-dialog-description" sx={{ m: 2, fontWeight: 600 }}>
              Are you sure you want to delete this Plan?
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
    </Container>
  );
};

export default Subscription;
