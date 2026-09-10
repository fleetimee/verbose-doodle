import { lazy } from "react";
import { Route } from "react-router";

const Login = lazy(() =>
  import("@/pages/login").then(({ Login }) => ({ default: Login }))
);
const LoggedOut = lazy(() =>
  import("@/pages/logged-out").then(({ LoggedOut }) => ({
    default: LoggedOut,
  }))
);

export const authRoutes = (
  <>
    <Route element={<Login />} path="/login" />
    <Route element={<LoggedOut />} path="/logged-out" />
  </>
);
