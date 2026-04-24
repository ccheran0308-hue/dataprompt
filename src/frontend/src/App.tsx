import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Suspense, lazy } from "react";

const DataUploadPage = lazy(() => import("@/pages/DataUploadPage"));
const ExplorerPage = lazy(() => import("@/pages/ExplorerPage"));

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster richColors position="bottom-right" />
    </>
  ),
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <Suspense fallback={<div className="flex-1 animate-pulse bg-muted/30" />}>
      <DataUploadPage />
    </Suspense>
  ),
});

const explorerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/explore",
  component: () => (
    <Suspense fallback={<div className="flex-1 animate-pulse bg-muted/30" />}>
      <ExplorerPage />
    </Suspense>
  ),
});

const routeTree = rootRoute.addChildren([uploadRoute, explorerRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
