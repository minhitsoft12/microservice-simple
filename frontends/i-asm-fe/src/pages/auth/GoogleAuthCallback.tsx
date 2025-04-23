import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

enum Status {
  PROCESSING = "processing",
  SUCCESS = "success",
  ERROR = "error"
}

const GoogleAuthCallback = () => {
  const [status, setStatus] = useState<Status>(Status.PROCESSING);
  const [message, setMessage] = useState("Processing authentication...");
  const location = useLocation();

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log(window.opener);
        const urlParams = new URLSearchParams(location.search);
        const accessToken = urlParams.get("token");
        const refreshToken = urlParams.get("refresh");

        if (!accessToken) {
          setStatus(Status.ERROR);
          setMessage("No authorization code found");
          return;
        }

        // First approach: try postMessage to opener
        if (window.opener) {
          try {
            console.log("Attempting to post message to opener window");
            window.opener.postMessage(
              {
                type: "google-auth-callback",
                success: true,
                response: { accessToken, refreshToken }
              },
              "*" // Use * instead of origin for broader compatibility
            );
            console.log("Message posted to opener window");
          } catch (postError) {
            console.error("Error posting message:", postError);
          }
        } else {
          console.warn("window.opener is null, falling back to URL state");
          // Store in sessionStorage as fallback
          try {
            sessionStorage.setItem(
              "google-auth-result",
              JSON.stringify({
                success: true,
                response: { accessToken, refreshToken }
              })
            );
          } catch (storageError) {
            console.error("Error storing in sessionStorage:", storageError);
          }
        }

        setStatus(Status.SUCCESS);
        setMessage("Authentication successful! You can close this window.");

        // Automatically close after 3 seconds
        // setTimeout(() => {
        //   window.close();
        // }, 3000);
      } catch (err: any) {
        setStatus(Status.ERROR);
        setMessage(
          err.response?.data?.message || "Failed to authenticate with Google"
        );

        // Notify the opener window about the error
        if (window.opener) {
          try {
            window.opener.postMessage(
              {
                type: "google-auth-callback",
                success: false,
                error:
                  err.response?.data?.message ||
                  "Failed to authenticate with Google"
              },
              "*"
            );
          } catch (postError) {
            console.error("Error posting error message:", postError);
          }
        } else {
          // Store error in sessionStorage as fallback
          try {
            sessionStorage.setItem(
              "google-auth-result",
              JSON.stringify({
                success: false,
                error:
                  err.response?.data?.message ||
                  "Failed to authenticate with Google"
              })
            );
          } catch (storageError) {
            console.error("Error storing in sessionStorage:", storageError);
          }
        }
      }
    };

    void processCallback();
  }, [location]);

  const handleCloseWindow = () => {
    window.close();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {status === Status.SUCCESS
            ? "Authentication Successful"
            : status === Status.ERROR
              ? "Authentication Failed"
              : "Processing Authentication"}
        </h2>

        <div className="my-4 text-gray-700">{message}</div>

        {status === Status.PROCESSING && (
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {status === Status.ERROR && (
          <button onClick={handleCloseWindow} className="btn btn-primary mt-4">
            Close Window
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
