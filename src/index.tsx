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
import SnackbarComponent from "./shared/components/Snackbar";

const baseURL = process.env.API_BASE_URL;
const httpLink = createHttpLink({
  uri: baseURL,
});

const errorHandler = (message) => {
  console.log("message", message);
};
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message }) => {
      errorHandler(message);
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
    <SidebarProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </SidebarProvider>
  </HelmetProvider>,
  document.getElementById("root")
);

serviceWorker.unregister();
