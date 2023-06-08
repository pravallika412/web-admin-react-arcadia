import { makeStyles } from "@mui/styles";

const colors = {
  secondary400: "#E6313C",
  secondary300: "#FF5E68",
  secondary500: "#CC2B35",
  secondary025: "#FFF5F5",
  primary200: "#9BD6FF",
  primary600: "#024C7F",
  info200: "#9ADFFF",
  info300: "#35BFFF",
  info020: "#F2FBFF",
};

const useStyles = makeStyles(() => ({
  primary200: {
    color: colors.primary200,
  },
  tertiary200: {
    color: colors.info200,
  },
  font48: {
    fontSize: "48px !important", // Custom font size
    fontWeight: 700,
  },

  font12: {
    fontSize: "12px !important",
  },

  font18: {
    fontSize: "18px !important",
  },

  pointer: {
    cursor: "pointer",
  },

  loginDisabledButton: {
    color: `${colors.primary600} !important`,
    background: `rgba(255, 255, 255, 0.6) !important`,
  },
  disabledButton: {
    background: `${colors.primary600} !important`,
    color: `rgba(255, 255, 255) !important`,
    opacity: 0.7,
  },
  otpInput: {
    textAlign: "center",
    width: "100%",
    fontSize: 24,
    padding: 10,
  },
  textFieldWhite: {
    "& .MuiOutlinedInput-root": {
      "&.Mui-focused:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: colors.primary200,
      },
      "& fieldset": {
        borderColor: colors.primary200,
      },
      "&:hover fieldset": {
        borderColor: colors.primary200,
      },
      "&.Mui-focused fieldset": {
        borderColor: colors.primary200,
      },
    },
    "& .MuiOutlinedInput-input": {
      color: "white",
      "&:hover": {
        color: "white",
      },
      "&.Mui-focused": {
        color: "white",
      },
    },
    "& .MuiFormLabel-root": {
      color: colors.primary200,
      "&:hover": {
        color: colors.primary200,
      },
      "&.Mui-focused": {
        color: "white",
      },
    },
  },
  textFieldError: {
    "& .MuiFormLabel-root": {
      color: colors.secondary300,
      "&:hover": {
        color: colors.secondary300,
      },
      "&.Mui-focused": {
        color: colors.secondary300,
      },
    },
    "& .MuiOutlinedInput-input": {
      color: "white",
      "&:hover": {
        color: "white",
      },
      "&.Mui-focused": {
        color: "white",
      },
    },
  },
}));

export default useStyles;
