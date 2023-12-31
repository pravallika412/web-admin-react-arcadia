import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Box,
  Container,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  Grid,
  Typography,
  InputAdornment,
  DialogContentText,
  CardMedia,
  Card,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
} from "@mui/material";
import { useMutation, useLazyQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import { makeStyles } from "@mui/styles";
import { CREATE_SUBSCRIPTION, DELETE_PLAN, GET_PLANS, UPDATE_PLAN } from "../../shared/graphQL/subscription/queries";
import EditTwoToneIcon from "@mui/icons-material/EditTwoTone";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import axios from "axios";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import SharedTable from "../../shared/components/Table";
import CropModal from "../../shared/components/CropModal";
import DialogComponent from "../../shared/components/Dialog";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

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
  card: {
    width: 500,
    height: 130,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  media: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
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
  const [open, setOpen] = useState(false);
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
  const [presignedLoader, setPresignedLoader] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [openPlanStatus, setOpenPlanStatus] = useState(false);
  const [createSubscription, { data: createSub, loading: addPlanLoader }] = useMutation(CREATE_SUBSCRIPTION);
  const [updateSubscription, { data: updateSub, loading: updatePlanLoader }] = useMutation(UPDATE_PLAN);
  const [getPlans, { data: getAllPlans, loading: planLoader, refetch }] = useLazyQuery(GET_PLANS);
  const [deletePlan, { data: deletePlanData }] = useMutation(DELETE_PLAN);
  const [src, setSrc] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [openCropModal, setCropModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState("all");

  const setCroppedImageUrlCallbackPlan = useCallback(
    (url) => {
      setLoadingImage(false);
      setCroppedImageUrl(url);
    },
    [croppedImageUrl]
  );

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

  const onSubmit = async (data) => {
    if (selectedOption === "all") {
      data.supportableProductCount = "all";
    }
    setIPFSLoader(true);
    let data1 = JSON.stringify({
      pinataContent: {
        description: data.mtdescription,
        external_url: process.env.API_BASE_URL.replace("/graphql", "/"),
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
        planImage: croppedImageUrl ? croppedImageUrl : "",
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
        planImage: croppedImageUrl ? croppedImageUrl : "",
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
    setCroppedImageUrl(editData.plan_image);
    let initial_values = {
      name: editData.name,
      descriptions: [],
      price: editData.default_price.price,
      supportableProductCount: editData.default_price.supportable_product_count === "all" ? "" : editData.default_price.supportable_product_count,
    };
    setSelectedOption(editData.default_price.supportable_product_count === "all" ? "all" : "custom");
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

  const handleOpen = () => {
    setOpen(true);
    setCroppedImageUrl(null);
    setIsEditing(false);
    reset({});
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedData(null);

    setOpenDelete(false);
    reset({ descriptions: [{ description: "" }] });
  };

  const handlePlanStatusClose = () => {
    setOpenPlanStatus(false);
  };

  const handleCloseImage = () => {
    setImageModal(false);
  };

  const formatDate = (dateToFormat) => {
    const date = new Date(dateToFormat);
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    const formattedDate = `${day}-${month}-${year}`;
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
      count: row?.default_price
        ? row.default_price?.supportable_product_count
          ? row.default_price?.supportable_product_count === "all"
            ? "All"
            : row.default_price?.supportable_product_count
          : ""
        : "",
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

  const handleFile = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const img = new Image();
        img.addEventListener("load", () => {
          const width = img.width;
          const height = img.height;

          if (width < 300 || height < 300) {
            setImageModal(true);
          } else {
            setSrc(reader.result as string);
            setCropModal(true);
          }
        });

        img.src = reader.result as string;
      });
      reader.readAsDataURL(e.target.files[0]);
      const formData = new FormData();
      formData.append("file", e.target.files[0]);

      const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinata_api_key,
          pinata_secret_api_key: pinata_secret_api_key,
        },
      });

      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
      setImageIpfs(ipfsUrl);
    }
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
      {/* {loadingImage && <SuspenseLoader />} */}
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

      <Dialog open={open} onClose={handleClose} scroll="paper" aria-labelledby="scroll-dialog-title" aria-describedby="scroll-dialog-description" sx={{ overflowX: "hidden" }}>
        <DialogTitle id="scroll-dialog-title" sx={{ padding: "16px 24px 0px 24px" }}>
          {isEditing ? "Update Plan" : "Add Plan"}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: 550 }}>
          <DialogContent>
            <Box sx={{ maxHeight: "calc(100vh - 250px)", overflowY: "auto", maxWidth: "100%" }}>
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
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button onClick={() => append({ description: "" })} sx={{ fontSize: 13, fontWeight: 400 }} color="primary" startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add New Item
                  </Button>
                </Box>
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
              <Card className={classes.card}>
                {
                  <>
                    {loadingImage ? <SuspenseLoader /> : <CardMedia className={classes.media} image={croppedImageUrl} />}
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "rgba(255, 255, 255, 0.8)",
                        "&:hover": {
                          background: theme.colors.primary.lighter,
                        },
                      }}
                      color="inherit"
                      htmlFor="profileImageInput"
                      size="large"
                    >
                      <PhotoCameraIcon fontSize="large" sx={{ color: "#0481D9" }} />
                      <input id="profileImageInput" type="file" accept="image/*" {...register("planImage", { onChange: (e) => handleFile(e) })} hidden />
                    </IconButton>
                    {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallbackPlan} openCropModal={openCropModal} setCropModal={setCropModal} setLoadingImage={setLoadingImage} />}
                  </>
                }
              </Card>
              {/* <div>
              <Card className={classes.card}>
                {croppedImageUrl && <CardMedia className={classes.media} image={croppedImageUrl} />}
                <IconButton
                  component="label"
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
                  color="inherit"
                  htmlFor="profileImageInput"
                  size="large"
                >
                  <PhotoCameraIcon fontSize="large" sx={{ color: "#0481D9" }} />
                  <input id="profileImageInput" type="file" accept="image/*" {...register("planImage", { onChange: (e) => handleFile(e) })} hidden />
                </IconButton>
                {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallbackPlan} openCropModal={openCropModal} setCropModal={setCropModal} />}

                {errors.planImage && <Typography color="error">{errors.planImage.message}</Typography>}
              </Card>
            </div> */}
              {/* <div>
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
                    <Card className={classes.card}>
                      {croppedImageUrl && <CardMedia className={classes.media} image={croppedImageUrl} />}
                      <IconButton
                        component="label"
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
                        color="inherit"
                        htmlFor="profileImageInput"
                        size="large"
                      >
                        <PhotoCameraIcon fontSize="large" sx={{ color: "#0481D9" }} />
                        <input id="profileImageInput" type="file" accept="image/*" {...register("planImage", { onChange: (e) => handleFile(e) })} hidden />
                      </IconButton>
                      {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallbackPlan} openCropModal={openCropModal} setCropModal={setCropModal} />}

                      {errors.planImage && <Typography color="error">{errors.planImage.message}</Typography>}
                    </Card>
                  </>
                )}
              />
            </div> */}
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
                render={({ field }) => <TextField {...field} label="NFT Metadata Description" margin="normal" fullWidth error={!!errors.mtdescription} helperText={errors?.mtdescription?.message} />}
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
                <label>Product Count</label>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <RadioGroup value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)} style={{ flexDirection: "row" }}>
                    <FormControlLabel value="all" control={<Radio />} label="All" />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom" />
                  </RadioGroup>
                </div>

                {selectedOption === "custom" && (
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
                      <>
                        <TextField
                          {...field}
                          label="Enter Product Count"
                          margin="normal"
                          fullWidth
                          error={!!errors.supportableProductCount}
                          helperText={errors?.supportableProductCount?.message}
                          autoFocus
                        />
                      </>
                    )}
                  />
                )}
              </div>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={addPlanLoader || updatePlanLoader}>
              Submit
            </Button>
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
      <DialogComponent
        open={imageModal}
        width={324}
        height={240}
        handleClose={handleCloseImage}
        content={
          <Box display="flex" flexDirection="column" alignItems="center">
            <ErrorOutlineIcon color="error" sx={{ fontSize: 72, mb: 4 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Please choose image more than 300 * 300</strong>
            </DialogContentText>
          </Box>
        }
        actions={undefined}
      />
    </Container>
  );
};

export default Subscription;
