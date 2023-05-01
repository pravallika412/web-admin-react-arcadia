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
import { LOGIN_ADMIN } from "../../shared/graphQL/common/queries";
import { Grid, IconButton, InputAdornment, Paper } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

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
  const [loginUser, { data }] = useMutation(LOGIN_ADMIN);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (data) {
      window.localStorage.setItem("token", data.signIn.jwtToken);
      navigate("/overview");
    }
  }, [navigate, data]);

  const onSubmitData: SubmitHandler<IFormInput> = (formResponse) => {
    loginUser({ variables: { input: formResponse } });
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1 }}>
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
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password", {
                required: {
                  value: true,
                  message: "Password is required",
                },
                pattern: {
                  value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[.@_])[A-Za-z0-9.@_]{8,}$/,
                  message: "Password requires atleast one uppercase, one lowercase, one digit and one special character",
                },
                minLength: {
                  value: 8,
                  message: "Password must be 8 characters long",
                },
              })}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!errors.password}
              helperText={errors?.password?.message}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Sign In
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
