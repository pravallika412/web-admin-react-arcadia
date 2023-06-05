import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { FORGET_PASSWORD, LOGIN_ADMIN } from "../../shared/graphQL/common/queries";
import { Grid, IconButton, InputAdornment, Paper } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface IFormInput {
  email: string;
  password: string;
}

export default function ForgetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [forgetPassword, { data: forgetPasswordData }] = useMutation(FORGET_PASSWORD);

  useEffect(() => {
    if (forgetPasswordData) {
      console.log(forgetPasswordData);
      localStorage.setItem("token_password", forgetPasswordData?.ForgotPassword?.token);
      navigate("/otp-validate");
    }
  }, [forgetPasswordData]);

  const onSubmitData: SubmitHandler<IFormInput> = (formResponse) => {
    console.log(formResponse);
    let payload = {
      email: formResponse.email,
      role: "ADMIN",
    };
    forgetPassword({ variables: { input: payload } });
  };

  return (
    <Grid container component="main" maxWidth="xs" sx={{ height: "100vh" }}>
      <CssBaseline />
      <Grid
        item
        xs={false}
        sm={4}
        md={6}
        sx={{
          backgroundImage: `url(${LoginDog})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          height: "1071px",
        }}
      />
      <Grid item xs={12} sm={8} md={6} component={Paper} elevation={6} square>
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Fprget Password
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1, width: 500 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              {...register("email", {
                required: {
                  value: true,
                  message: "Email is required",
                },
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter valid Email",
                },
              })}
              error={!!errors.email}
              helperText={errors?.email?.message}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Send
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
