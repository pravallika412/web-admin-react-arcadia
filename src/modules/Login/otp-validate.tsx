import { Box, Button, CircularProgress, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import DialogComponent from "../../shared/components/Dialog";
import OtpInput from "react-otp-input";
import { useMutation } from "@apollo/client";
import { RESEND_OTP, VERIFY_OTP } from "../../shared/graphQL/common/queries";
import { useNavigate } from "react-router";
import useStyles from "../../styles/theme/styles";

const OTPValidation = () => {
  const theme = useTheme();
  const classes = useStyles();
  const [input, setInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [verifyOtp, { data: verifyOtpData, error: verifyOtpError, loading: verifyOtpLoader }] = useMutation(VERIFY_OTP);
  const [resendOtp, { data: resendOtpData, loading: resendOtpLoader }] = useMutation(RESEND_OTP);
  const navigate = useNavigate();
  const loading = verifyOtpLoader || resendOtpLoader;

  const handleChange = (otp) => {
    setOtp(otp);
    setInput(true);
  };

  useEffect(() => {
    if (verifyOtpData) {
      navigate("/reset-password");
    } else if (verifyOtpError) {
      setOtp("");
    }
  }, [verifyOtpData, verifyOtpError]);

  useEffect(() => {
    if (resendOtpData) {
      localStorage.setItem("token_password", resendOtpData.resendOtp.token);
    }
  }, [resendOtpData]);

  useEffect(() => {
    // Start the timer
    const interval = setInterval(() => {
      setTimer((prevTimer) => prevTimer - 1);
    }, 1000);

    // Clear the interval when the timer reaches 0
    if (timer === 0) {
      clearInterval(interval);
    }

    // Clean up the interval when the component unmounts
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleResendOTP = () => {
    // Logic to resend OTP
    const token = localStorage.getItem("token_password");
    resendOtp({ variables: { input: { token: token } } });
    setTimer(60); // Reset the timer to the initial value
  };

  const handleConfirm = () => {
    const token = localStorage.getItem("token_password");
    const payload = { token, otp };
    verifyOtp({ variables: { input: payload } });
  };

  const renderInput = ({ ...inputProps }) => {
    return (
      <input
        {...inputProps}
        onKeyPress={(event) => {
          if (!/[0-9]/.test(event.key)) {
            event.preventDefault();
          }
        }}
        style={{
          width: "48px",
          height: "58px",
          margin: "30px 10px",
          fontSize: "2em",
          borderRadius: 6,
          boxShadow: "0px 0px 4px #9CB5F2",
          border: verifyOtpError ? "1px solid #FF5E68" : "1px solid #35BFFF",
          background: verifyOtpError ? "#FFF5F5" : "#FFFFFF",
          textAlign: "center",
        }}
        placeholder="-"
      />
    );
  };

  return (
    <Box sx={{ background: theme.colors.primary.main, height: "100vh" }}>
      <DialogComponent
        open={true}
        width={500}
        height={449}
        handleClose={undefined}
        content={
          <Box sx={{ m: 2 }}>
            <Typography variant="h2">Enter OTP</Typography>
            <Typography variant="body2" sx={{ mt: 2 }}>
              An OTP has been sent to your registered email address:{" "}
              <Box component="span" sx={{ color: "#036AC9" }}>
                {localStorage.getItem("email")}
              </Box>
            </Typography>
            <OtpInput onChange={handleChange} numInputs={6} value={otp} renderInput={renderInput} shouldAutoFocus />
            {timer > 0 ? (
              <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                Didn't receive it? Resend OTP in{" "}
                <Box component="span" sx={{ color: "#036AC9" }}>
                  {Math.floor(timer / 60)}:{timer % 60 < 10 ? "0" + (timer % 60) : timer % 60}
                </Box>
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ mt: 1, textAlign: "center" }}>
                Didn't receive it?
                <button onClick={handleResendOTP} style={{ textDecoration: "underline", border: "none", background: "none", cursor: "pointer", color: "#036AC9" }}>
                  Resend OTP
                </button>
              </Typography>
            )}
          </Box>
        }
        actions={
          <Box sx={{ display: "flex", width: "100%", m: 4 }}>
            <Button
              color="primary"
              variant="contained"
              sx={{ width: "100%", height: 63, borderRadius: "6px" }}
              onClick={handleConfirm}
              disabled={loading || otp.length !== 6}
              classes={{ disabled: classes.disabledButton }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: "#FFFFFF" }} /> : "Confirm"}
            </Button>
          </Box>
        }
      />
    </Box>
  );
};

export default OTPValidation;
