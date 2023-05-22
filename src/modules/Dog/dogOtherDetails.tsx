import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller, useFormContext } from "react-hook-form";
import { TextField, Button, Typography, IconButton, Box, Grid, Paper } from "@mui/material";
import { AddCircleOutline } from "@mui/icons-material";
import { Container } from "@mui/system";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";
import { DatePicker } from "@mui/lab";

const DogOtherDetails = () => {
  const [uploadFile, setUploadFile] = useState(null);
  const [file, setFile] = useState([]);
  const [presignedURL, setPresignedURL] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [presignedUrls, setPresignedUrls] = useState([]);
  const [awardPresignedUrls, setAwardPresignedUrls] = useState([]);
  const [medicalPresignedUrls, setMedicalPresignedUrls] = useState([]);
  const [otherPresignedUrls, setOtherPresignedUrls] = useState([]);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "history",
  });
  const { fields: awardFields, append: appendAward } = useFieldArray({
    control,
    name: "awards",
  });
  const { fields: medicalFields, append: appendMedicals } = useFieldArray({
    control,
    name: "reports",
  });
  const { fields: otherFields, append: appendOthers } = useFieldArray({
    control,
    name: "others",
  });

  const handleFileUpload = () => {
    // Open file explorer
    document.getElementById("fileInput").click();
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    setSelectedFiles(Array.from(files));
  };

  const generatePresignedUrls = async (sectionIndex: Number) => {
    const presignedUrlsStateSetter = sectionIndex === 0 ? setAwardPresignedUrls : sectionIndex === 1 ? setMedicalPresignedUrls : setOtherPresignedUrls;
    const uploadPromises = selectedFiles.map(async (file) => {
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
      presignedUrlsStateSetter((prevUrls) => [...prevUrls, ...uploadedUrls]);

      console.log(presignedUrls);
      console.log("All files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  useEffect(() => {
    if (awardPresignedUrls) {
      console.log(awardPresignedUrls);
      awardFields.forEach((field, index) => {
        setValue(`awards[${index}].awardsLinks`, [awardPresignedUrls[index]]);
      });
    }
  }, [awardPresignedUrls]);

  useEffect(() => {
    if (medicalPresignedUrls) {
      console.log(medicalPresignedUrls);
      medicalFields.forEach((field, index) => {
        setValue(`reports[${index}].reportLinks`, [medicalPresignedUrls[index]]);
      });
    }
  }, [medicalPresignedUrls]);

  useEffect(() => {
    if (otherPresignedUrls) {
      console.log(otherPresignedUrls);
      medicalFields.forEach((field, index) => {
        setValue(`others[${index}].documentLinks`, [otherPresignedUrls[index]]);
      });
    }
  }, [otherPresignedUrls]);

  return (
    <Container component="main">
      <Paper elevation={3} sx={{ p: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Dog Story
          </Typography>
          <Controller
            name="story"
            control={control}
            rules={{
              pattern: {
                value: /^[^\s][\s\S]*$/,
                message: "Please enter valid story",
              },
              maxLength: {
                value: 200,
                message: "Max length exceeded",
              },
            }}
            render={({ field }) => <TextField {...field} label="Description" variant="outlined" multiline rows={4} fullWidth error={!!errors.story} helperText={errors?.story?.message} />}
          />
        </Box>
        <Box marginTop={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" sx={{ my: 2 }}>
              Service History
            </Typography>

            <IconButton color="primary" onClick={() => append({ serviceName: "", joinedOn: "", retiredOn: "", description: "" })}>
              <AddCircleOutline />
            </IconButton>
          </Box>
          {fields.map((item, index) => (
            <Grid container key={item.id || index}>
              <Controller
                name={`history[${index}].title` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid service name",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Service Name"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.history?.[index]?.title}
                    helperText={errors?.history?.[index]?.title?.message}
                  />
                )}
              />

              <Controller
                name={`history[${index}].fromDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Joined On" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />

              <Controller
                name={`history[${index}].toDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Retired On" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />

              <Controller
                name={`history[${index}].description` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[^\s][\s\S]*$/,
                    message: "Please enter valid description",
                  },
                  maxLength: {
                    value: 200,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    margin="normal"
                    fullWidth
                    error={!!errors.history?.[index]?.description}
                    helperText={errors?.history?.[index]?.description?.message}
                  />
                )}
              />
            </Grid>
          ))}
        </Box>
        <Box marginTop={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" sx={{ my: 2 }}>
              Awards Information
            </Typography>

            <IconButton color="primary" onClick={() => appendAward({ awardName: "", awardDate: "", uploadMedia: "" })}>
              <AddCircleOutline />
            </IconButton>
          </Box>
          {awardFields.map((item, index) => (
            <Grid container key={item.id || index}>
              <Controller
                name={`awards[${index}].title` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid award name",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField {...field} label="Award Name" variant="outlined" margin="normal" fullWidth error={!!errors.awards?.[index]?.title} helperText={errors?.awards?.[index]?.title?.message} />
                )}
              />

              <Controller
                name={`awards[${index}].fromDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Award start Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />
              <Controller
                name={`awards[${index}].toDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Award end Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />

              <Box
                sx={{
                  border: "2px dashed",
                  borderRadius: "8px",
                  width: "100%",
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input id="fileInput" type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <CloudUploadIcon fontSize="large" onClick={handleFileUpload} />
                  <Button variant="outlined" onClick={() => generatePresignedUrls(0)}>
                    Upload
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Box>
        <Box marginTop={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" sx={{ my: 2 }}>
              Medical Records
            </Typography>

            <IconButton color="primary" onClick={() => appendMedicals({ title: "", shortDescription: "", uploadMedia: "" })}>
              <AddCircleOutline />
            </IconButton>
          </Box>
          {medicalFields.map((item, index) => (
            <Grid container key={item.id || index}>
              <Controller
                name={`reports[${index}].title` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid report name",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField {...field} label="Title" variant="outlined" margin="normal" fullWidth error={!!errors.reports?.[index]?.title} helperText={errors?.reports?.[index]?.title?.message} />
                )}
              />

              <Controller
                name={`reports[${index}].fromDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Award start Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />
              <Controller
                name={`reports[${index}].toDate` as any}
                control={control}
                render={({ field }) => <TextField {...field} label="Award end Date" type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth />}
              />

              <Controller
                name={`reports[${index}].description` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[^\s][\s\S]*$/,
                    message: "Please enter valid description",
                  },
                  maxLength: {
                    value: 200,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    margin="normal"
                    fullWidth
                    error={!!errors.reports?.[index]?.description}
                    helperText={errors?.reports?.[index]?.description?.message}
                  />
                )}
              />

              <Box
                sx={{
                  border: "2px dashed",
                  borderRadius: "8px",
                  width: "100%",
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input id="fileInput" type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <CloudUploadIcon fontSize="large" onClick={handleFileUpload} />
                  <Button variant="outlined" onClick={() => generatePresignedUrls(1)}>
                    Upload
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Box>
        <Box marginTop={2}>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="h5" sx={{ my: 2 }}>
              Others
            </Typography>

            <IconButton color="primary" onClick={() => appendOthers({ title: "", shortDescription: "", uploadMedia: "" })}>
              <AddCircleOutline />
            </IconButton>
          </Box>
          {otherFields.map((item, index) => (
            <Grid container key={item.id || index}>
              <Controller
                name={`others[${index}].documentType` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Za-z][A-Za-z\s]*$/,
                    message: "Please enter valid document type",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Title"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    error={!!errors.others?.[index]?.documentType}
                    helperText={errors?.others?.[index]?.documentType?.message}
                  />
                )}
              />

              <Controller
                name={`others[${index}].description` as any}
                control={control}
                rules={{
                  pattern: {
                    value: /^[^\s][\s\S]*$/,
                    message: "Please enter valid description",
                  },
                  maxLength: {
                    value: 200,
                    message: "Max length exceeded",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    variant="outlined"
                    multiline
                    rows={4}
                    margin="normal"
                    fullWidth
                    error={!!errors.others?.[index]?.description}
                    helperText={errors?.others?.[index]?.description?.message}
                  />
                )}
              />

              <Box
                sx={{
                  border: "2px dashed",
                  borderRadius: "8px",
                  width: "100%",
                  p: 2,
                  textAlign: "center",
                  cursor: "pointer",
                }}
              >
                <input id="fileInput" type="file" multiple style={{ display: "none" }} onChange={handleFileSelect} />
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <CloudUploadIcon fontSize="large" onClick={handleFileUpload} />
                  <Button variant="outlined" onClick={() => generatePresignedUrls(2)}>
                    Upload
                  </Button>
                </Box>
              </Box>
            </Grid>
          ))}
        </Box>
      </Paper>
    </Container>
  );
};

export default DogOtherDetails;
