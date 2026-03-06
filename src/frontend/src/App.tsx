import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/AppLayout";
import GameLaunchPage from "./pages/GameLaunchPage";
import GameManagerPage from "./pages/GameManagerPage";
import HomePage from "./pages/HomePage";

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager",
  component: GameManagerPage,
});

const gameLaunchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/$gameId",
  component: GameLaunchPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  managerRoute,
  gameLaunchRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
