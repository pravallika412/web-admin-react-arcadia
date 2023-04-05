import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";

import "nprogress/nprogress.css";
import App from "./modules/app/App";
import { SidebarProvider } from "./shared/contexts/SidebarContext";
import * as serviceWorker from "./serviceWorker";
import { ApolloClient, InMemoryCache, createHttpLink, ApolloProvider, useQuery, gql } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "https://api-wdf.dev.rapidinnovation.tech/graphql",
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
  link: authLink.concat(httpLink),
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
