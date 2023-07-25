import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Container, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, TextareaAutosize, TextField, Typography, useTheme } from "@mui/material";

import { Box } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { isEqual } from "lodash";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";
import moment from "moment";
import ClearIcon from "@mui/icons-material/Clear";
import AddTwoToneIcon from "@mui/icons-material/AddTwoTone";
import DeleteTwoToneIcon from "@mui/icons-material/DeleteTwoTone";

const Step2 = ({ onBack, onNext, dogData, fields }) => {
  const theme = useTheme();
  const updatedSectionData = Object.keys(fields.section).reduce((acc, sectionKey) => {
    const section = fields.section[sectionKey];
    acc[sectionKey] = {
      ...section,
      section_details: [section.section_details],
    };
    return acc;
  }, {});

  const [basicInformation, setBasicInformation] = useState(fields.basicInformation);
  const [aboutMe, setAboutMe] = useState(fields.aboutMe);
  const [sections, setSections] = useState(updatedSectionData);
  const [fieldFiles, setFieldFiles] = useState({});
  const [basicInformationUpdated, setBasicInformationUpdated] = useState(false);
  const [aboutMeUpdated, setAboutMeUpdated] = useState(false);
  const [sectionUpdated, setSectionUpdated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (dogData) {
      if (!basicInformationUpdated && dogData.basicInformation) {
        const updatedBasicInformation = basicInformation.map((field) => {
          const { fieldName } = field;
          const key = fieldName?.toLowerCase();
          if (key in dogData.basicInformation) {
            return {
              ...field,
              data: dogData.basicInformation[key],
            };
          }
          return field;
        });
        setBasicInformation(updatedBasicInformation);
        setBasicInformationUpdated(true);
      }
      if (!aboutMeUpdated && dogData.aboutMe) {
        const updatedAboutMe = aboutMe.map((field) => {
          const { fieldName } = field;
          const key = fieldName.toLowerCase();
          if (key in dogData.aboutMe) {
            return {
              ...field,
              data: dogData.aboutMe[key],
            };
          }
          return field;
        });
        setAboutMe(updatedAboutMe);
        setAboutMeUpdated(true);
      }
      if (!sectionUpdated) {
        const updatedSections = JSON.parse(JSON.stringify(sections));
        Object.keys(updatedSections).forEach((sectionKey) => {
          if (sectionKey in dogData.section && Array.isArray(dogData.section[sectionKey].section_details)) {
            updatedSections[sectionKey].section_details = dogData.section[sectionKey].section_details.map((detail) => {
              return updatedSections[sectionKey].section_details[0].map((field) => {
                const { fieldName } = field;
                const key = fieldName.toLowerCase();
                if (key in detail) {
                  return {
                    ...field,
                    data: detail[key],
                  };
                }
                return field;
              });
            });
          }
        });
        setSections(updatedSections);
        setSectionUpdated(true);
      }
    }
  }, [dogData, basicInformation, aboutMe, sections, basicInformationUpdated]);

  const generatePresignedUrls = async (files, sectionKey, fieldIndex, datatype, sectionDetailIndex) => {
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
          updatedSections[sectionKey].section_details[sectionDetailIndex][fieldIndex].data = imageurl;
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
          updatedSections[sectionKey].section_details[sectionDetailIndex][fieldIndex].data = cleanedUrls;
          setSections(updatedSections);
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleChange = async (e, sectionKey, fieldIndex, dataType, sectionDetailIndex, data?) => {
    const files = e.target.files;
    const updatedSections = { ...sections };
    const value = e.target.value;
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
        generatePresignedUrls([files[0]], sectionKey, fieldIndex, dataType, sectionDetailIndex);
      } else if (dataType === 8) {
        const newFiles = Array.from(files);
        generatePresignedUrls(newFiles, sectionKey, fieldIndex, dataType, sectionDetailIndex);
      }
    } else {
      if (sectionKey === "basicInformation") {
        const updatedBasicInformation = [...basicInformation];
        if (dataType === 9) {
          const newData = { ...updatedBasicInformation[fieldIndex].data };
          if (data === "value") {
            newData.value = Number(e.target.value);
          } else if (data === "unit") {
            newData.unit = e.target.value;
          }
          updatedBasicInformation[fieldIndex].data = { ...newData };
        } else {
          updatedBasicInformation[fieldIndex].data = value;
        }
        setBasicInformation(updatedBasicInformation);
      } else if (sectionKey === "aboutMe") {
        const updatedAboutMe = [...aboutMe];
        if (dataType === 9) {
          const newData = { ...updatedAboutMe[fieldIndex].data };
          if (data === "value") {
            newData.value = e.target.value;
          } else if (data === "unit") {
            newData.unit = e.target.value;
          }
          updatedAboutMe[fieldIndex].data = { ...newData };
        } else {
          updatedAboutMe[fieldIndex].data = value;
        }
        setAboutMe(updatedAboutMe);
      } else {
        if (dataType === 9) {
          const newData = { ...updatedSections[sectionKey].section_details[sectionDetailIndex][fieldIndex].data };
          if (data === "value") {
            newData.value = e.target.value;
          } else if (data === "unit") {
            newData.unit = e.target.value;
          }
          updatedSections[sectionKey].section_details[sectionDetailIndex][fieldIndex].data = { ...newData };
        } else {
          updatedSections[sectionKey].section_details[sectionDetailIndex][fieldIndex].data = value;
        }
        setSections(updatedSections);
      }
    }
  };

  const onSubmit = () => {
    let hasErrors = false;

    Object.values(fieldErrors).forEach((error) => {
      if (error && error !== "") {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      const formData = {
        basicInformation: basicInformation,
        aboutMe: aboutMe,
        section: sections,
      };
      onNext(formData);
    } else {
      return;
    }
  };

  const handleFileDeselect = (fileIndex, sectionKey, fieldIndex, sectionDetailIndex) => {
    const updatedFiles = [...fieldFiles[sectionKey][fieldIndex]];
    updatedFiles.splice(fileIndex, 1);
    setFieldFiles((prevFieldFiles) => ({
      ...prevFieldFiles,
      [sectionKey]: {
        ...prevFieldFiles[sectionKey],
        [fieldIndex]: updatedFiles.length > 0 ? updatedFiles : undefined,
      },
    }));
    generatePresignedUrls(updatedFiles, sectionKey, fieldIndex, 8, sectionDetailIndex);
  };

  const renderField = (field, fieldIndex, sectionKey, sectionDetailIndex?) => {
    const { fieldName, dataType, data, options } = field;
    let fieldComponent = null;

    const errorKey = `${sectionKey}-${fieldIndex}`;
    const errorMessage = fieldErrors[errorKey];
    const showError = errorMessage && errorMessage !== "";

    const errorColor = "#FF5E68";
    switch (dataType) {
      case 1:
        fieldComponent = (
          <TextField
            label={fieldName}
            margin="normal"
            fullWidth
            value={data}
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)}
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
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)}
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
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)}
            InputLabelProps={{ shrink: true }}
            helperText={showError ? <span style={{ color: errorColor }}>{errorMessage}</span> : ""}
          />
        );
        break;
      case 4:
        fieldComponent = (
          <div>
            <label>
              <input type="checkbox" checked={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)} />
              {fieldName}
            </label>
          </div>
        );
        break;
      case 5:
        fieldComponent = (
          <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
            <InputLabel>{fieldName}</InputLabel>
            <Select label={fieldName} value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)} fullWidth>
              {options.map((option, optionIndex) => (
                <MenuItem key={optionIndex} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
        break;
      case 6:
        fieldComponent = (
          <TextField
            aria-label={fieldName}
            minRows={3}
            placeholder={fieldName}
            multiline
            margin="normal"
            fullWidth
            value={data}
            onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)}
          />
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
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)} />
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
              height: 200,
              width: "100%",
              p: 2,
            }}
          >
            <IconButton component="label">
              <CloudUploadIcon fontSize="large" />
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex)} multiple />
            </IconButton>
            {fieldFiles[fieldName]?.length > 0 ? (
              fieldFiles[sectionKey]?.[fieldIndex]?.map((file, fileIndex) => (
                <div key={fileIndex} style={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="subtitle2" mt={1} style={{ marginRight: "8px" }}>
                    {file.name}
                  </Typography>
                  <IconButton size="small" onClick={() => handleFileDeselect(fileIndex, sectionKey, fieldIndex, sectionDetailIndex)} style={{ padding: "4px" }}>
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
      case 9:
        fieldComponent = (
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <TextField
                label={fieldName}
                placeholder={fieldName}
                value={data.value}
                margin="normal"
                type="number"
                variant="outlined"
                onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex, "value")}
                fullWidth
              />
            </Grid>

            <Grid item xs={4}>
              <Box sx={{ pt: 2 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="unit-label">Unit</InputLabel>
                  <Select labelId="unit-label" label="Unit" value={data.unit || ""} onChange={(e) => handleChange(e, sectionKey, fieldIndex, dataType, sectionDetailIndex, "unit")}>
                    <MenuItem value="cm">cm</MenuItem>
                    <MenuItem value="m">m</MenuItem>
                    <MenuItem value="feet">feet</MenuItem>
                    <MenuItem value="inch">inch</MenuItem>
                    <MenuItem value="lbs">lbs</MenuItem>
                    <MenuItem value="kg">kg</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        );
        break;
      default:
        break;
    }

    return <div key={fieldIndex}>{fieldComponent}</div>;
  };

  const handleAddSectionDetail = (sectionKey) => {
    setSections((prevSections) => {
      const section = prevSections[sectionKey];
      const newSectionDetails = [...section.section_details];
      const newSectionDetail = section.section_details[0].map((field) => ({
        ...field,
        data: "", // Reset the data when adding a new section detail
      }));
      newSectionDetails.push(newSectionDetail);
      return {
        ...prevSections,
        [sectionKey]: {
          ...section,
          section_details: newSectionDetails,
        },
      };
    });
  };

  const handleRemoveSectionDetail = (sectionKey, sectionDetailIndex) => {
    setSections((prevSections) => {
      const section = prevSections[sectionKey];
      const newSectionDetails = [...section.section_details];
      newSectionDetails.splice(sectionDetailIndex, 1);
      return {
        ...prevSections,
        [sectionKey]: {
          ...section,
          section_details: newSectionDetails,
        },
      };
    });
  };

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <h3>Basic Information</h3>
          {basicInformation.map((field, fieldIndex) => renderField(field, fieldIndex, "basicInformation"))}

          <h3>About Me</h3>
          {aboutMe.map((field, fieldIndex) => renderField(field, fieldIndex, "aboutMe"))}

          {Object.keys(sections).map((sectionKey) => (
            <div key={sectionKey}>
              <Grid container alignItems="center" spacing={1} justifyContent="space-between">
                <Grid item>
                  <Typography variant="h3">{sections[sectionKey].section_name}</Typography>
                </Grid>
                <Grid item>
                  {/* <IconButton onClick={() => handleAddSectionDetail(sectionKey)}>
                    <AddTwoToneIcon />
                  </IconButton> */}
                  <Button sx={{ mt: 2.5 }} onClick={() => handleAddSectionDetail(sectionKey)} startIcon={<AddTwoToneIcon fontSize="small" />}>
                    Add
                  </Button>
                </Grid>
              </Grid>
              {sections[sectionKey].section_details.map((sectionDetail, sectionDetailIndex) => (
                <div key={sectionDetailIndex}>
                  <Grid container justifyContent="flex-end">
                    {sectionDetailIndex > 0 && (
                      // <IconButton onClick={() => handleRemoveSectionDetail(sectionKey, sectionDetailIndex)}>
                      //   <DeleteTwoToneIcon />
                      // </IconButton>
                      <IconButton
                        sx={{
                          "&:hover": { background: theme.colors.error.lighter },
                          color: theme.palette.error.main,
                        }}
                        color="inherit"
                        size="small"
                        onClick={() => handleRemoveSectionDetail(sectionKey, sectionDetailIndex)}
                      >
                        <DeleteTwoToneIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Grid>
                  {sectionDetail.map((field, fieldIndex) => (
                    <div key={fieldIndex}>{renderField(field, fieldIndex, sectionKey, sectionDetailIndex)}</div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          {/* <Button type="submit" disabled={Object.keys(errors).length > 0}>
            Next
          </Button> */}
          <Grid container justifyContent="flex-end" sx={{ mt: 2 }}>
            <Grid item>
              <Button variant="outlined" onClick={onBack} sx={{ mr: 2 }}>
                Back
              </Button>
              <Button type="submit" variant="contained" disabled={Object.keys(errors).length > 0}>
                Next
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Step2;
