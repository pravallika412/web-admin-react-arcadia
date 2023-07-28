import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useEffect, useState } from "react";
import { LOGIN_ADMIN } from "../../shared/graphQL/common/queries";
import { Grid, IconButton, InputAdornment, Paper, useTheme } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useStyles from "../../styles/theme/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CircularProgress from "@mui/material/CircularProgress";
import crypto from "crypto";

interface IFormInput {
  email: string;
  password: string;
}

export default function SignIn() {
  const classes = useStyles();
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<IFormInput>();
  const secretKey = process.env.TOKEN_SECURITY_KEY;
  const iv = process.env.INIT_VECTOR;
  const navigate = useNavigate();
  const [loginUser, { data, loading: loginLoader }] = useMutation(LOGIN_ADMIN);
  const [showPassword, setShowPassword] = useState(false);
  const email = watch("email");

  useEffect(() => {
    async function fetchData() {
      if (data) {
        const signInData = data.signIn;
        if (signInData) {
          const expiresIn = signInData.expiresIn;
          window.localStorage.setItem("expiresIn", expiresIn);
          const encryptedToken = signInData.jwtToken;
          const encryptedRefreshToken = signInData.refreshToken;

          if (expiresIn && encryptedToken) {
            const decryptedToken = await decryptMessage(encryptedToken);
            window.localStorage.setItem("token", decryptedToken);
            navigate("/overview");
          }

          if (encryptedRefreshToken) {
            const decryptedRefreshToken = await decryptMessage(encryptedRefreshToken);
            window.localStorage.setItem("refreshtoken", decryptedRefreshToken);
          }
        }
      }
    }

    fetchData();
  }, [navigate, data]);

  async function decryptMessage(encryptedData) {
    const algorithm = "aes-256-cbc";
    const keyBuffer = Buffer.from(secretKey, "hex");
    const initVector = Buffer.from(iv, "hex");
    const decipher = crypto.createDecipheriv(algorithm, keyBuffer, initVector);
    decipher.setEncoding("utf8");

    // Decrypt the data
    let decryptedData = decipher.update(encryptedData, "hex", "utf8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
  }

  // Rest of your component code

  const onSubmitData: SubmitHandler<IFormInput> = (formResponse) => {
    loginUser({ variables: { input: formResponse } });
  };
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleForgetPasswordClick = () => {
    navigate("/forget-password"); // Change the path to the route of your "Forget Password" component
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
      <Grid
        item
        xs={12}
        sm={8}
        md={6}
        component={Paper}
        elevation={6}
        square
        sx={{
          display: "flex",
          justifyContent: "center",
          minHeight: "100vh", // Optional, it will fill the screen vertically
          bgcolor: "primary.main",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            mx: "100px",
            mt: 20,
          }}
        >
          <Typography component="h1" className={classes.font48} sx={{ color: "white" }}>
            Welcome Back!
          </Typography>
          <Typography className={`${classes.font18} ${classes.tertiary200}`}>Login here to manage your content, view your supporters and analytics.</Typography>
          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 3, width: 468 }}>
            <TextField
              margin="normal"
              focused
              fullWidth
              className={errors.email ? classes.textFieldError : classes.textFieldWhite}
              id="email"
              label="Email"
              placeholder="Enter email"
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon className={classes.primary200} />
                  </InputAdornment>
                ),
              }}
              error={!!errors.email}
              helperText={errors?.email?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              focused
              name="password"
              placeholder="Enter password"
              className={errors.password ? classes.textFieldError : classes.textFieldWhite}
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
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon className={classes.primary200} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                      {showPassword ? <Visibility className={classes.primary200} /> : <VisibilityOff className={classes.primary200} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              error={!!errors.password}
              helperText={errors?.password?.message}
            />
            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Typography className={`${classes.font12} ${classes.pointer}`} color="white" onClick={handleForgetPasswordClick}>
                Forgot password?
              </Typography>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                fontWeight: 700,
                height: 64,
                mt: 4,
                mb: 2,
                color: theme.colors.primary.main,
                background: "#FFFFFF",
                "&:hover": {
                  color: theme.colors.primary.main,
                  background: "#FFFFFF",
                },
              }}
              disabled={loginLoader}
              classes={{ disabled: classes.loginDisabledButton }}
            >
              {loginLoader ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                  }}
                />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
