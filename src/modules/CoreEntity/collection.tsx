import { useFieldArray, useForm } from "react-hook-form";
import { Grid, TextField, Button, Box, Card, CircularProgress, IconButton, useTheme, CardMedia, Skeleton, DialogContentText, Typography } from "@mui/material";
import { useLazyQuery, useMutation } from "@apollo/client";
import { CREATE_COLLECTION } from "../../shared/graphQL/core-entity/queries";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { makeStyles } from "@mui/styles";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import Web3 from "web3";
import { collectionABI } from "../../shared/utilities/abi/collectionabi";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";
import DialogComponent from "../../shared/components/Dialog";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { GET_ADMIN } from "../../shared/graphQL/settings/queries";

const useStyles = makeStyles({
  card: {
    width: 227,
    height: 206,
    marginLeft: "1rem",
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

const Collection = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const pinata_api_key = process.env.PINATA_API_KEY;
  const pinata_secret_api_key = process.env.PINATA_API_SECRET_KEY;
  const alchemy_api_key = process.env.ALCHEMY_API_KEY;
  const [collectionImage, setCollectionImage] = useState("");
  const [presignedURL, setPresignedURL] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [createCollection, { data: createCollectionData, loading: collectionLoader }] = useMutation(CREATE_COLLECTION);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [brandDetailsData, setBrandDetailsData] = useState(null);
  const [loadingBrandDetails, setLoadingBrandDetails] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [membershipCA, setMembershipCA] = useState(localStorage.getItem("membership_address"));
  const [getAdmin, { data: getAdminData, refetch }] = useLazyQuery(GET_ADMIN, { fetchPolicy: "no-cache" });
  const web3 = new Web3(`https://polygon-mumbai.g.alchemy.com/v2/${alchemy_api_key}`);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "properties",
  });

  useEffect(() => {
    const address = membershipCA;
    if (address !== "null") {
      fetchBrandDetails(address);
    }
  }, [membershipCA]);

  useEffect(() => {
    if (createCollectionData) {
      getAdmin();
    }
  }, [createCollectionData]);

  useEffect(() => {
    if (getAdminData) {
      localStorage.setItem("membership_address", getAdminData.getAdmin.brandDetails.membership_contract_address);
      setMembershipCA(getAdminData.getAdmin.brandDetails.membership_contract_address);
    }
  }, [getAdminData]);

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

  const fetchBrandDetails = async (address) => {
    setLoadingBrandDetails(true);
    try {
      const brand_instance = new web3.eth.Contract(collectionABI, address);
      const name = await brand_instance.methods.name().call();
      const symbol = await brand_instance.methods.symbol().call();
      const defaultURI = await brand_instance.methods.defaultURI().call();

      const response = await fetch(defaultURI);
      const data = await response.json();

      setBrandDetailsData({
        name,
        symbol,
        description: data.description,
        brandProperties: data.attributes,
        image: data.image,
      });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoadingBrandDetails(false);
    }
  };

  const handleFileChange = async (event: any) => {
    event.preventDefault();
    setLoadingImage(true);
    setFile(event.target.files[0]);
    let payload = {
      fileName: event.target.files[0].name,
      fileType: event.target.files[0].type,
      filePath: "sponsor",
    };
    generatePresignedUrl({ variables: { input: payload } });
    let formData = new FormData();
    formData.append("file", event.target.files[0]);
    const config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
      headers: {
        pinata_api_key: pinata_api_key,
        pinata_secret_api_key: pinata_secret_api_key,
        "Content-Type": `multipart/form-data;`,
      },
      data: formData,
    };

    // Make request
    try {
      const response = await axios(config);
      setCollectionImage(response.data.IpfsHash);
      // setLoadingImage(false);
    } catch (error) {
      setLoadingImage(false);
    }
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

  const onSubmit = async (data) => {
    let data1 = JSON.stringify({
      pinataContent: {
        description: data.description,
        external_url: "https://dev.d50w243ncde5q.amplifyapp.com/",
        image: `https://gateway.pinata.cloud/ipfs/${collectionImage}`,
        name: data.name,
        attributes: [
          {
            trait_type: "symbol",
            value: data.symbolValue,
          },
          ...data.properties.map((property) => ({
            trait_type: property.name,
            value: property.value,
          })),
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
    let payload = {
      name: data.name,
      symbol: data.symbolValue,
      defaultURI: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    };
    createCollection({ variables: { input: payload } });
  };

  const handleClose = () => {
    setDialog(false);
    refetch();
  };

  return (
    <>
      {
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={9}>
              <TextField
                fullWidth
                label="Name"
                margin="normal"
                {...register("name", {
                  required: "Name is required",
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid name",
                  },
                  maxLength: {
                    value: 15,
                    message: "Max length exceeded",
                  },
                })}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
              />
              <TextField
                fullWidth
                multiline
                label="Description"
                margin="normal"
                minRows={4}
                {...register("description", {
                  required: "Description is required",
                  maxLength: {
                    value: 200,
                    message: "Max length exceeded",
                  },
                })}
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Name" margin="normal" value="Symbol" disabled fullWidth />
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    label="Value"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    {...register("symbolValue", {
                      required: "Symbol is required",
                      pattern: {
                        value: /^[A-Za-z0-9][A-Za-z0-9\s]*$/,
                        message: "Please enter valid name",
                      },
                      maxLength: {
                        value: 10,
                        message: "Max length exceeded",
                      },
                    })}
                    error={Boolean(errors.symbolValue)}
                    helperText={errors.symbolValue?.message}
                  ></TextField>
                </Grid>
                <Grid item xs={1}>
                  <Button sx={{ mt: 2.5 }} onClick={() => append({ name: "", value: "" })} startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add
                  </Button>
                </Grid>
              </Grid>
              {fields.map((field, index) => (
                <div key={field.id}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Property Name"
                        fullWidth
                        margin="normal"
                        {...register(`properties.${index}.name`, {
                          required: "Required",
                          pattern: {
                            value: /^[A-Za-z0-9][A-Za-z0-9\s]*$/,
                            message: "Please enter valid property name",
                          },
                        })}
                        error={Boolean(errors.properties && errors.properties[index] && errors.properties[index].name)}
                        helperText={errors.properties && errors.properties[index] && errors.properties[index].name?.message}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      <TextField
                        label="Property Value"
                        fullWidth
                        margin="normal"
                        {...register(`properties.${index}.value`, {
                          required: "Required",
                          pattern: {
                            value: /^[A-Za-z0-9][A-Za-z0-9\s]*$/,
                            message: "Please enter valid property value",
                          },
                        })}
                        error={Boolean(errors.properties && errors.properties[index] && errors.properties[index].value)}
                        helperText={errors.properties && errors.properties[index] && errors.properties[index].value?.message}
                      />
                    </Grid>
                    <Grid item xs={1} sx={{ display: "flex", justifyContent: "center" }}>
                      <IconButton
                        sx={{
                          "&:hover": { background: theme.colors.error.lighter },
                          color: theme.palette.error.main,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => remove(index)}
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    </Grid>
                  </Grid>
                </div>
              ))}
            </Grid>

            <Grid item xs={3}>
              <Card className={classes.card}>
                {loadingImage ? (
                  <CircularProgress />
                ) : presignedURL ? (
                  <>
                    <CardMedia className={classes.media} image={presignedURL} />
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
                      <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { required: "Image is required", onChange: (e) => handleFileChange(e) })} hidden />
                    </IconButton>
                  </div>
                )}
              </Card>
              {errors.profileImage && (
                <Typography color="error" variant="body2" sx={{ pt: 1, pl: 2 }}>
                  {errors.profileImage?.message}
                </Typography>
              )}
            </Grid>
          </Grid>
          {collectionLoader && <SuspenseLoader left={10} />}
          <Button variant="contained" type="submit" disabled={Object.keys(errors).length > 0 || collectionLoader} classes={{ disabled: classes.disabledButton }}>
            Submit
          </Button>
        </form>
      }

      <DialogComponent
        open={dialog}
        width={324}
        height={240}
        handleClose={handleClose}
        content={
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Collection Created Successfully</strong>
            </DialogContentText>
          </Box>
        }
        actions={undefined}
      />
    </>
  );
};

export default Collection;
