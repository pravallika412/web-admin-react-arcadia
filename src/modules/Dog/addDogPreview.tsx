import React, { useCallback, useState } from "react";
import {
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Container,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Grid,
  Card,
  CardMedia,
  DialogContentText,
  useTheme,
} from "@mui/material";
import { useForm } from "react-hook-form";
import RenderField from "./RenderField";
import moment from "moment";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";
import DialogComponent from "../../shared/components/Dialog";
import CropModal from "../../shared/components/CropModal";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import "react-image-crop/dist/ReactCrop.css";
import { makeStyles } from "@mui/styles";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import ClearIcon from "@mui/icons-material/Clear";

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

const Preview = ({ data, onBack, onReset, onSave }) => {
  console.log(data);
  const theme = useTheme();
  const classes = useStyles();
  const [entity, setEntity] = useState(data.entity);
  const [basicInformation, setBasicInformation] = useState(data.basicInformation);
  const [aboutMe, setAboutMe] = useState(data.aboutMe);
  const [sections, setSections] = useState(data.section);
  // const [formData, setFormData] = useState(data);
  const [fieldFiles, setFieldFiles] = useState({});
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingImage, setLoadingImage] = useState(false);
  const [src, setSrc] = useState(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState(data.entity ? data.entity[1].data : null);
  const [openCropModal, setCropModal] = useState(false);
  const [imageModal, setImageModal] = useState(false);
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

  const onSubmit = () => {
    console.log("final", data);
    data.entity[1].data = croppedImageUrl;
    const updatedFormData = {
      entity: data.entity.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      basicInformation: data.basicInformation.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      aboutMe: data.aboutMe.reduce((acc, field) => {
        if (field.data !== null && field.data !== "") {
          acc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.dataType === 3 ? moment(field.data, "YYYY-MM-DD").utc().format() : field.data });
        }
        return acc;
      }, []),
      section: Object.keys(data.section).reduce((acc, sectionKey) => {
        acc[sectionKey] = {
          section_name: data.section[sectionKey].section_name,
          section_details: [
            data.section[sectionKey].section_details.reduce((detailsAcc, field) => {
              if (field.data !== null && field.data != "") {
                if (field.dataType === 3) {
                  const date = field.data ? moment(field.data, "YYYY-MM-DD").utc().format() : "";
                  detailsAcc.push({ [field.fieldName]: date });
                } else {
                  detailsAcc.push({ [field.fieldName]: field.dataType === 2 ? parseInt(field.data) : field.data });
                }
              }
              return detailsAcc;
            }, []),
          ],
        };
        return acc;
      }, {}),
    };

    console.log(updatedFormData);
    onSave(updatedFormData);
  };

  const generatePresignedUrls = async (files, sectionKey, fieldIndex, datatype) => {
    const updatedSections = { ...sections };
    const uploadPromises = files.map(async (file) => {
      const signedUrlDto = {
        fileName: file.name,
        fileType: file.type,
        filePath: "sponsor",
      };

      const response = await generatePresignedUrl({ variables: { input: signedUrlDto } });
      const fileurl = response.data.GeneratePresignedUrl.presignedUrl;
      await fetch(fileurl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      return fileurl;
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      if (datatype === 7) {
        // Single File
        const imageurl = uploadedUrls[0].split("?")[0];
        if (sectionKey === "basicInformation") {
          const updatedBasicInformation = [...basicInformation];
          updatedBasicInformation[fieldIndex].data = imageurl;
          setBasicInformation(updatedBasicInformation);
        } else if (sectionKey === "aboutMe") {
          const updatedAboutMe = [...aboutMe];
          updatedAboutMe[fieldIndex].data = imageurl;
          setAboutMe(updatedAboutMe);
        } else {
          updatedSections[sectionKey].section_details[fieldIndex].data = imageurl;
          setSections(updatedSections);
        }
      } else if (datatype === 8) {
        // Multiple Files
        const cleanedUrls = uploadedUrls.map((url) => url.split("?")[0]);
        if (sectionKey === "basicInformation") {
          const updatedBasicInformation = [...basicInformation];
          updatedBasicInformation[fieldIndex].data = cleanedUrls;
          setBasicInformation(updatedBasicInformation);
        } else if (sectionKey === "aboutMe") {
          const updatedAboutMe = [...aboutMe];
          updatedAboutMe[fieldIndex].data = cleanedUrls;
          setAboutMe(updatedAboutMe);
        } else {
          updatedSections[sectionKey].section_details[fieldIndex].data = cleanedUrls;
          setSections(updatedSections);
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleFileDeselect = (fileIndex, sectionKey, fieldIndex) => {
    const updatedFiles = [...fieldFiles[sectionKey][fieldIndex]];
    updatedFiles.splice(fileIndex, 1);
    console.log(updatedFiles);
    setFieldFiles((prevFieldFiles) => ({
      ...prevFieldFiles,
      [sectionKey]: {
        ...prevFieldFiles[sectionKey],
        [fieldIndex]: updatedFiles.length > 0 ? updatedFiles : undefined,
      },
    }));
    generatePresignedUrls(updatedFiles, sectionKey, fieldIndex, 8);
  };

  const handleChange = async (e, sectionKey, fieldIndex, dataType) => {
    const files = e.target.files;
    const updatedSections = { ...sections };
    let value = e.target.value;
    let error = "";

    // Perform field-specific validation
    if (dataType === 1 && !/^(?! )[A-Za-z ]*$/.test(value)) {
      error = "Invalid input. Only letters and spaces are allowed.";
    } else if (dataType === 2 && value < 0) {
      error = "Invalid input. Only positive numbers are allowed.";
    }
    if (dataType === 3) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Regex pattern for dd/mm/yyyy format
      if (!dateRegex.test(value)) {
        error = "Invalid date format. Please enter a date in the format dd/mm/yyyy.";
      }
    }
    setFieldErrors((prevErrors) => ({
      ...prevErrors,
      [`${sectionKey}-${fieldIndex}`]: error, // Store the error for the specific field
    }));

    if (e.target.files && e.target.files.length > 0) {
      setFieldFiles((prevFieldFiles) => ({
        ...prevFieldFiles,
        [sectionKey]: {
          ...prevFieldFiles[sectionKey],
          [fieldIndex]: Array.from(files),
        },
      }));
      if (dataType === 7) {
        generatePresignedUrls([files[0]], sectionKey, fieldIndex, dataType);
      } else if (dataType === 8) {
        const newFiles = Array.from(files);
        generatePresignedUrls(newFiles, sectionKey, fieldIndex, dataType);
      }
    } else {
      if (sectionKey === "basicInformation") {
        const updatedBasicInformation = [...basicInformation];
        updatedBasicInformation[fieldIndex].data = e.target.value;
        setBasicInformation(updatedBasicInformation);
      } else if (sectionKey === "aboutMe") {
        const updatedAboutMe = [...aboutMe];
        updatedAboutMe[fieldIndex].data = e.target.value;
        setAboutMe(updatedAboutMe);
      } else {
        updatedSections[sectionKey].section_details[fieldIndex].data = e.target.value;
        setSections(updatedSections);
      }
    }
  };

  const renderField = (field, fieldIndex, sectionKey) => {
    const { fieldName, dataType, data } = field;
    let fieldComponent = null;
    const errorKey = `${sectionKey}-${fieldIndex}`;
    const errorMessage = fieldErrors[errorKey];
    const showError = errorMessage && errorMessage !== "";
    const errorColor = "#FF5E68";
    const fieldBorderColor = showError ? errorColor : "";
    switch (dataType) {
      case 1:
        fieldComponent = (
          <TextField
            label={fieldName}
            margin="normal"
            fullWidth
            value={data}
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)}
            helperText={showError ? <span style={{ color: errorColor }}>{errorMessage}</span> : ""}
          />
        );
        break;
      case 2:
        fieldComponent = (
          <TextField
            label={fieldName}
            margin="normal"
            fullWidth
            type="number"
            value={data}
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)}
            helperText={showError ? <span style={{ color: errorColor }}>{errorMessage}</span> : ""}
          />
        );
        break;
      case 3:
        const formattedDate = data && moment(data).format("YYYY-MM-DD");
        fieldComponent = (
          <TextField
            label={fieldName}
            margin="normal"
            fullWidth
            type="date"
            value={formattedDate ? formattedDate : ""}
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)}
            InputLabelProps={{ shrink: true }}
            helperText={showError ? <span style={{ color: errorColor }}>{errorMessage}</span> : ""}
          />
        );
        break;
      case 4:
        fieldComponent = (
          <div>
            <label>
              <input type="checkbox" checked={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)} />
              {fieldName}
            </label>
          </div>
        );
        break;
      case 5:
        fieldComponent = (
          <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
            <InputLabel>{fieldName}</InputLabel>
            <Select label={fieldName} value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)} fullWidth>
              {typeof data === "string" ? (
                <MenuItem value={data}>{data}</MenuItem>
              ) : (
                data.map((option, optionIndex) => (
                  <MenuItem key={optionIndex} value={option}>
                    {option}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        );
        break;
      case 6:
        fieldComponent = (
          <TextField aria-label={fieldName} minRows={3} placeholder={fieldName} multiline margin="normal" fullWidth value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)} />
        );
        break;
      case 7:
        fieldComponent = (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: 1,
              borderRadius: 1,
              borderStyle: "dashed",
              borderColor: "var(--font-400, #808080)",
              bgcolor: "var(--font-025, #FFF)",
              height: 100,
              width: "100%",
              p: 2,
            }}
          >
            <IconButton component="label">
              <CloudUploadIcon fontSize="large" />
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)} />
            </IconButton>
            {fieldFiles[sectionKey]?.[fieldIndex]?.[0]?.name ? (
              <Typography variant="subtitle2" mt={1}>
                {fieldFiles[sectionKey][fieldIndex][0].name}
              </Typography>
            ) : (
              <Typography variant="subtitle2" mt={1}>
                {data ? data.split("/").pop() : "Upload a file"}
              </Typography>
            )}
          </Box>
        );
        break;
      case 8:
        fieldComponent = (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: 1,
              borderRadius: 1,
              borderStyle: "dashed",
              borderColor: "var(--font-400, #808080)",
              bgcolor: "var(--font-025, #FFF)",
              height: 100,
              width: "100%",
              p: 2,
            }}
          >
            <IconButton component="label">
              <CloudUploadIcon fontSize="large" />
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType)} multiple />
            </IconButton>
            {fieldFiles[fieldName]?.length > 0 ? (
              fieldFiles[sectionKey]?.[fieldIndex]?.map((file, fileIndex) => (
                <div key={fileIndex} style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2" mt={1} style={{ marginRight: "8px" }}>
                    {file.name}
                  </Typography>
                  <IconButton size="small" onClick={() => handleFileDeselect(fileIndex, sectionKey, fieldIndex)} style={{ padding: "4px" }}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </div>
              ))
            ) : (
              <Typography variant="subtitle2" mt={1}>
                {data && data.length > 0 ? data.map((url) => url.split("/").pop()).join(", ") : "Upload a file"}
              </Typography>
            )}
          </Box>
        );
        break;
      default:
        break;
    }

    return (
      <div key={fieldIndex}>
        {fieldComponent}
        {/* {showError && <Box sx={{ color: "#FF5E68" }}>{errorMessage}</Box>} */}
      </div>
    );
  };

  const handleClose = () => {
    setImageModal(false);
  };

  const handleFile = (e) => {
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
    }
  };

  return (
    <div>
      <Container component="main">
        <Paper elevation={3} sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container>
              <Grid item xs={6} md={8}>
                <h3>Entity</h3>
                <TextField
                  {...register("name", {
                    required: `Please enter dog name`,
                    pattern: {
                      value: /^(?! )[A-Za-z ]*$/,
                      message: `Please enter a valid name`,
                    },
                    validate: (value) => value.length <= 20 || `Max length exceeded for name`,
                  })}
                  label="name"
                  type="text"
                  margin="normal"
                  defaultValue={entity ? entity[0]?.data : ""}
                  fullWidth
                  error={!!errors["name"]}
                  helperText={errors?.["name"]?.message}
                />
                <FormControl fullWidth variant="outlined" sx={{ mt: 2 }}>
                  <InputLabel>status</InputLabel>
                  <Select {...register("status")} displayEmpty defaultValue={entity ? entity[2].data : ""} label="status" fullWidth>
                    <MenuItem value="active">active</MenuItem>
                    <MenuItem value="inactive">inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} md={4}>
                <Card className={classes.card}>
                  {
                    <>
                      {loadingImage ? <SuspenseLoader /> : <CardMedia component="img" className={classes.media} image={croppedImageUrl} />}
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
              </Grid>
            </Grid>
            <h3>Basic Information</h3>
            {basicInformation.map((field, fieldIndex) => renderField(field, fieldIndex, "basicInformation"))}

            <h3>About Me</h3>
            {aboutMe.map((field, fieldIndex) => renderField(field, fieldIndex, "aboutMe"))}

            {Object.keys(sections).map((sectionKey) => (
              <div key={sectionKey}>
                <h3>{sections[sectionKey].section_name}</h3>
                {sections[sectionKey].section_details.map((field, fieldIndex) => renderField(field, fieldIndex, sectionKey))}
              </div>
            ))}
            <Button onClick={onBack}>Back</Button>
            <Button type="submit" disabled={Object.keys(errors).length > 0}>
              Create
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Preview;
