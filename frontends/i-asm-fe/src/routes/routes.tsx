import { lazy } from "react";
import {
  AppRouteNames,
  appRoutes
} from "@/shared/constants/routes.constant.ts";
import Unauthorized from "@/pages/errors/Unauthorized.tsx";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Login = lazy(() => import("@/pages/auth/Login.tsx"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export interface RouteConfig {
  path: string;
  element: React.ComponentType;
  children?: RouteConfig[];
  auth?: boolean;
  roles?: string[];
}

export const routes: RouteConfig[] = [
  {
    path: appRoutes[AppRouteNames.HOME],
    element: Dashboard,
    auth: true
  },
  {
    path: appRoutes[AppRouteNames.SIGN_IN],
    element: Login,
    auth: false
  },
  {
    path: appRoutes[AppRouteNames.UNAUTHORIZED],
    element: Unauthorized,
    auth: true
  },
  {
    path: "*",
    element: NotFound,
    auth: false
  }
];
