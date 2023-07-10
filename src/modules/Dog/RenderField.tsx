import { TextField, FormControlLabel, Checkbox, Card, IconButton, CardMedia, useTheme, DialogContentText, Select, MenuItem, InputLabel, FormControl, Box, Typography } from "@mui/material";
import CropModal from "../../shared/components/CropModal";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { makeStyles } from "@mui/styles";
import { useCallback, useEffect, useState } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DialogComponent from "../../shared/components/Dialog";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
  container: {
    maxHeight: 440,
  },
  image: {
    maxWidth: 50,
    maxHeight: 50,
  },
  card: {
    width: 450,
    height: 130,
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
});

const RenderField = ({ field, register, errors, setValue }) => {
  console.log(field);
  const classes = useStyles();
  const { fieldName, dataType, data, option } = field;
  const theme = useTheme();
  const [fieldFiles, setFieldFiles] = useState({});
  const [presignedUrls, setPresignedUrls] = useState({ image: "" });
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  useEffect(() => {
    if (presignedUrls) {
    }
  }, [presignedUrls]);

  const handleFileChange = (event, fieldName) => {
    const files = event.target.files;
    console.log(fieldName);
    if (dataType === 7) {
      // Single File
      setFieldFiles({ ...fieldFiles, [fieldName]: [files[0]] });
      generatePresignedUrls([files[0]], fieldName);
    } else if (dataType === 8) {
      console.log("files");
      // Multiple Files
      const newFiles = Array.from(files);
      setFieldFiles({ ...fieldFiles, [fieldName]: [...(fieldFiles[fieldName] || []), ...newFiles] });
      generatePresignedUrls(newFiles, fieldName);
    }
  };

  const generatePresignedUrls = async (files, fieldName) => {
    console.log(fieldName);
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
      console.log(uploadedUrls);
      if (dataType === 7) {
        // Single File
        setValue(fieldName, uploadedUrls[0].split("?")[0]);
      } else if (dataType === 8) {
        // Multiple Files
        const cleanedUrls = uploadedUrls.map((url) => url.split("?")[0]);
        console.log(cleanedUrls);
        setValue(fieldName, cleanedUrls);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  switch (dataType) {
    case 1:
      return (
        <TextField
          {...register(fieldName, {
            ...(fieldName === "name" && { required: `Please enter a ${fieldName}` }), // Add required validation conditionally
            pattern: {
              value: /^(?! )[A-Za-z ]*$/,
              message: `Please enter a valid ${fieldName}`,
            },
            validate: (value) => value.length <= 20 || `Max length exceeded for ${fieldName}`,
          })}
          label={fieldName}
          type="text"
          margin="normal"
          defaultValue={data || ""}
          fullWidth
          error={!!errors[fieldName]}
          helperText={errors?.[fieldName]?.message}
        />
      );
    case 2:
      return (
        <TextField
          {...register(fieldName, {
            validate: (value) => value.length <= 10 || `Max length exceeded for ${fieldName}`,
          })}
          label={fieldName}
          type="number"
          margin="normal"
          fullWidth
          defaultValue={data || ""}
          error={!!errors[fieldName]}
          helperText={errors?.[fieldName]?.message}
        />
      );
    case 3:
      return (
        <TextField {...register(fieldName)} label={fieldName} type="date" margin="normal" defaultValue={data || ""} fullWidth error={!!errors[fieldName]} helperText={errors?.[fieldName]?.message} />
      );
    case 4: // boolean
      return <FormControlLabel control={<Checkbox {...register(fieldName)} />} label={fieldName} />;

    // ...

    case 5: // enum
      return (
        <FormControl fullWidth variant="outlined" sx={{ mt: 1 }}>
          <InputLabel>{fieldName}</InputLabel>
          <Select {...register(fieldName)} displayEmpty defaultValue={option || ""} label={fieldName} fullWidth>
            {Array.isArray(data) &&
              data.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      );

    case 6: // textarea
      return <TextField {...register(fieldName)} defaultValue={data || ""} label={fieldName} multiline margin="normal" fullWidth />;
    case 7: // file
      return (
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
            <input type="file" name={fieldName} style={{ display: "none" }} onChange={(e) => handleFileChange(e, fieldName)} />
          </IconButton>
          {fieldFiles[fieldName]?.[0]?.name ? (
            <Typography variant="subtitle2" mt={1}>
              {fieldFiles[fieldName][0].name}
            </Typography>
          ) : (
            <Typography variant="subtitle2" mt={1}>
              {data ? data.split("/").pop() : "Upload a file"}
            </Typography>
          )}
        </Box>
      );
    case 8: // files
      return (
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
            <input type="file" name={fieldName} style={{ display: "none" }} onChange={(e) => handleFileChange(e, fieldName)} multiple />
          </IconButton>
          {fieldFiles[fieldName]?.length > 0 ? (
            <Typography variant="subtitle2" mt={1}>
              {fieldFiles[fieldName].map((file) => file.name).join(", ")}
            </Typography>
          ) : (
            <Typography variant="subtitle2" mt={1}>
              {data && data.length > 0 ? data.map((url) => url.split("/").pop()).join(", ") : "Upload a file"}
            </Typography>
          )}
        </Box>
      );
    default:
      return null;
  }
};

export default RenderField;
