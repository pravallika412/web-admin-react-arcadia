import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { useEffect } from "react";
import { FORGET_PASSWORD } from "../../shared/graphQL/common/queries";
import { CircularProgress, Grid, InputAdornment, Paper, useTheme } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import useStyles from "../../styles/theme/styles";
import MailOutlineIcon from "@mui/icons-material/MailOutline";

interface IFormInput {
  email: string;
  password: string;
}

export default function ForgetPassword() {
  const classes = useStyles();
  const theme = useTheme();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [forgetPassword, { data: forgetPasswordData, loading: fpLoader }] = useMutation(FORGET_PASSWORD);
  const email = watch("email");

  useEffect(() => {
    if (forgetPasswordData) {
      localStorage.setItem("token_password", forgetPasswordData?.ForgotPassword?.token);
      window.localStorage.setItem("email", email);
      navigate("/otp-validate");
    }
  }, [forgetPasswordData]);

  const onSubmitData: SubmitHandler<IFormInput> = (formResponse) => {
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
            Forget Password
          </Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1, width: 468 }}>
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
              disabled={fpLoader}
              classes={{ disabled: classes.loginDisabledButton }}
            >
              {fpLoader ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                  }}
                />
              ) : (
                "Send"
              )}
            </Button>
          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}
