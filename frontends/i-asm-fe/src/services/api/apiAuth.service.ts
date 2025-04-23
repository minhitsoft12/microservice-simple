import { apiClient } from "@/services/api/apiClient.service.ts";
import {
  ApiRouteNames,
  apiRoutes
} from "@/shared/constants/routes.constant.ts";

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post(apiRoutes[ApiRouteNames.SIGN_IN], {
      email,
      password
    });

    return response;
  },

  register: async (userData: {
    email: string;
    password: string;
    name: string;
  }) => {
    const response = await apiClient.post(
      apiRoutes[ApiRouteNames.SIGN_UP],
      userData
    );
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post(apiRoutes[ApiRouteNames.SIGN_UP], {
      refreshToken
    });
    return response.data;
  },

  getUserProfile: async () => {
    return await apiClient.get(apiRoutes[ApiRouteNames.PROFILE]);
  },

  getGoogleAuthUrl: async () => {
    const response = await apiClient.get(apiRoutes[ApiRouteNames.GOOGLE_AUTH]);
    console.log(response);
    return response.authUrl;
  }
};
