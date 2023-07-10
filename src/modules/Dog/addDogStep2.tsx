import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Container, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, TextareaAutosize, TextField } from "@mui/material";
import RenderField from "./RenderField";
import { Box } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { isEqual } from "lodash";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";

const Step2 = ({ onBack, onNext, dogData, fields }) => {
  console.log(fields);
  console.log("dogData", dogData);
  const [basicInformation, setBasicInformation] = useState(fields.basicInformation);
  const [aboutMe, setAboutMe] = useState(fields.aboutMe);
  const [sections, setSections] = useState(fields.section);
  const [basicInformationUpdated, setBasicInformationUpdated] = useState(false);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (dogData) {
      if (dogData && !basicInformationUpdated) {
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

        console.log(updatedBasicInformation);
        setBasicInformation(updatedBasicInformation);
        setBasicInformationUpdated(true);

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

        console.log("updatedSections", updatedSections);
        setSections(updatedSections);
      }
    }
  }, [dogData, basicInformation, aboutMe, sections, basicInformationUpdated]);

  const generatePresignedUrls = async (files, sectionKey, fieldIndex) => {
    const updatedSections = { ...sections };
    console.log(files, sectionKey, fieldIndex);
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
      console.log(uploadedUrls);
      if (uploadedUrls.length === 1) {
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
      } else if (uploadedUrls.length > 1) {
        // Multiple Files
        const cleanedUrls = uploadedUrls.map((url) => url.split("?")[0]);
        console.log(cleanedUrls);
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

  const handleChange = async (e, sectionKey, fieldIndex) => {
    console.log(e.target.files, e.target.value);
    const files = e.target.files;
    const updatedSections = { ...sections };

    if (e.target.files && e.target.files.length > 0) {
      if (files.length === 1) {
        generatePresignedUrls([files[0]], sectionKey, fieldIndex);
      } else if (files.length > 1) {
        console.log("Multiple Files");
        const newFiles = Array.from(files);
        generatePresignedUrls(newFiles, sectionKey, fieldIndex);
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
    // Handle form submission with updated sections data
    console.log(fields);
    onNext(fields);
  };

  const renderField = (field, fieldIndex, sectionKey) => {
    const { fieldName, dataType, data } = field;
    let fieldComponent = null;

    switch (dataType) {
      case 1:
        fieldComponent = <TextField label={fieldName} margin="normal" fullWidth value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} />;
        break;
      case 2:
        fieldComponent = <TextField label={fieldName} margin="normal" fullWidth type="number" value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} />;
        break;
      case 3:
        fieldComponent = (
          <TextField label={fieldName} margin="normal" fullWidth type="date" value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} InputLabelProps={{ shrink: true }} />
        );
        break;
      case 4:
        fieldComponent = (
          <div>
            <label>
              <input type="checkbox" checked={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} />
              {fieldName}
            </label>
          </div>
        );
        break;
      case 5:
        fieldComponent = (
          <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
            <InputLabel>{fieldName}</InputLabel>
            <Select label={fieldName} value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} fullWidth>
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
          <TextField aria-label={fieldName} minRows={3} placeholder={fieldName} multiline margin="normal" fullWidth value={data} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} />
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
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} />
            </IconButton>
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
              <input type="file" style={{ display: "none" }} onChange={(e) => handleChange(e, sectionKey, fieldIndex)} multiple />
            </IconButton>
          </Box>
        );
        break;
      default:
        break;
    }

    return <div key={fieldIndex}>{fieldComponent}</div>;
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
