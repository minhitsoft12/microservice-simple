import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import config from "@/shared/constants/config.constant.ts";
import { AuthObjectKeyEnum } from "@/shared/enums/auth.enum.ts";
import {
  ApiRouteNames,
  apiRoutes,
  AppRouteNames,
  appRoutes
} from "@/shared/constants/routes.constant.ts";

class ApiClientService {
  private readonly client: AxiosInstance;
  private static instance: ApiClientService;

  private constructor() {
    this.client = axios.create({
      baseURL: config.getApiUrl(),
      headers: {
        "Content-Type": "application/json"
      }
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClientService {
    if (!ApiClientService.instance) {
      ApiClientService.instance = new ApiClientService();
    }
    return ApiClientService.instance;
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  private handleLogout(): void {
    localStorage.removeItem(AuthObjectKeyEnum.ACCESS_TOKEN);
    localStorage.removeItem(AuthObjectKeyEnum.REFRESH_TOKEN);

    if (window.location.pathname !== appRoutes[AppRouteNames.SIGN_IN]) {
      window.location.href = appRoutes[AppRouteNames.SIGN_IN];
    }
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    console.log(this.client.getUri());
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }

  private setupInterceptors(): void {
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem(AuthObjectKeyEnum.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem(
              AuthObjectKeyEnum.REFRESH_TOKEN
            );
            if (!refreshToken) {
              this.handleLogout();
              return Promise.reject(error);
            }

            const { data } = await axios.post(
              config.getApiUrl(apiRoutes[ApiRouteNames.REFRESH_TOKEN]),
              { refreshToken },
              { headers: { "Content-Type": "application/json" } }
            );

            localStorage.setItem(
              AuthObjectKeyEnum.ACCESS_TOKEN,
              data[AuthObjectKeyEnum.ACCESS_TOKEN]
            );
            localStorage.setItem(
              AuthObjectKeyEnum.REFRESH_TOKEN,
              data[AuthObjectKeyEnum.REFRESH_TOKEN]
            );

            originalRequest.headers.Authorization = `Bearer ${data[AuthObjectKeyEnum.ACCESS_TOKEN]}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.handleLogout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }
}

export const apiClient = ApiClientService.getInstance();
