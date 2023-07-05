import { Suspense, lazy } from "react";
import { Navigate } from "react-router-dom";
import { RouteObject } from "react-router";

import SidebarLayout from "./layouts/SidebarLayout";
import BaseLayout from "./layouts/BaseLayout";

import SuspenseLoader from "./shared/components/SuspenseLoader";
import AddDog from "./modules/Dog/addDog";
import SponsorDetailComponent from "./modules/sponsor/sponsorDetail";
import HandlerDetailComponent from "./modules/handler/handlerDetail";
import ForgetPassword from "./modules/Login/forgetpassword";
import OTPValidation from "./modules/Login/otp-validate";
import ResetPassword from "./modules/Login/reset-password";
import DogDetails from "./modules/Dog/dogDetails";
import { Stepper } from "@mui/material";
import StepperForm from "./modules/Dog/stepper";

const Loader = (Component) => (props) =>
  (
    <Suspense fallback={<SuspenseLoader left="10%" />}>
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
const Sponsors = Loader(lazy(() => import("./modules/sponsor")));
const Settings = Loader(lazy(() => import("./modules/settings")));
const Posts = Loader(lazy(() => import("./modules/posts")));

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
        path: "/forget-password",
        element: <ForgetPassword />,
      },
      {
        path: "/otp-validate",
        element: <OTPValidation />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
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
        path: "/handlerdetails/:id",
        element: <HandlerDetailComponent />,
      },
      {
        path: "dog",
        element: <Dog />,
      },
      // {
      //   path: "dog/addDog",
      //   element: <AddDog />,
      // },
      { path: "/dog/stepper", element: <StepperForm /> },
      {
        path: "/dogdetails/:id",
        element: <DogDetails />,
      },
      {
        path: "core-entity",
        element: <CoreEntity />,
      },
      {
        path: "sponsors",
        element: <Sponsors />,
      },
      {
        path: "/sponsordetails/:id",
        element: <SponsorDetailComponent />,
      },
      {
        path: "posts",
        element: <Posts />,
      },
      {
        path: "settings",
        element: <Settings />,
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
