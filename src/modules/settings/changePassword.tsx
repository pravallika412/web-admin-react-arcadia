import { useMutation } from "@apollo/client";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, Grid, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CHANGE_PASSWORD } from "../../shared/graphQL/settings/queries";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutline";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import CancelIcon from "@mui/icons-material/Cancel";

const ChangePassword = () => {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatePassword, { data: updatePasswordData }] = useMutation(CHANGE_PASSWORD);
  const [openChangePasswordStatus, setOpenChangePasswordStatus] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (updatePasswordData) {
      setOpenChangePasswordStatus(true);
      reset();
    }
  }, [updatePasswordData]);

  const onSubmit = (data) => {
    const payload = {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    };
    updatePassword({ variables: { input: payload } });
  };

  const handleChangePasswordClose = () => {
    setOpenChangePasswordStatus(false);
    reset();
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container>
          <Typography variant="h4">Change Password</Typography>
          <TextField
            label="Current Password"
            {...register("oldPassword", {
              required: {
                value: true,
                message: "Old Password is required",
              },
            })}
            margin="normal"
            type={showOldPassword ? "text" : "password"}
            fullWidth
            error={!!errors.oldPassword}
            helperText={errors?.oldPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowOldPassword(!showOldPassword)} onMouseDown={(event) => event.preventDefault()}>
                    {showOldPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
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
        </Grid>
        <Grid sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button variant="contained" type="submit">
            Update
          </Button>
        </Grid>
      </Box>
      <Dialog open={openChangePasswordStatus} onClose={handleChangePasswordClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <Box display="flex" justifyContent="flex-end" p={1}>
          <IconButton edge="end" color="primary" onClick={handleChangePasswordClose} aria-label="close">
            <CancelIcon sx={{ fontSize: 30, color: "#0481D9" }} />
          </IconButton>
        </Box>

        <DialogContent sx={{ width: 324, height: 240 }}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <CheckCircleIcon color="success" sx={{ fontSize: 60, m: 2 }} />
            <DialogContentText id="alert-dialog-description" sx={{ color: "black" }}>
              <strong> Password Changed Successfully</strong>
            </DialogContentText>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ChangePassword;
