import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, useNavigate } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "./modules/app/App";
import { SidebarProvider } from "./shared/contexts/SidebarContext";
import * as serviceWorker from "./serviceWorker";
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, from, ApolloLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import "react-toastify/dist/ReactToastify.css";
import toast, { Toaster } from "react-hot-toast";
import { Alert, Snackbar } from "@mui/material";
import { GlobalStyle } from "./styles/theme/globalFont";
import NoInternet from "./modules/pages/Status/NoInternet";
import NetworkErrorDialog from "./modules/pages/Status/ServerError";
import { useState } from "react";

const baseURL = process.env.API_BASE_URL;
const httpLink = createHttpLink({
  uri: baseURL,
});

const ErrorProvider = ({ children }) => {
  const navigate = useNavigate();
  const [networkError, setNetworkError] = useState(false);

  const handleNetworkError = (message) => {
    if (message === "No connection established") {
      setNetworkError(true);
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
      graphQLErrors.forEach(({ message }) => {
        handleNetworkError(message);
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

  const interceptorLink = new ApolloLink((operation, forward) => {
    // Check token expiration
    const expiresIn = localStorage.getItem("expiresIn");
    const expirationTimestamp = parseInt(expiresIn, 10) * 1000; // Convert expiresIn to milliseconds
    const currentTimestamp = Date.now();
    if (expirationTimestamp < currentTimestamp) {
      window.localStorage.clear();
      navigate("/");
      return null;
    }

    return forward(operation);
  });

  const client = new ApolloClient({
    link: from([interceptorLink, errorLink, authLink.concat(httpLink)]),
    cache: new InMemoryCache(),
  });

  const handleCloseDialog = () => {
    setNetworkError(false);
  };

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
