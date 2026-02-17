import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import AppLayout from './components/AppLayout';
import HomePage from './pages/HomePage';
import GameManagerPage from './pages/GameManagerPage';
import GameLaunchPage from './pages/GameLaunchPage';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const managerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/manager',
  component: GameManagerPage,
});

const gameLaunchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/games/$gameId',
  component: GameLaunchPage,
});

const routeTree = rootRoute.addChildren([indexRoute, managerRoute, gameLaunchRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
