import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import { createRef, useEffect, useState, useRef } from "react";
import DialogComponent from "../../shared/components/Dialog";
import { makeStyles } from "@mui/styles";
import OtpInput from "react-otp-input";
import { useMutation } from "@apollo/client";
import { RESEND_OTP, VERIFY_OTP } from "../../shared/graphQL/common/queries";
import { useNavigate } from "react-router";

const useStyles = makeStyles(() => ({
  otpInput: {
    textAlign: "center",
    width: "100%",
    fontSize: 24,
    padding: 10,
  },
}));

const OTPDialogActions = ({ handleConfirm }) => {
  return (
    <Box sx={{ display: "flex", width: "100%", m: 2 }}>
      <Button color="primary" variant="contained" sx={{ width: "100%" }} onClick={handleConfirm}>
        Confirm
      </Button>
    </Box>
  );
};

const OTPValidation = () => {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [verifyOtp, { data: verifyOtpData }] = useMutation(VERIFY_OTP);
  const [resendOtp, { data: resendOtpData }] = useMutation(RESEND_OTP);
  const navigate = useNavigate();

  const handleChange = (otp) => {
    console.log(otp);
    setOtp(otp);
  };

  useEffect(() => {
    if (verifyOtpData) {
      console.log(verifyOtpData);
      navigate("/reset-password");
    }
  }, [verifyOtpData]);

  useEffect(() => {
    if (resendOtpData) {
      console.log(resendOtpData);
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
    console.log(payload);
    verifyOtp({ variables: { input: payload } });
  };

  const renderInput = (inputProps: any, index: number) => {
    return (
      <input
        {...inputProps}
        style={{
          width: "48px",
          height: "58px",
          margin: "20px 1rem",
          fontSize: "2em",
          borderRadius: 4,
          border: "2px solid rgba(0,0,0,0.3)",
        }}
      />
    );
  };
  return (
    <DialogComponent
      open={true}
      width={500}
      height={449}
      handleClose={undefined}
      content={
        <Box>
          <Typography variant="h6">Enter OTP</Typography>
          <Typography variant="body2">An OTP is sent to your email address</Typography>
          <OtpInput onChange={handleChange} numInputs={6} value={otp} renderInput={renderInput} shouldAutoFocus />
          {timer > 0 ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Resend OTP in {Math.floor(timer / 60)}:{timer % 60 < 10 ? "0" + (timer % 60) : timer % 60}
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ mt: 1 }}>
              <button onClick={handleResendOTP} style={{ textDecoration: "underline", border: "none", background: "none", cursor: "pointer" }}>
                Resend OTP
              </button>
            </Typography>
          )}
        </Box>
      }
      actions={<OTPDialogActions handleConfirm={handleConfirm} />}
    />
  );
};

export default OTPValidation;
