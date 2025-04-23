enum AppRouteNames {
  HOME = "home",
  SIGN_IN = "login",
  SIGN_UP = "register",
  UNAUTHORIZED = "unauthorized",
  GOOGLE_CALLBACK = "google-callback"
}

enum ApiRouteNames {
  SIGN_IN = "login",
  SIGN_OUT = "logout",
  SIGN_UP = "register",
  REFRESH_TOKEN = "refresh-token",
  PROFILE = "profile",
  GOOGLE_AUTH = "google-auth",
  GOOGLE_CALLBACK = "google-callback"
}

const appRoutes: Record<AppRouteNames, string> = {
  [AppRouteNames.HOME]: "",
  [AppRouteNames.SIGN_IN]: "/login",
  [AppRouteNames.SIGN_UP]: "/register",
  [AppRouteNames.UNAUTHORIZED]: "/unauthorized",
  [AppRouteNames.GOOGLE_CALLBACK]: "/auth/callback"
};

const apiRoutes: Record<ApiRouteNames, string> = {
  [ApiRouteNames.SIGN_IN]: "/auth/login",
  [ApiRouteNames.SIGN_OUT]: "/auth/register",
  [ApiRouteNames.SIGN_UP]: "/auth/logout",
  [ApiRouteNames.REFRESH_TOKEN]: "/auth/refresh-token",
  [ApiRouteNames.PROFILE]: "/auth/profile",
  [ApiRouteNames.GOOGLE_AUTH]: "/auth/google",
  [ApiRouteNames.GOOGLE_CALLBACK]: "/auth/google/callback"
};

export { AppRouteNames, ApiRouteNames, appRoutes, apiRoutes };
