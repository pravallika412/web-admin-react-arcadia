import { useForm } from "react-hook-form";
import { Grid, TextField, Button, Box, Card, CircularProgress, IconButton, useTheme, CardMedia } from "@mui/material";
import { useMutation } from "@apollo/client";
import { CREATE_COLLECTION } from "../../shared/graphQL/core-entity/queries";
import { useEffect, useState } from "react";
import axios from "axios";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { makeStyles } from "@mui/styles";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";

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
});

const Collection = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [file, setFile] = useState([]);
  const pinata_api_key = process.env.PINATA_API_KEY;
  const pinata_secret_api_key = process.env.PINATA_API_SECRET_KEY;
  const [collectionImage, setCollectionImage] = useState("");
  const [presignedURL, setPresignedURL] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [createCollection, { data: createCollectionData, loading: collectionLoader }] = useMutation(CREATE_COLLECTION);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (createCollectionData) {
      console.log(createCollectionData);
    }
  }, [createCollectionData]);

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
      console.log(response.data.IpfsHash);
      setCollectionImage(response.data.IpfsHash);
      // setLoadingImage(false);
    } catch (error) {
      console.log(error);
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
    console.log(uploadFile.split("?")[0]);
  };

  const onSubmit = async (data) => {
    console.log(data);
    let data1 = JSON.stringify({
      pinataContent: {
        description: data.description,
        external_url: "https://dev.d50w243ncde5q.amplifyapp.com/",
        image: `https://gateway.pinata.cloud/ipfs/${collectionImage}`,
        name: data.name,
        attributes: [
          {
            trait_type: "symbol",
            value: data.symbol,
          },
          {
            trait_type: "property",
            value: data.property,
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
    console.log(res);
    let payload = {
      name: data.name,
      symbol: data.symbol,
      defaultURI: `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`,
    };
    console.log(payload);
    createCollection({ variables: { input: payload } });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={9}>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            {...register("name", {
              required: "Required",
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
            {...register("description", { required: "Required" })}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />
          <TextField fullWidth label="Symbol" margin="normal" {...register("symbol", { required: "Required" })} error={Boolean(errors.symbol)} helperText={errors.symbol?.message} />
          <TextField fullWidth label="Property" margin="normal" {...register("property", { required: "Required" })} error={Boolean(errors.property)} helperText={errors.property?.message} />
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
                  <input id="profileImageInput" type="file" accept="image/*" {...register("profileImage", { onChange: (e) => handleFileChange(e) })} hidden />
                </IconButton>
              </div>
            )}
          </Card>
          {/* <Box border={1} borderColor="grey.500" p={1} minHeight={200} display="flex" justifyContent="center" alignItems="center" style={{ background: "dotted" }}>
            <TextField
              name="planImage"
              margin="normal"
              fullWidth
              {...register("planImage", { required: "Required", onChange: (e) => handleFileChange(e) })}
              type="file"
              InputLabelProps={{ shrink: true }}
              error={!!errors.planImage}
              helperText={errors?.planImage?.message}
            />
          </Box> */}
        </Grid>
      </Grid>
      {collectionLoader && <SuspenseLoader left={10} />}
      <Button variant="contained" type="submit" disabled={collectionLoader}>
        Submit
      </Button>
    </form>
  );
};

export default Collection;
