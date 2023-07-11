import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Container, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextareaAutosize, TextField, Typography } from "@mui/material";
import RenderField from "./RenderField";
import { Box } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { isEqual } from "lodash";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";
import moment from "moment";

const Step2 = ({ onBack, onNext, dogData, fields }) => {
  console.log(fields);
  console.log("dogData", dogData);
  const [basicInformation, setBasicInformation] = useState(fields.basicInformation);
  const [aboutMe, setAboutMe] = useState(fields.aboutMe);
  const [sections, setSections] = useState(fields.section);
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
      if (!basicInformationUpdated) {
        const updatedBasicInformation = basicInformation.map((field) => {
          const { fieldName } = field;
          const key = fieldName.toLowerCase();

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
      if (!aboutMeUpdated) {
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
        const updatedSections = { ...sections };
        Object.keys(updatedSections).forEach((sectionKey) => {
          if (sectionKey in dogData.section && Array.isArray(dogData.section[sectionKey].section_details)) {
            updatedSections[sectionKey].section_details = updatedSections[sectionKey].section_details.map((field) => {
              const { fieldName } = field;
              const key = fieldName.toLowerCase();

              if (dogData.section[sectionKey].section_details[0] && key in dogData.section[sectionKey].section_details[0]) {
                return {
                  ...field,
                  data: dogData.section[sectionKey].section_details[0][key],
                };
              }
              return field;
            });
          }
        });

        setSections(updatedSections);
        setSectionUpdated(true);
      }
    }
  }, [dogData, basicInformation, aboutMe, sections, basicInformationUpdated]);

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

  const handleChange = async (e, sectionKey, fieldIndex, dataType) => {
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

  const onSubmit = () => {
    let hasErrors = false;

    // Check if any field has an error
    Object.values(fieldErrors).forEach((error) => {
      if (error && error !== "") {
        hasErrors = true;
      }
    });

    if (!hasErrors) {
      const formData = {
        basicInformation,
        aboutMe,
        section: sections,
      };
      console.log(formData);
      onNext(formData);
    } else {
      console.log("Form has errors. Please fix the errors before submitting.");
      return;
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
            {fieldFiles[sectionKey]?.[fieldIndex]?.length > 0 ? (
              <Typography variant="subtitle2" mt={1}>
                {fieldFiles[sectionKey][fieldIndex].map((file) => file.name).join(", ")}
              </Typography>
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
              <h3>{sections[sectionKey].section_name}</h3>
              {sections[sectionKey].section_details.map((field, fieldIndex) => renderField(field, fieldIndex, sectionKey))}
            </div>
          ))}

          <Button onClick={onBack}>Back</Button>
          <Button type="submit" disabled={Object.keys(errors).length > 0}>
            Next
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default Step2;
