import { useEffect, useState } from "react";
import { TextField, Select, MenuItem, FormControl, InputLabel, TextareaAutosize, Button, Typography, Container, Box, Paper, IconButton } from "@mui/material";
import { useForm, useFormContext } from "react-hook-form";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";

const DogBasicDetails = ({ fields }) => {
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fieldFiles, setFieldFiles] = useState({});
  const [presignedUrls, setPresignedUrls] = useState({
    image: [
      // Your image presignedUrls here...
    ],
    gallery: [
      // Your gallery presignedUrls here...
    ],
  });
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  // const { handleSubmit, control, register, reset } = useForm();
  const { register, setValue } = useFormContext();

  useEffect(() => {
    if (presignedUrls) {
      console.log(presignedUrls);
      setValue("image", presignedUrls.image);
      setValue("gallery", presignedUrls.gallery);
    }
  }, [presignedUrls]);

  const handleInputChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleFileSelect = (event, fieldName, dataType) => {
    const files = event.target.files;

    if (dataType === 7) {
      // Single File
      setFieldFiles({ ...fieldFiles, [fieldName]: [files[0]] });
      generatePresignedUrls([files[0]], fieldName);
    } else if (dataType === 8) {
      // Multiple Files
      const newFiles = Array.from(files);
      setFieldFiles({ ...fieldFiles, [fieldName]: [...(fieldFiles[fieldName] || []), ...newFiles] });
      generatePresignedUrls(newFiles, fieldName);
    }
  };

  const generatePresignedUrls = async (files, fieldName) => {
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
      setPresignedUrls((prevUrls) => ({ ...prevUrls, [fieldName]: uploadedUrls }));
      console.log(presignedUrls);
      console.log("All files uploaded successfully");
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const renderField = (field) => {
    const { fieldName, dataType, data } = field;
    const fieldValue = formData[fieldName] || "";

    switch (dataType) {
      case 1:
        return (
          <TextField
            key={fieldName}
            placeholder={fieldName}
            {...register(fieldName)}
            style={{ width: "100%", resize: "none" }}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
          />
        );
      case 2: // Number
        return (
          <TextField
            key={fieldName}
            label={fieldName}
            variant="outlined"
            {...register(fieldName)}
            margin="normal"
            fullWidth
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
          />
        );

      case 3: // Date
        return <TextField key={fieldName} label={fieldName} type="date" variant="outlined" InputLabelProps={{ shrink: true }} margin="normal" fullWidth {...register(fieldName)} />;

      case 4: // Boolean
        return (
          <FormControl key={fieldName} fullWidth margin="normal" variant="outlined">
            <InputLabel>{fieldName}</InputLabel>
            <Select {...register(fieldName)} label={fieldName}>
              {data.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 5: // Enum
        return (
          <FormControl variant="outlined" margin="normal" fullWidth>
            <InputLabel id={fieldName + "-label"}>{fieldName}</InputLabel>
            <Select labelId={fieldName + "-label"} key={fieldName} label={fieldName} {...register(fieldName)} value={fieldValue} onChange={(e) => handleInputChange(fieldName, e.target.value)}>
              {data.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 6: // Textarea
        return (
          <TextareaAutosize
            key={fieldName}
            minRows={3}
            placeholder={fieldName}
            {...register(fieldName)}
            style={{ width: "100%", resize: "none" }}
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
          />
        );

      case 7: // File
        return (
          <TextField label={fieldName} margin="normal" fullWidth {...register(fieldName, { onChange: (e) => handleFileSelect(e, fieldName, 7) })} type="file" InputLabelProps={{ shrink: true }} />
        );

      case 8: // Files
        return (
          <>
            {/* <FormControl fullWidth margin="normal">
              <InputLabel shrink>{fieldName}</InputLabel>
              <input type="file" multiple onChange={handleFileSelect} style={{ marginTop: 16 }} />
            </FormControl> */}
            <TextField
              label={fieldName}
              margin="normal"
              fullWidth
              {...register(fieldName, { onChange: (e) => handleFileSelect(e, fieldName, 8) })}
              type="file"
              InputLabelProps={{ shrink: true }}
              inputProps={{ multiple: true }}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main">
      {/* <Box component="form" onSubmit={handleSubmit(onSubmit)}> */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <div>
          {fields.map((field) => (
            <div key={field.fieldName}>{renderField(field)}</div>
          ))}
        </div>
        {/* <Box marginTop={2}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box> */}
      </Paper>
      {/* </Box> */}
    </Container>
  );
};
export default DogBasicDetails;
