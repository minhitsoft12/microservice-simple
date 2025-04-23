import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { openGoogleAuthPopup } from "@/shared/utils/authPopup.ts";
import { useAuth } from "@/context/AuthContext.tsx";
import {
  ApiRouteNames,
  apiRoutes
} from "@/shared/constants/routes.constant.ts";
import config from "@/shared/constants/config.constant";

const LoginGoogle = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from?.pathname || "/";

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError(null);

      const authUrl = config.getApiUrl(apiRoutes[ApiRouteNames.GOOGLE_AUTH]);

      const result = await openGoogleAuthPopup(authUrl);

      console.log("Auth result:", result);

      if (result.success && result.data) {
        // Login with the received tokens and user data
        await loginWithGoogle(result.data);
        navigate(from, { replace: true });
      } else {
        throw new Error(result.error || "Google authentication failed");
      }
    } catch (err: any) {
      setError(
        typeof err === "string"
          ? err
          : err.message || "Failed to authenticate with Google"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <img
          src="/images/login/google-icon.png"
          alt="Google"
          className="w-[45px] h-[45px]"
        />
        {isSubmitting ? "Đang xử lý..." : "Tiếp tục với Google"}
      </button>

      {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

      <div className="mt-4 text-gray-500 text-xs">
        Only @dym.jp, @dymvietnam.jp, or @dymvietnam.net email addresses are
        allowed
      </div>
    </div>
  );
};

export default LoginGoogle;
