import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  AppRouteNames,
  appRoutes
} from "@/shared/constants/routes.constant.ts";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute = ({ children, roles = [] }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={appRoutes[AppRouteNames.SIGN_IN]} replace />;
  }

  if (
    roles.length > 0 &&
    !roles.some(role => (user?.roles ?? []).includes(role))
  ) {
    return <Navigate to={appRoutes[AppRouteNames.UNAUTHORIZED]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
