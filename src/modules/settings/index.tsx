import { useLazyQuery, useMutation } from "@apollo/client";
import { Box, Button, Card, CardContent, CardHeader, CardMedia, Divider, Grid, IconButton, Tab, Tabs, TextField, Typography, useTheme } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { SyntheticEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { GET_ADMIN, UPDATE_PROFILE } from "../../shared/graphQL/settings/queries";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const useStyles = makeStyles({
  card: {
    width: 332,
    height: 317,
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

const Settings = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [value, setValue] = useState(0);
  const [file, setFile] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [presignedURL, setPresignedURL] = useState(null);
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN);
  const [updateProfile, { data: updateProfileData }] = useMutation(UPDATE_PROFILE);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  const { control, register, handleSubmit, reset } = useForm();

  useEffect(() => {
    getAdmin();
  }, []);

  useEffect(() => {
    if (updateProfileData) {
      refetch();
    }
  }, [updateProfileData]);

  useEffect(() => {
    if (getAdminData) {
      let data = getAdminData.getAdmin;
      setPresignedURL(data.profile_image);
      let initial_values = {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        walletAddress: data.matic_wallet.wallet_address,
        merchantAddress: data.merchant_address,
        profileImage: data.profile_image,
      };
      reset(initial_values);
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

  const onSubmit = (data) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      profileImage: presignedURL ? presignedURL : "",
      merchantAddress: data.merchantAddress,
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
    setPresignedURL(uploadFile.split("?")[0]);
  };

  return (
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
                  {/* <Tab label="Wallet" {...a11yProps(3)} /> */}
                  <Tab label="Transaction History" {...a11yProps(4)} />
                </Tabs>
                <TabPanel value={value} index={0}>
                  <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container>
                      <Grid item xs={6} md={7}>
                        <Typography variant="h4">My Profile</Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} md={6}>
                            <TextField label="First Name" {...register("firstName")} margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                          </Grid>
                          <Grid item xs={6} md={6}>
                            <TextField label="Last Name" {...register("lastName")} margin="normal" InputLabelProps={{ shrink: true }} fullWidth></TextField>
                          </Grid>
                        </Grid>
                        <Grid item xs={12} md={12}>
                          <TextField label="Email Address" {...register("email")} disabled margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={12}>
                          <TextField label="Wallet Address" {...register("email")} disabled margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                        </Grid>
                        <Grid item xs={12} md={12}>
                          <TextField label="Merchant Address" {...register("merchantAddress")} margin="normal" InputLabelProps={{ shrink: true }} fullWidth />
                        </Grid>
                      </Grid>
                      <Grid item xs={6} md={5}>
                        <Card className={classes.card}>
                          {presignedURL ? (
                            <>
                              <CardMedia className={classes.media} image={presignedURL} />
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
                                <CloudUploadIcon fontSize="large" sx={{ color: "#0481D9" }} />
                                <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { onChange: (e) => handleFileChange(e) })} hidden />
                              </IconButton>
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
                                <CloudUploadIcon fontSize="large" sx={{ color: "#0481D9" }} />
                                <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { onChange: (e) => handleFileChange(e) })} hidden />
                              </IconButton>
                            </div>
                          )}
                        </Card>
                      </Grid>
                    </Grid>
                    <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button variant="contained" type="submit">
                        Update
                      </Button>
                    </Grid>
                  </Box>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Grid container>
                    <Typography variant="h4">Change Password</Typography>
                    <TextField label="Current Password" margin="normal" fullWidth />
                    <TextField label="New Password" margin="normal" fullWidth />
                    <TextField label="Confirm Password" margin="normal" fullWidth />
                  </Grid>
                </TabPanel>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Settings;