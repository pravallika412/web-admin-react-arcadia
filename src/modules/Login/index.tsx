import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ErrorMessage } from "@hookform/error-message";
import { LOGIN_ADMIN } from "../../shared/graphQL/queries";
import { useMutation } from "@apollo/client";
import { useEffect } from "react";
import SuspenseLoader from "../../shared/components/SuspenseLoader";

interface IFormInput {
  email: string;
  password: string;
}

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [loginUser, { loading, error, data }] = useMutation(LOGIN_ADMIN);

  // if (loading) return <SuspenseLoader />;

  // if (error) {
  //   return <h1>{error.message}</h1>;
  // }

  useEffect(() => {
    if (data) {
      window.localStorage.setItem("token", data.signIn.jwtToken);
      navigate("/dashboards/overview");
    }
  }, [navigate, data]);

  const onSubmitData: SubmitHandler<IFormInput> = (formResponse) => {
    loginUser({ variables: { input: formResponse } });
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1 }}>
          <TextField
            {...register("email", {
              required: {
                value: true,
                message: "Email is required",
              },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Please enter valid email",
              },
            })}
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
          />
          <ErrorMessage errors={errors} name="email" render={({ message }) => <span>{message}</span>} />
          <TextField
            {...register("password", {
              required: {
                value: true,
                message: "Password is required",
              },
              pattern: {
                value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[.@_])[A-Za-z0-9.@_]{8,}$/,
                message: "Password requires atleast one uppercase, one lowercase, one digit and one special character",
              },
              minLength: {
                value: 8,
                message: "Password must be 8 characters long",
              },
            })}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <ErrorMessage errors={errors} name="password" render={({ message }) => <span>{message}</span>} />
          <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
