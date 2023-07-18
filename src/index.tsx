import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, useNavigate } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "./modules/app/App";
import { SidebarProvider } from "./shared/contexts/SidebarContext";
import * as serviceWorker from "./serviceWorker";
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, from, ApolloLink, useQuery, Observable } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import "react-toastify/dist/ReactToastify.css";
import toast, { Toaster } from "react-hot-toast";
import { Alert, Snackbar } from "@mui/material";
import { GlobalStyle } from "./styles/theme/globalFont";
import NoInternet from "./modules/pages/Status/NoInternet";
import NetworkErrorDialog from "./modules/pages/Status/ServerError";
import { useEffect, useState } from "react";
import { REFRESH_TOKEN } from "./shared/graphQL/common/queries";
import crypto from "crypto";

const baseURL = process.env.API_BASE_URL;
const httpLink = createHttpLink({
  uri: baseURL,
});

const secretKey = process.env.TOKEN_SECURITY_KEY;
const iv = process.env.INIT_VECTOR;

const ErrorProvider = ({ children }) => {
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState(false);
  const handleNetworkError = (message, statusCode) => {
    console.log(statusCode, message);
    if (message === "No connection established") {
      setNetworkError(true);
    } else if (statusCode === 401) {
      // Unauthorized error
      window.localStorage.clear();
      navigate("/"); // Redirect to login page
    } else {
      toast(
        <Snackbar open={true} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {message}
          </Alert>
        </Snackbar>,
        { duration: 3000, style: { display: "contents" } }
      );
    }
  };

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        const statusCode =
          (extensions as { response: { status?: number; statusCode?: number } })?.response?.status || (extensions as { response: { status?: number; statusCode?: number } })?.response?.statusCode;
        handleNetworkError(message, statusCode);
      });
    }
    if (networkError) console.log(`[Network error]: ${networkError}`);
  });

  const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

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

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshtoken");

      const { data, errors } = await client.query({
        query: REFRESH_TOKEN,
        variables: {
          input: { jwtToken: refreshToken },
        },
        fetchPolicy: "no-cache",
      });
      const { jwtToken, expiresIn } = data.RefreshToken;

      const decryptedToken = await decryptMessage(jwtToken);

      window.localStorage.setItem("token", decryptedToken);
      window.localStorage.setItem("expiresIn", expiresIn);
    } catch (error) {
      // Handle error if refresh token API call fails
      console.error("Error refreshing token:", error);
      window.localStorage.clear();
      navigate("/");
    }
  };

  useEffect(() => {
    const refreshTokenIfNeeded = () => {
      const expiresIn = localStorage.getItem("expiresIn");
      const expirationTimestamp = parseInt(expiresIn, 10) * 1000;
      const currentTimestamp = Date.now();
      const difference = expirationTimestamp - currentTimestamp;
      console.log("test", difference < 300000, difference);
      if (difference < 300000) {
        refreshToken();
      }
    };

    const intervalId = setInterval(refreshTokenIfNeeded, 180000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleCloseDialog = () => {
    setNetworkError(false);
  };

  const client = new ApolloClient({
    link: from([errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache(),
  });

  return (
    <>
      <NoInternet />
      {networkError && <NetworkErrorDialog handleCloseDialog={handleCloseDialog} networkError={networkError} />}
      <ApolloProvider client={client}>{children}</ApolloProvider>
      <Toaster />
    </>
  );
};

ReactDOM.render(
  <HelmetProvider>
    <GlobalStyle />
    <SidebarProvider>
      <BrowserRouter>
        <ErrorProvider>
          <App />
        </ErrorProvider>
      </BrowserRouter>
    </SidebarProvider>
  </HelmetProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
