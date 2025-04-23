import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AppRouteNames, appRoutes } from "@/shared/constants/routes.constant";

const Login = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and not loading, redirect to home page
    if (isAuthenticated && !isLoading) {
      navigate(appRoutes[AppRouteNames.HOME]);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[url(/images/login/login-background.png)] bg-cover bg-no-repeat bg-center">
      <div className="w-[88.75%] md:w-[1100px] h-[526px] md:h-[750px] bg-[url(/images/login/background_center_sp.png)] md:bg-[url(/images/login/background_center.png)] bg-contain md:bg-cover bg-no-repeat bg-center rounded-[20px] md:rounded-[40px]">
        <div className="w-full md:w-[350px] h-full flex flex-col justify-end md:justify-center gap-[22px] ml-0 md:ml-[45px] px-10 md:px-0 pb-[49px] md:pb-0">
          <img
            src="/images/login/logo.png"
            alt="DYM VIETNAM LOGO"
            className="w-[344px] h-[144px] object-cover hidden md:block"
          />
          {/*<LoginGoogle />*/}
        </div>
      </div>
    </div>
  );
};

export default Login;
