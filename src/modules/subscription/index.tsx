import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { FormControlLabel, MenuItem, Radio, RadioGroup, Select, TextField, Button, Box, Container, Input } from "@mui/material";
import { useMutation } from "@apollo/client";
import { CREATE_SUBSCRIPTION, GENERATE_PRESIGNED_URL } from "../../shared/graphQL/queries";
import SuspenseLoader from "../../shared/components/SuspenseLoader";
import { useEffect, useState } from "react";

const Subscription = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [file, setFile] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  const [createSubscription, { loading, error, data: createSub }] = useMutation(CREATE_SUBSCRIPTION);
  const [generatePresignedUrl, { data: createPresignedUrl }] = useMutation(GENERATE_PRESIGNED_URL);

  useEffect(() => {
    if (createPresignedUrl) {
      setUploadFile(createPresignedUrl.GeneratePresignedUrl.presignedUrl);
    }
  }, [createPresignedUrl]);

  useEffect(() => {
    if (uploadFile) {
      uploadImageFn(uploadFile, file);
    }
  }, [uploadFile]);

  const uploadImageFn = async (url, data) => {
    await fetch(url, {
      method: "PUT",
      body: data,
      headers: {
        "Content-Type": data.type,
      },
    });
  };

  const onSubmit = (data) => {
    let payload = {
      name: data.name,
      description: data.description,
      recurring: data.recurring === "yes" ? true : false,
      planImage: uploadFile.split("?")[0],
      renewalPeriod: data.renewalPeriod,
      price: Number(data.price),
      renewalNumber: Number(data.renewalNumber),
      supportableProductCount: Number(data.supportableProductCount),
    };
    createSubscription({ variables: { input: payload } });
  };

  const handleFileChange = (event: any) => {
    event.preventDefault();
    setFile(event.target.files[0]);
    let payload = {
      fileName: event.target.files[0].name,
      fileType: event.target.files[0].type,
      filePath: "sponsor",
    };
    generatePresignedUrl({ variables: { input: payload } });
  };

  if (loading) return <SuspenseLoader />;

  if (error) {
    return <h1>{error.message}</h1>;
  }

  if (createSub) {
    console.log(createSub);
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
        <div>
          <TextField
            label="Name"
            name="name"
            margin="normal"
            required
            fullWidth
            {...register("name", {
              required: {
                value: true,
                message: "Name is required",
              },
              pattern: {
                value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                message: "Please enter valid name",
              },
            })}
          />
          <ErrorMessage errors={errors} name="name" render={({ message }) => <p>{message}</p>} />
        </div>

        <div>
          <TextField
            label="Description"
            name="desciption"
            margin="normal"
            required
            fullWidth
            {...register("description", {
              required: {
                value: true,
                message: "Name is required",
              },
              pattern: {
                value: /^[a-zA-Z0-9][a-zA-Z0-9\s]*$/,
                message: "Please enter valid description",
              },
            })}
          />
          <ErrorMessage errors={errors} name="description" render={({ message }) => <p>{message}</p>} />
        </div>

        <div>
          <RadioGroup row name="recurring" {...register("recurring", { required: true })}>
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
          {errors.recurring && <span>This field is required</span>}
        </div>

        <div>
          <Button variant="contained" component="label">
            Upload
            <input hidden accept="image/*" multiple type="file" onChange={handleFileChange} />
          </Button>
          {/* <Input type="file" fullWidth name="subscriptionImage" onChange={handleFileChange} {...register("subscriptionImage", { required: true })} /> */}
          {/* {errors.subscriptionImage && <span>This field is required</span>} */}
        </div>

        <div>
          <Select label="Renewal Period" name="renewalPeriod" defaultValue="week" fullWidth {...register("renewalPeriod", { required: true })}>
            <MenuItem value="week">Week</MenuItem>
            <MenuItem value="day">Day</MenuItem>
            <MenuItem value="month">Month</MenuItem>
          </Select>
          {errors.renewalPeriod && <span>This field is required</span>}
        </div>

        <div>
          <TextField label="Price" name="price" margin="normal" required fullWidth {...register("price", { required: true })} type="number" />
          {errors.price && <span>This field is required</span>}
        </div>

        <div>
          <TextField label="Renewal Number" name="renewalNumber" margin="normal" required fullWidth {...register("renewalNumber", { required: true })} type="number" />
          {errors.renewalNumber && <span>This field is required</span>}
        </div>

        <div>
          <TextField label="Supportable Product Count" name="supportableProductCount" margin="normal" required fullWidth {...register("supportableProductCount", { required: true })} type="number" />
          {errors.supportableProductCount && <span>This field is required</span>}
        </div>

        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default Subscription;
