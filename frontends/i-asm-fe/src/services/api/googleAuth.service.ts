import {
    signInWithPopup,
    signOut,
    UserCredential
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import { User } from "@dym-vietnam/internal-shared";
import config from "@/shared/constants/config.constant";
import { ApiRouteNames, apiRoutes } from "@/shared/constants/routes.constant";
import { apiClient } from "./apiClient.service";

interface GoogleAuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export const googleAuthService = {
    // Validate if the email domain is allowed
    validateEmailDomain: (email: string | null): boolean => {
        if (!email) return false;

        const allowedDomains = ['dym.jp', 'dymvietnam.jp', 'dymvietnam.net'];
        const emailDomain = email.split('@')[1]?.toLowerCase();

        return allowedDomains.includes(emailDomain);
    },

    // Sign in with Google popup
    signInWithGoogle: async (): Promise<UserCredential> => {
        try {
            const result = await signInWithPopup(auth, googleProvider);

            // Check if the user's email domain is allowed
            const email = result.user.email;
            if (!googleAuthService.validateEmailDomain(email)) {
                await signOut(auth); // Sign out the user immediately
                throw new Error("Only email addresses from @dym.jp, @dymvietnam.jp, or @dymvietnam.net domains are allowed to login");
            }

            return result;
        } catch (error) {
            console.error("Error signing in with Google:", error);
            throw error;
        }
    },

    // Process Google auth result with backend
    processGoogleAuth: async (credential: UserCredential): Promise<GoogleAuthResponse> => {
        try {
            // Get ID token from the Google Auth credential
            const idToken = await credential.user.getIdToken();

            // Call your backend API to verify and process the token
            // This endpoint will need to be implemented on your backend
            const response = await apiClient.post(config.getApiUrl(apiRoutes[ApiRouteNames.GOOGLE_AUTH]),
                { idToken }
            );

            if (!response.status || response.status !== 200) {
                throw new Error(`Error: ${response.status}`);
            }

            return await response;
        } catch (error) {
            console.error("Error processing Google authentication:", error);
            throw error;
        }
    },

    // Sign out user
    signOut: async (): Promise<void> => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    }
};