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
import { CircularProgress, Dialog, DialogContent, DialogContentText, Grid, IconButton, InputAdornment, Paper, useTheme } from "@mui/material";
import LoginDog from "../../assets/images/LoginDog.svg";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import useStyles from "../../styles/theme/styles";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";

interface IFormInput {
  email: string;
  password: string;
}

export default function ResetPassword() {
  const classes = useStyles();
  const theme = useTheme();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openResetPasswordStatus, setOpenResetPasswordStatus] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const navigate = useNavigate();
  const [resetPassword, { data: resetPasswordData, loading: rpLoader }] = useMutation(RESET_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resetPasswordData) {
      setOpenResetPasswordStatus(true);
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

  const handleResetPasswordClose = () => {
    setOpenResetPasswordStatus(false);
    localStorage.clear();
    reset();
    navigate("/");
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
            Update Password
          </Typography>
          <Typography className={`${classes.font18} ${classes.tertiary200}`}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore</Typography>

          <Box component="form" onSubmit={handleSubmit(onSubmitData)} noValidate sx={{ mt: 1, width: 500 }}>
            <TextField
              focused
              label="New Password"
              className={errors.newPassword ? classes.textFieldError : classes.textFieldWhite}
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
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon className={classes.primary200} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)} onMouseDown={(event) => event.preventDefault()}>
                      {showNewPassword ? <Visibility className={classes.primary200} /> : <VisibilityOff className={classes.primary200} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              focused
              label="Confirm Password"
              className={errors.confirmPassword ? classes.textFieldError : classes.textFieldWhite}
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
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon className={classes.primary200} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} onMouseDown={(event) => event.preventDefault()}>
                      {showConfirmPassword ? <Visibility className={classes.primary200} /> : <VisibilityOff className={classes.primary200} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              disabled={rpLoader}
              classes={{ disabled: classes.loginDisabledButton }}
            >
              {rpLoader ? (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                  }}
                />
              ) : (
                "Update"
              )}
            </Button>
          </Box>
        </Box>
      </Grid>
      <Dialog open={openResetPasswordStatus} onClose={handleResetPasswordClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box display="flex" justifyContent="flex-end" p={1} sx={{ overflow: "hidden" }}>
          <IconButton edge="end" color="primary" onClick={handleResetPasswordClose} aria-label="close">
            <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ width: 324, height: 240 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Password Updated Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
