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
import { LOGIN_ADMIN, RESET_PASSWORD } from "../../shared/graphQL/common/queries";
import { Grid, IconButton, InputAdornment, Paper } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

interface IFormInput {
  email: string;
  password: string;
}

export default function ResetPassword() {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [resetPassword, { data: resetPasswordData }] = useMutation(RESET_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resetPasswordData) {
      navigate("/");
    }
  }, [navigate, resetPasswordData]);

  const onSubmitData = (data) => {
    console.log(data);
    const payload = {
      token: localStorage.getItem("token_password"),
      newPassword: data.newPassword,
      confirmPassword: data.newPassword,
    };
    resetPassword({ variables: { input: payload } });
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
            Sign in
          </Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1, width: 500 }}>
            <TextField
              label="New Password"
              {...register("newPassword", {
                required: {
                  value: true,
                  message: "New Password is required",
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[.@_])[A-Za-z0-9.@_]{8,}$/,
                  message: "Password requires atleast one uppercase, one lowercase, one digit and one special character",
                },
                maxLength: {
                  value: 15,
                  message: "Max length exceeded",
                },
              })}
              margin="normal"
              fullWidth
              type={showNewPassword ? "text" : "password"}
              error={!!errors.newPassword}
              helperText={errors?.newPassword?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} onMouseDown={(event) => event.preventDefault()}>
                      {showNewPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              {...register("confirmPassword", {
                required: {
                  value: true,
                  message: "Confirm Password is required",
                },
                validate: (value) => value === watch("newPassword") || "The passwords do not match",
              })}
              margin="normal"
              fullWidth
              type={showConfirmPassword ? "text" : "password"}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword && errors.confirmPassword.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseDown={(event) => event.preventDefault()}>
                      {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Login
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
