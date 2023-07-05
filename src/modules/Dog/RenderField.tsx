import { TextField, FormControlLabel, Checkbox, Card, IconButton, CardMedia, useTheme, DialogContentText } from "@mui/material";
import CropModal from "../../shared/components/CropModal";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { makeStyles } from "@mui/styles";
import { useCallback, useEffect, useState } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DialogComponent from "../../shared/components/Dialog";
import { Box } from "@mui/system";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { GENERATE_PRESIGNED_URL } from "../../shared/graphQL/common/queries";
import { useMutation } from "@apollo/client";

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
  const classes = useStyles();
  const { fieldName, dataType, data } = field;
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
      // setFieldFiles({ ...fieldFiles, [fieldName]: [files[0]] });
      generatePresignedUrls([files[0]], fieldName);
    } else if (dataType === 8) {
      // Multiple Files
      const newFiles = Array.from(files);
      // setFieldFiles({ ...fieldFiles, [fieldName]: [...(fieldFiles[fieldName] || []), ...newFiles] });
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
      setValue(fieldName, uploadedUrls[0].split("?")[0]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  switch (dataType) {
    case 1:
      return (
        <TextField
          {...register(fieldName, {
            pattern: {
              value: /^[a-zA-Z]+$/,
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
          error={!!errors[fieldName]}
          helperText={errors?.[fieldName]?.message}
        />
      );
    case 3:
      return <TextField {...register(fieldName)} label={fieldName} type="date" margin="normal" fullWidth error={!!errors[fieldName]} helperText={errors?.[fieldName]?.message} />;
    case 4: // boolean
      return <FormControlLabel control={<Checkbox {...register(fieldName)} />} label={fieldName} />;
    case 5: // enum
      return (
        <TextField
          {...register(fieldName)}
          select
          label={fieldName}
          SelectProps={{
            native: true,
          }}
          margin="normal"
          fullWidth
        >
          {Array.isArray(data) &&
            data.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </TextField>
      );
    case 6: // textarea
      return <TextField {...register(fieldName)} label={fieldName} multiline margin="normal" fullWidth />;
    case 7: // file
      return (
        <TextField
          label={fieldName}
          name={fieldName}
          margin="normal"
          fullWidth
          onChange={(e) => handleFileChange(e, fieldName)}
          type="file"
          InputLabelProps={{ shrink: true }}
          error={!!errors[fieldName]}
          helperText={errors?.[fieldName]?.message}
        />
      );
    case 8: // files
      return (
        <TextField
          label={fieldName}
          name={fieldName}
          margin="normal"
          fullWidth
          onChange={(e) => handleFileChange(e, fieldName)}
          type="files"
          InputLabelProps={{ shrink: true }}
          error={!!errors[fieldName]}
          helperText={errors?.[fieldName]?.message}
        />
      );
    default:
      return null;
  }
};

export default RenderField;
