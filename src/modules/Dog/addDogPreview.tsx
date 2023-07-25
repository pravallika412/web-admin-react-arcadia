import { useState } from "react";
import { Button, TextField, Container, Paper, Box, Typography, Grid, Card, CardMedia } from "@mui/material";
import { useForm } from "react-hook-form";
import moment from "moment";
import "react-image-crop/dist/ReactCrop.css";
import { makeStyles } from "@mui/styles";
import { CloudDownload } from "@mui/icons-material";
import JSZip from "jszip";

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

const Preview = ({ data, onBack, onReset, onSave, dogData }) => {
  const classes = useStyles();
  const [entity, setEntity] = useState(data.entity);
  const [basicInformation, setBasicInformation] = useState(data.basicInformation);
  const [aboutMe, setAboutMe] = useState(data.aboutMe);
  const [sections, setSections] = useState(data.section);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loadingImage, setLoadingImage] = useState(false);
  const [croppedImageUrl, setCroppedImageUrl] = useState(data.entity ? data.entity[1].data : null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const onSubmit = () => {
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
        if (dogData) {
          acc[sectionKey] = {
            section_details: data.section[sectionKey].section_details.map((detailArray) =>
              detailArray
                .filter((field) => field.data !== "") // Exclude fields with empty data
                .map((field) => {
                  const fieldValue = field.dataType === 3 ? (field.data ? moment(field.data, "YYYY-MM-DD").utc().format() : "") : field.dataType === 2 ? parseInt(field.data) : field.data;

                  return { [field.fieldName]: fieldValue };
                })
            ),
          };
          return acc;
        } else {
          acc[sectionKey] = {
            section_name: data.section[sectionKey].section_name,
            section_details: data.section[sectionKey].section_details.map((detailArray) =>
              detailArray
                .filter((field) => field.data !== "") // Exclude fields with empty data
                .map((field) => {
                  const fieldValue = field.dataType === 3 ? (field.data ? moment(field.data, "YYYY-MM-DD").utc().format() : "") : field.dataType === 2 ? parseInt(field.data) : field.data;

                  return { [field.fieldName]: fieldValue };
                })
            ),
          };
          return acc;
        }
      }, {}),
    };
    onSave(updatedFormData);
  };

  const downloadFile = (fileUrl, fileName) => {
    fetch(fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("File download failed:", error);
      });
  };

  const downloadFilesAsZip = async (fileUrls) => {
    const zip = new JSZip();

    for (let i = 0; i < fileUrls.length; i++) {
      const fileUrl = fileUrls[i];
      const response = await fetch(fileUrl);
      const fileBlob = await response.blob();
      const fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);
      zip.file(fileName, fileBlob);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = "files.zip";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
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
        fieldComponent = <TextField label={fieldName} margin="normal" fullWidth value={data} InputLabelProps={{ shrink: true }} disabled />;
        break;
      case 2:
        fieldComponent = <TextField label={fieldName} margin="normal" fullWidth type="number" InputLabelProps={{ shrink: true }} value={data} disabled />;
        break;
      case 3:
        const formattedDate = data && moment(data).format("YYYY-MM-DD");
        fieldComponent = <TextField label={fieldName} margin="normal" fullWidth type="date" value={formattedDate ? formattedDate : ""} InputLabelProps={{ shrink: true }} disabled />;
        break;
      case 4:
        fieldComponent = (
          <div>
            <label>
              <input type="checkbox" checked={data} />
              {fieldName}
            </label>
          </div>
        );
        break;
      case 5:
        fieldComponent = <TextField label={fieldName} margin="normal" InputLabelProps={{ shrink: true }} fullWidth value={data} disabled />;

        break;
      case 6:
        fieldComponent = <TextField aria-label={fieldName} minRows={3} placeholder={fieldName} multiline margin="normal" fullWidth value={data} disabled InputLabelProps={{ shrink: true }} />;
        break;
      case 7:
        fieldComponent = (
          <>
            {data && (
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
                <span style={{ cursor: "pointer" }} onClick={() => downloadFile(data, data.split("/").pop())}>
                  <CloudDownload />
                </span>
                <Typography variant="subtitle2" mt={1}>
                  {data.split("/").pop()}
                </Typography>
              </Box>
            )}
          </>
        );
        break;

      case 8:
        fieldComponent = (
          <>
            {data && (
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
                {data && data.length > 0 && (
                  <>
                    {data.map((url, index) => (
                      <span style={{ cursor: "pointer" }} onClick={() => downloadFilesAsZip(data)}>
                        <CloudDownload />
                      </span>
                    ))}
                    <Typography variant="subtitle2" mt={1}>
                      {data.map((url) => url.split("/").pop()).join(", ")}
                    </Typography>
                  </>
                )}
              </Box>
            )}
          </>
        );
        break;
      case 9:
        fieldComponent = (
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField label="Value" margin="normal" fullWidth type="number" InputLabelProps={{ shrink: true }} value={data.value} disabled />
            </Grid>
            <Grid item xs={4}>
              <TextField label="Key" margin="normal" fullWidth type="text" InputLabelProps={{ shrink: true }} value={data.unit} disabled />
            </Grid>
          </Grid>
        );
        break;
      default:
        break;
    }

    return <div key={fieldIndex}>{fieldComponent}</div>;
  };

  return (
    <div>
      <Container component="main">
        <Paper elevation={3} sx={{ p: 2 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container>
              <Grid item xs={entity[1].data ? 6 : 12} md={entity[1].data ? 8 : 12}>
                <h3>Entity</h3>
                <TextField label="name" type="text" margin="normal" defaultValue={entity ? entity[0]?.data : ""} fullWidth disabled />
                <TextField label="status" type="text" margin="normal" defaultValue={entity ? entity[2].data : ""} fullWidth disabled />
              </Grid>
              <Grid item xs={6} md={4}>
                {entity && entity[1].data ? (
                  <>
                    <Card className={classes.card}>
                      <CardMedia component="img" className={classes.media} image={entity[1].data} />
                    </Card>
                  </>
                ) : (
                  ""
                )}
              </Grid>
            </Grid>
            <h3>Basic Information</h3>
            {basicInformation.map((field, fieldIndex) => renderField(field, fieldIndex, "basicInformation"))}

            <h3>About Me</h3>
            {aboutMe.map((field, fieldIndex) => renderField(field, fieldIndex, "aboutMe"))}

            {Object.keys(sections).map((sectionKey) => (
              <div key={sectionKey}>
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <Typography variant="h3">{sections[sectionKey].section_name}</Typography>
                  </Grid>
                </Grid>
                {sections[sectionKey].section_details.map((sectionDetail, sectionDetailIndex) => (
                  <div key={sectionDetailIndex}>
                    {sectionDetail.map((field, fieldIndex) => (
                      <div key={fieldIndex}>{renderField(field, fieldIndex, sectionKey)}</div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
            <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
              <Grid item>
                <Button variant="outlined" onClick={onBack} sx={{ mr: 2 }}>
                  Back
                </Button>
                <Button type="submit" variant="contained">
                  Submit
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default Preview;
