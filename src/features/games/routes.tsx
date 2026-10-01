import { lazy } from "react";
import { Navigate, Route } from "react-router";

const FallLinePage = lazy(() =>
  import("@/pages/dashboard/fall-line").then(({ FallLinePage }) => ({
    default: FallLinePage,
  }))
);

const TerrabrowserPage = lazy(() =>
  import("@/pages/dashboard/terrabrowser").then(({ TerrabrowserPage }) => ({
    default: TerrabrowserPage,
  }))
);

const PonpokoKartPage = lazy(() =>
  import("@/pages/dashboard/ponpoko-kart").then(({ PonpokoKartPage }) => ({
    default: PonpokoKartPage,
  }))
);

const EmberwakePage = lazy(() =>
  import("@/pages/dashboard/emberwake").then(({ EmberwakePage }) => ({
    default: EmberwakePage,
  }))
);

const BuildYourTownPage = lazy(() =>
  import("@/pages/dashboard/build-your-town").then(({ BuildYourTownPage }) => ({
    default: BuildYourTownPage,
  }))
);

const Chess3dPage = lazy(() =>
  import("@/pages/dashboard/chess-3d").then(({ Chess3dPage }) => ({
    default: Chess3dPage,
  }))
);

const NovaLancerPage = lazy(() =>
  import("@/pages/dashboard/nova-lancer").then(({ NovaLancerPage }) => ({
    default: NovaLancerPage,
  }))
);

const SunbreakPage = lazy(() =>
  import("@/pages/dashboard/sunbreak").then(({ SunbreakPage }) => ({
    default: SunbreakPage,
  }))
);

const ArkanoidNeonPage = lazy(() =>
  import("@/pages/dashboard/arkanoid-neon").then(({ ArkanoidNeonPage }) => ({
    default: ArkanoidNeonPage,
  }))
);

const HearthvalePage = lazy(() =>
  import("@/pages/dashboard/hearthvale").then(({ HearthvalePage }) => ({
    default: HearthvalePage,
  }))
);

export const gameRoutes = (
  <>
    <Route
      element={<Navigate replace to="/dashboard/games/fall-line" />}
      path="games"
    />
    <Route element={<FallLinePage />} path="games/fall-line" />
    <Route element={<TerrabrowserPage />} path="games/terrabrowser" />
    <Route element={<PonpokoKartPage />} path="games/ponpoko-kart" />
    <Route element={<EmberwakePage />} path="games/emberwake" />
    <Route element={<BuildYourTownPage />} path="games/build-your-town" />
    <Route element={<Chess3dPage />} path="games/chess-3d" />
    <Route element={<NovaLancerPage />} path="games/nova-lancer" />
    <Route element={<SunbreakPage />} path="games/sunbreak" />
    <Route element={<ArkanoidNeonPage />} path="games/arkanoid-neon" />
    <Route element={<HearthvalePage />} path="games/hearthvale" />
  </>
);
