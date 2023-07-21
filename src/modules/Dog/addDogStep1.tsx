import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardMedia,
  Checkbox,
  CircularProgress,
  Container,
  DialogContentText,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import RenderField from "./RenderField";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DialogComponent from "../../shared/components/Dialog";
import CropModal from "../../shared/components/CropModal";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "react-image-crop/dist/ReactCrop.css";
import { makeStyles } from "@mui/styles";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

const useStyles = makeStyles({
  card: {
    width: 300,
    height: 300,
    marginLeft: "3rem",
    display: "flex",
    justifyContent: "center",
    borderRadius: "none !important",
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

const Step1 = ({ onNext, dogData, fields }) => {
  const theme = useTheme();
  const classes = useStyles();
  const [loadingImage, setLoadingImage] = useState(false);
  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(null);
  const [openCropModal, setCropModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const setCroppedImageUrlCallback = useCallback(
    (url) => {
      setLoadingImage(false);
      setCroppedImageUrl(url);
    },
    [croppedImageUrl]
  );
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (dogData) {
      setValue("name", dogData.name);
      setValue("image", dogData.image);
      setCroppedImageUrl(dogData.image);
      setValue("status", dogData.status);
    }
  }, [dogData, setValue]);

  const handleFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageUploaded(true);
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
    }
  };

  const handleClose = () => {
    setImageModal(false);
  };

  const onSubmit = (formData) => {
    formData.image = croppedImageUrl;
    if (Object.keys(errors).length > 0) {
      console.log("errors");
      return;
    }
    const updatedFormData = {
      entity: fields.map((field) => {
        let data = formData[field.fieldName];
        return {
          fieldName: field.fieldName,
          dataType: field.dataType,
          data: data,
        };
      }),
    };

    onNext(updatedFormData);
  };

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container>
            <Grid item xs={6} md={8}>
              <TextField
                {...register("name", {
                  required: `Please enter dog name`,
                  pattern: {
                    value: /^(?! )[A-Za-z ]*$/,
                    message: `Please enter a valid name`,
                  },
                  validate: (value) => value.length <= 20 || `Max length exceeded for name`,
                })}
                label="Dog Name"
                type="text"
                margin="normal"
                defaultValue={dogData ? dogData?.name : ""}
                fullWidth
                error={!!errors["name"]}
                required
                helperText={errors?.["name"]?.message}
              />
              <FormControl fullWidth variant="outlined" sx={{ mt: 2 }} required>
                <InputLabel>Status</InputLabel>
                <Select {...register("status", { required: `Please select status` })} displayEmpty defaultValue={dogData ? dogData.status : ""} label="status" fullWidth>
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="inactive">inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} md={4}>
              <Box
                sx={{
                  width: 300,
                  height: 300,
                  marginLeft: "3rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  boxShadow: "-0.2px 0.3px 1px 0.6px #cec9c9",
                  borderRadius: 1,
                }}
              >
                <Card>
                  {
                    <>
                      {loadingImage ? <CircularProgress /> : <CardMedia component="img" className={classes.media} image={croppedImageUrl} />}
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
                        <input id="profileImageInput" type="file" accept="image/*" {...register("image", { onChange: (e) => handleFile(e) })} hidden />
                      </IconButton>
                      {src && <CropModal src={src} setCroppedImageUrl={setCroppedImageUrlCallback} openCropModal={openCropModal} setCropModal={setCropModal} setLoadingImage={setLoadingImage} />}
                      {imageModal && (
                        <DialogComponent
                          open={imageModal}
                          width={324}
                          height={240}
                          handleClose={handleClose}
                          content={
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <ErrorOutlineIcon color="error" sx={{ fontSize: 72, mb: 4 }} />
                              <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
                                <strong>Please choose an image larger than 300x300</strong>
                              </DialogContentText>
                            </Box>
                          }
                          actions={undefined}
                        />
                      )}
                    </>
                  }
                </Card>
              </Box>
            </Grid>
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
              <Grid item>
                <Button type="submit" variant="contained" disabled={Object.keys(errors).length > 0}>
                  Next
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Step1;
