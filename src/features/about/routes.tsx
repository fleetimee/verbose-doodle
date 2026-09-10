import { lazy } from "react";
import { Route } from "react-router";

const About = lazy(() =>
  import("@/pages/about").then(({ About }) => ({ default: About }))
);

export const aboutRoutes = <Route element={<About />} path="/about" />;
