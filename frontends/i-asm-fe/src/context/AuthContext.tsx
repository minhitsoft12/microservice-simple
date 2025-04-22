import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import { jwtDecode } from "jwt-decode";
import { authApi } from "@/services/api/apiAuth.service";
import { AuthObjectKeyEnum } from "@/shared/enums/auth.enum.ts";
import {User} from "@dym-vietnam/internal-shared";

interface DecodedToken {
  sub: string;
  email: string;
  name: string;
  roleId: string;
  permissions?: string[];
  iat: number;
  exp: number;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  getRoleId: () => string | null;
  updateUserLocal: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

export const AuthProvider = ({
  children,
  refreshInterval = 15
}: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const permissionCache = useRef(new Map<string, boolean>());
  const userProfileTimestamp = useRef<number>(0);
  const tokenRefreshTimeout = useRef<NodeJS.Timeout | null>(null);

  const REFRESH_BUFFER_TIME = 5 * 60 * 1000; // default: 5m

  const safeDecodeToken = (token: string | null): DecodedToken | null => {
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const scheduleTokenRefresh = useCallback(() => {
    // Clear any existing timeout
    if (tokenRefreshTimeout.current) {
      clearTimeout(tokenRefreshTimeout.current);
      tokenRefreshTimeout.current = null;
    }

    const token = localStorage.getItem(AuthObjectKeyEnum.ACCESS_TOKEN);
    const decodedToken = safeDecodeToken(token);

    if (!decodedToken) return;

    const expiryTime = decodedToken.exp * 1000;
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime - REFRESH_BUFFER_TIME;

    // Only schedule if we need to refresh within a reasonable timeframe
    if (timeUntilExpiry > 0 && timeUntilExpiry < 24 * 60 * 60 * 1000) {
      tokenRefreshTimeout.current = setTimeout(() => {
        refreshToken().catch(console.error);
      }, timeUntilExpiry);
    }
  }, []);

  const getUserProfile = async (force = false): Promise<User | null> => {
    try {
      const now = Date.now();
      if (
        force ||
        !userProfileTimestamp.current ||
        now - userProfileTimestamp.current > refreshInterval * 60 * 1000
      ) {
        const userData = await authApi.getUserProfile();
        setUser(userData);
        userProfileTimestamp.current = now;

        permissionCache.current.clear();
        return userData;
      }
      return user;
    } catch (error) {
      console.error("Error fetching user profile:", error);

      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        (error.status === 401 || error.status === 403)
      ) {
        logout();
      }
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const accessToken = localStorage.getItem(
          AuthObjectKeyEnum.ACCESS_TOKEN
        );
        if (!accessToken) {
          setIsLoading(false);
          return;
        }

        const decodedToken = safeDecodeToken(accessToken);
        if (!decodedToken) {
          logout();
          return;
        }

        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          const success = await refreshToken();
          if (!success) {
            logout();
          }
        } else {
          await getUserProfile(true);
          scheduleTokenRefresh();
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        getUserProfile().catch(console.error);
      }
    };

    const handleActivityDetected = () => {
      if (
        Date.now() - userProfileTimestamp.current >
        Math.min(5 * 60 * 1000, (refreshInterval * 60 * 1000) / 3)
      ) {
        getUserProfile().catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleActivityDetected);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleActivityDetected);

      if (tokenRefreshTimeout.current) {
        clearTimeout(tokenRefreshTimeout.current);
      }
    };
  }, [refreshInterval, scheduleTokenRefresh]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.login(email, password);

      localStorage.setItem(
        AuthObjectKeyEnum.ACCESS_TOKEN,
        response.access_token
      );
      localStorage.setItem(
        AuthObjectKeyEnum.REFRESH_TOKEN,
        response.refresh_token
      );

      setUser(response.user);
      userProfileTimestamp.current = Date.now();
      permissionCache.current.clear();

      scheduleTokenRefresh();

      return response.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle logout
   */
  const logout = useCallback(() => {
    localStorage.removeItem(AuthObjectKeyEnum.ACCESS_TOKEN);
    localStorage.removeItem(AuthObjectKeyEnum.REFRESH_TOKEN);
    setUser(null);
    userProfileTimestamp.current = 0;
    permissionCache.current.clear();

    if (tokenRefreshTimeout.current) {
      clearTimeout(tokenRefreshTimeout.current);
      tokenRefreshTimeout.current = null;
    }
  }, []);

  const updateUserLocal = useCallback((userData: Partial<User>) => {
    setUser(currentUser => {
      if (!currentUser) return null;
      return { ...currentUser, ...userData };
    });
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem(
        AuthObjectKeyEnum.REFRESH_TOKEN
      );
      if (!refreshTokenValue) return false;

      const response = await authApi.refreshToken(refreshTokenValue);

      localStorage.setItem(
        AuthObjectKeyEnum.ACCESS_TOKEN,
        response.access_token
      );
      localStorage.setItem(
        AuthObjectKeyEnum.REFRESH_TOKEN,
        response.refresh_token
      );

      await getUserProfile(true);

      scheduleTokenRefresh();

      return true;
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      return false;
    }
  };

  const getRoleId = useCallback((): string | null => {
    if (!user) return null;
    return user.roleId;
  }, [user]);

  const hasRole = useCallback(
    (role: string | string[]): boolean => {
      if (!user) return false;

      if (user.roles && user.roles.length > 0) {
        if (Array.isArray(role)) {
          return role.some(r => user.roles!.includes(r));
        }
        return user.roles.includes(role);
      }

      if (Array.isArray(role)) {
        return role.includes(user.roleId);
      }

      return user.roleId === role;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string | string[]): boolean => {
      if (!user) return false;

      if (Array.isArray(permission)) {
        return permission.some(p => hasPermission(p));
      }

      const cacheKey = permission;
      if (permissionCache.current.has(cacheKey)) {
        return permissionCache.current.get(cacheKey) || false;
      }

      try {
        const token = localStorage.getItem(AuthObjectKeyEnum.ACCESS_TOKEN);
        if (token) {
          const decoded = safeDecodeToken(token);
          if (decoded?.permissions?.includes(permission)) {
            permissionCache.current.set(cacheKey, true);
            return true;
          }
        }
      } catch (e) {
        console.error("Error checking token permissions", e);
      }

      const result =
        user.permissions?.some(
          p => p.name === permission && p.status === "ACTIVE"
        ) || false;
      permissionCache.current.set(cacheKey, result);
      return result;
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
    getRoleId,
    updateUserLocal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
