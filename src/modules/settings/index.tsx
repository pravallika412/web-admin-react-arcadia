import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Skeleton,
  Snackbar,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { GET_ADMIN, UPDATE_PROFILE } from "../../shared/graphQL/settings/queries";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Alert from "@mui/material/Alert";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ChangePassword from "./changePassword";
import CircularProgress from "@mui/material/CircularProgress";
import Web3 from "web3";
import Notifications from "./notifications";
import Transaction from "./Transaction";
import TokenList from "./wallet";
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import CropModal from "../../shared/components/CropModal";

const web3 = new Web3();
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

type Severity = "success" | "error" | "warning";

const useStyles = makeStyles({
  card: {
    width: 300,
    height: 300,
    marginLeft: "4rem",
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
  uploadButton: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    margin: "0 auto",
  },
  disabledButton: {
    background: `#024C7F !important`,
    color: `rgba(255, 255, 255) !important`,
    opacity: 0.7,
  },
});

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`} {...other}>
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const Settings = () => {
  const theme = useTheme();
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1 / 1);

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState(true);
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [file, setFile] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [presignedURL, setPresignedURL] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const [openProfileStatus, setOpenProfileStatus] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN);
  const [updateProfile, { data: updateProfileData }] = useMutation(UPDATE_PROFILE);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [openCropModal, setCropModal] = useState(false);
  const setCroppedImageUrlCallback = useCallback(
    (url) => {
      setCroppedImageUrl(url);
    },
    [croppedImageUrl]
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm();

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (updateProfileData) {
      setOpenProfileStatus(true);
      refetch();
    }
  }, [updateProfileData]);

  useEffect(() => {
    if (getAdminData) {
      let data = getAdminData.getAdmin;
      setCroppedImageUrl(data.profile_image);
      let initial_values = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        walletAddress: data.matic_wallet.wallet_address,
        profileImage: data.profile_image,
      };
      reset(initial_values);
      setLoading(false);
    }
  }, [getAdminData, reset]);

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

  const handleFileChange = (event: any) => {
    event.preventDefault();
    setLoadingImage(true);
    setFile(event.target.files[0]);
    let payload = {
      fileName: event.target.files[0].name,
      fileType: event.target.files[0].type,
      filePath: "sponsor",
    };
    generatePresignedUrl({ variables: { input: payload } });
  };

  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleProfileClose = () => {
    setOpenProfileStatus(false);
  };

  const onSubmit = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      profileImage: presignedURL ? presignedURL : null,
    };
    updateProfile({ variables: { input: payload } });
  };

  const uploadImageFn = async (url, data) => {
    await fetch(url, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": data.type,
      },
    });
    setLoadingImage(false);
    setPresignedURL(uploadFile.split("?")[0]);
  };

  const handleFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          setSrc(reader.result);
          setCropModal(true);
        },
        false
      );
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <>
      <Grid container justifyContent="end" alignItems="center" sx={{ ms: 2, mt: 2 }}>
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Settings" />
              <Divider />
              <CardContent>
                <Box sx={{ width: "100%" }}>
                  <Tabs variant="scrollable" scrollButtons="auto" textColor="primary" indicatorColor="primary" value={value} onChange={handleChange} aria-label="core entity">
                    <Tab label="My Profile" {...a11yProps(0)} />
                    <Tab label="Change Password" {...a11yProps(1)} />
                    <Tab label="Notifications" {...a11yProps(2)} />
                    <Tab label="Wallet" {...a11yProps(3)} />
                    <Tab label="Transaction History" {...a11yProps(4)} />
                  </Tabs>
                  <TabPanel value={value} index={0}>
                    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                      <Grid container>
                        <Grid item xs={6} md={8}>
                          <>
                            <Typography variant="h4" sx={{ mt: 1, mb: 2 }}>
                              My Profile
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6} md={6}>
                                {loading ? (
                                  <Skeleton variant="text" width="100%" height={70} />
                                ) : (
                                  <TextField
                                    label="First Name"
                                    {...register("firstName", {
                                      pattern: {
                                        value: /^[A-Za-z][A-Za-z\s]*$/,
                                        message: "Please enter valid name",
                                      },
                                      maxLength: {
                                        value: 15,
                                        message: "Max length exceeded",
                                      },
                                    })}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    error={!!errors.firstName}
                                    helperText={errors?.firstName?.message}
                                  />
                                )}
                              </Grid>
                              <Grid item xs={6} md={6}>
                                {loading ? (
                                  <Skeleton variant="text" width="100%" height={70} />
                                ) : (
                                  <TextField
                                    label="Last Name"
                                    {...register("lastName", {
                                      pattern: {
                                        value: /^[A-Za-z][A-Za-z\s]*$/,
                                        message: "Please enter valid name",
                                      },
                                      maxLength: {
                                        value: 15,
                                        message: "Max length exceeded",
                                      },
                                    })}
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    error={!!errors.lastName}
                                    helperText={errors?.lastName?.message}
                                  />
                                )}
                              </Grid>
                            </Grid>
                            <Grid item xs={12} md={12}>
                              {loading ? (
                                <Skeleton variant="text" width="100%" height={70} />
                              ) : (
                                <TextField label="Email Address" {...register("email")} disabled margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                              )}
                            </Grid>
                            <Grid item xs={12} md={12}>
                              {loading ? (
                                <Skeleton variant="text" width="100%" height={70} />
                              ) : (
                                <TextField label="Wallet Address" {...register("walletAddress")} disabled margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                              )}
                            </Grid>
                            <Grid item xs={12} md={12}>
                              {/* <input type="file" onChange={handleFile} /> */}

                              {/* {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallback} openCropModal={openCropModal} setCropModal={setCropModal} />}

                              {croppedImageUrl && <img src={croppedImageUrl} width="200" height="200" alt="" />} */}
                            </Grid>
                          </>
                        </Grid>
                        <Grid item xs={6} md={4}>
                          <Card className={classes.card}>
                            {loadingImage ? (
                              <CircularProgress />
                            ) : croppedImageUrl ? (
                              <>
                                <CardMedia className={classes.media} image={croppedImageUrl} />
                                <IconButton
                                  component="label"
                                  sx={{
                                    position: "absolute",
                                    top: "10%",
                                    left: "90%",
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
                                  <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { onChange: (e) => handleFile(e) })} hidden />
                                </IconButton>
                                {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallback} openCropModal={openCropModal} setCropModal={setCropModal} />}
                              </>
                            ) : (
                              <div>
                                <IconButton
                                  component="label"
                                  sx={{
                                    "&:hover": {
                                      background: theme.colors.primary.lighter,
                                    },
                                    color: theme.palette.primary.main,
                                  }}
                                  color="inherit"
                                  htmlFor="profileImageInput"
                                  size="large"
                                >
                                  <PhotoCameraIcon fontSize="large" sx={{ color: "#0481D9" }} />
                                  <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { onChange: (e) => handleFile(e) })} hidden />
                                </IconButton>
                              </div>
                            )}
                          </Card>
                        </Grid>
                      </Grid>
                      <Grid sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Button variant="contained" type="submit" disabled={loadingImage || Object.keys(errors).length > 0} classes={{ disabled: classes.disabledButton }}>
                          Update
                        </Button>
                      </Grid>
                    </Box>
                  </TabPanel>
                  <TabPanel value={value} index={1}>
                    <ChangePassword />
                  </TabPanel>
                  <TabPanel value={value} index={2}>
                    <Notifications />
                  </TabPanel>
                  <TabPanel value={value} index={3}>
                    <TokenList address={getAdminData?.getAdmin.matic_wallet.wallet_address} />
                  </TabPanel>
                  <TabPanel value={value} index={4}>
                    <Transaction />
                  </TabPanel>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
      <Dialog open={openProfileStatus} fullScreen={fullScreen} onClose={handleProfileClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box display="flex" justifyContent="flex-end" p={1} sx={{ overflow: "hidden" }}>
          <IconButton edge="end" color="primary" onClick={handleProfileClose} aria-label="close">
            <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ width: 324, height: 240 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 70, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong>Profile Updated Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Settings;
