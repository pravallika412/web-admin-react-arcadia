import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "./modules/app/App";
import { SidebarProvider } from "./shared/contexts/SidebarContext";
import * as serviceWorker from "./serviceWorker";
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import "react-toastify/dist/ReactToastify.css";
import toast, { Toaster } from "react-hot-toast";
import { Alert, Snackbar } from "@mui/material";
import { GlobalStyle } from "./styles/theme/globalFont";
import NoInternet from "./modules/pages/Status/NoInternet";

const baseURL = process.env.API_BASE_URL;
const httpLink = createHttpLink({
  uri: baseURL,
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) => {
      toast(
        <Snackbar open={true} autoHideDuration={3000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
          <Alert severity="error" sx={{ width: "100%" }}>
            {message}
          </Alert>
        </Snackbar>,
        { duration: 3000, style: { display: "contents" } }
      );
    });
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

const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <HelmetProvider>
    <GlobalStyle />
    <SidebarProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <NoInternet />
          <App />
          <Toaster />
        </BrowserRouter>
      </ApolloProvider>
    </SidebarProvider>
  </HelmetProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
