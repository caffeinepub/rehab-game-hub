import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
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

const managerLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/manager",
  component: ProtectedRoute,
});

const managerIndexRoute = createRoute({
  getParentRoute: () => managerLayoutRoute,
  path: "/",
  component: GameManagerPage,
});

const gameLaunchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/games/$gameId",
  component: GameLaunchPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  managerLayoutRoute.addChildren([managerIndexRoute]),
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
