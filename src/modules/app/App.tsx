import { useRoutes } from "react-router-dom";
import router from "../../router";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

import { CssBaseline } from "@mui/material";
import ThemeProvider from "../../styles/theme/ThemeProvider";
import noInternetGif from "../../assets/images/nointernet.gif";
import ServerErrorGif from "../../assets/images/servererror.gif";

function App() {
  const content = useRoutes(router);

  return (
    <ThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <CssBaseline />
        <img src={ServerErrorGif} alt="No internet" style={{ display: "none" }} />
        <img src={noInternetGif} alt="No internet" style={{ display: "none" }} />
        {content}
      </LocalizationProvider>
    </ThemeProvider>
  );
}
export default App;
