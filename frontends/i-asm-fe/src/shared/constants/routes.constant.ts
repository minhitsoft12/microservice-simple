enum AppRouteNames {
  HOME = "home",
  SIGN_IN = "login",
  SIGN_UP = "register",
  UNAUTHORIZED = "unauthorized"
}

enum ApiRouteNames {
  SIGN_IN = "login",
  SIGN_OUT = "logout",
  SIGN_UP = "register",
  REFRESH_TOKEN = "refresh-token",
  PROFILE = "profile"
}

const appRoutes: Record<AppRouteNames, string> = {
  [AppRouteNames.HOME]: "",
  [AppRouteNames.SIGN_IN]: "/login",
  [AppRouteNames.SIGN_UP]: "/register",
  [AppRouteNames.UNAUTHORIZED]: "/unauthorized"
};

const apiRoutes: Record<ApiRouteNames, string> = {
  [ApiRouteNames.SIGN_IN]: "/auth/login",
  [ApiRouteNames.SIGN_OUT]: "/auth/register",
  [ApiRouteNames.SIGN_UP]: "/auth/logout",
  [ApiRouteNames.REFRESH_TOKEN]: "/auth/refresh-token",
  [ApiRouteNames.PROFILE]: "/auth/profile"
};

export { AppRouteNames, ApiRouteNames, appRoutes, apiRoutes };
