import { useRoutes } from "react-router-dom";
import router from "../../router";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "../../styles/theme/ThemeProvider";
import noInternetGif from "../../assets/images/nointernet.gif";
import { useEffect } from "react";

function App() {
  const content = useRoutes(router);
  useEffect(() => {
    const img = new Image();
    img.src = noInternetGif;
  }, []);

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        {content}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
