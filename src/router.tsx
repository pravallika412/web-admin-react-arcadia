import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "./layouts/SidebarLayout";
import BaseLayout from "./layouts/BaseLayout";

import SuspenseLoader from "./shared/components/SuspenseLoader";

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Pages

const Login = Loader(lazy(() => import("./modules/Login")));

const Overview = Loader(lazy(() => import("./modules/overview")));
const Subscription = Loader(lazy(() => import("./modules/subscription")));
const Handler = Loader(lazy(() => import("./modules/handler")));
const Dog = Loader(lazy(() => import("./modules/Dog")));
const CoreEntity = Loader(lazy(() => import("./modules/CoreEntity")));
// Status

const Status404 = Loader(lazy(() => import("./modules/pages/Status/Status404")));

const routes: RouteObject[] = [
  {
    path: "",
    element: <BaseLayout />,
    children: [
      {
        path: "/",
        element: <Login />,
      },
      {
        path: "status",
        children: [
          {
            path: "",
            element: <Navigate to="404" replace />,
          },
          {
            path: "404",
            element: <Status404 />,
          },
        ],
      },
      {
        path: "*",
        element: <Status404 />,
      },
    ],
  },
  {
    path: "",
    element: <SidebarLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="overview" replace />,
      },
      {
        path: "overview",
        element: <Overview />,
      },
      {
        path: "subscription",
        element: <Subscription />,
      },
      {
        path: "handler",
        element: <Handler />,
      },
      {
        path: "dog",
        element: <Dog />,
      },
      {
        path: "core-entity",
        element: <CoreEntity />,
      },
    ],
  },
  {
    path: "management",
    element: <SidebarLayout />,
    children: [
      {
        path: "",
        element: <Navigate to="transactions" replace />,
      },
    ],
  },
];

export default routes;
