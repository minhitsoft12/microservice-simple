interface AuthResponse {
  accessToken: string | null;
  refreshToken: string | null;
}

interface PopupResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function openGoogleAuthPopup(
  authUrl: string
): Promise<PopupResult<AuthResponse>> {
  return new Promise(resolve => {
    // Set popup dimensions and position
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;

    // Clear any previous results
    try {
      sessionStorage.removeItem("google-auth-result");
    } catch (e) {
      console.error("Error clearing session storage:", e);
    }

    // Open the popup with proper configuration
    const popup = window.open(
      authUrl,
      "googleAuthPopup", // Give it a specific name for reference
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
    );

    // Check if popup was blocked
    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      resolve({
        success: false,
        error: "Popup blocked by browser. Please allow popups for this site."
      });
      return;
    }

    // Make sure the popup has a reference to the opener
    try {
      popup.opener = window;
    } catch (e) {
      console.error("Could not set popup.opener:", e);
    }

    // Poll the popup to detect URL changes
    const intervalId = setInterval(() => {
      try {
        // Check if popup is closed
        if (popup.closed) {
          clearInterval(intervalId);

          // Check for fallback data in sessionStorage
          try {
            const storedResult = sessionStorage.getItem("google-auth-result");
            if (storedResult) {
              const result = JSON.parse(storedResult);
              sessionStorage.removeItem("google-auth-result");
              resolve(result);
              return;
            }
          } catch (e) {
            console.error("Error reading from sessionStorage:", e);
          }

          resolve({
            success: false,
            error: "Authentication cancelled"
          });
          return;
        }

        // Try to access popup location, but this may cause cross-origin errors
        try {
          const currentUrl = popup.location.href;

          if (currentUrl.includes("token=")) {
            // Don't close the popup yet - let the callback handle it
            clearInterval(intervalId);

            // Extract the code from the URL
            const urlParams = new URLSearchParams(new URL(currentUrl).search);
            const accessToken = urlParams.get("token");
            const refreshToken = urlParams.get("refresh");

            if (accessToken) {
              // The callback page will send a postMessage, but we also store this as fallback
              try {
                sessionStorage.setItem(
                  "google-auth-result",
                  JSON.stringify({
                    success: true,
                    data: { accessToken, refreshToken }
                  })
                );
              } catch (e) {
                console.error("Error storing in sessionStorage:", e);
              }
            }
          }
        } catch (e) {
          // Cross-origin errors will occur when the popup navigates to the Google domain
          // This is expected and can be ignored
          if (e instanceof DOMException && e.name === "SecurityError") {
            // Silent error - expected during OAuth flow
          } else {
            console.error("Error polling popup:", e);
          }
        }
      } catch (e) {
        console.error("General polling error:", e);
      }
    }, 500);

    // Set a timeout to close the popup if it takes too long
    const timeoutId = setTimeout(() => {
      clearInterval(intervalId);
      if (popup && !popup.closed) popup.close();
      resolve({
        success: false,
        error: "Authentication timed out"
      });
    }, 120000); // 2 minutes timeout

    // Handle window message events (the main approach)
    const messageHandler = (event: MessageEvent) => {
      // We're using * for postMessage, so we need to validate the data structure
      if (event.data && event.data.type === "google-auth-callback") {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        window.removeEventListener("message", messageHandler);

        if (event.data.success) {
          resolve({
            success: true,
            data: event.data.response
          });
        } else {
          resolve({
            success: false,
            error: event.data.error || "Authentication failed"
          });
        }

        if (popup && !popup.closed) {
          try {
            popup.close();
          } catch (e) {
            console.error("Error closing popup:", e);
          }
        }
      }
    };

    window.addEventListener("message", messageHandler);

    // Periodically check sessionStorage for fallback communication
    const storageCheckIntervalId = setInterval(() => {
      try {
        const storedResult = sessionStorage.getItem("google-auth-result");
        if (storedResult) {
          const result = JSON.parse(storedResult);
          sessionStorage.removeItem("google-auth-result");

          clearInterval(storageCheckIntervalId);
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          window.removeEventListener("message", messageHandler);

          if (popup && !popup.closed) {
            try {
              popup.close();
            } catch (e) {
              console.error("Error closing popup:", e);
            }
          }

          resolve(result);
        }
      } catch (e) {
        console.error("Error checking sessionStorage:", e);
      }
    }, 1000);

    // Clean up the storage check interval when the timeout expires
    setTimeout(() => {
      clearInterval(storageCheckIntervalId);
    }, 120000);
  });
}
