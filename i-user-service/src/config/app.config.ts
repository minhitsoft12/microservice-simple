import { getEnv } from "../common/utils/get-env";

export enum AppMode {
    STANDALONE = "STANDALONE",
    SERVICE = "SERVICE",
}

const appConfig = () => ({
    APP_MODE: getEnv("APP_MODE", AppMode.SERVICE),
    HOST: getEnv("HOST", "localhost"),
    PORT: getEnv("PORT", "5000"),
    TCP_PORT: getEnv("TCP_PORT", "4001"),
    NODE_ENV: getEnv("NODE_ENV", "development"),
    BASE_PATH: getEnv("BASE_PATH", "/api"),
    MONGO_URI: getEnv("MONGO_URI", "mongodb://localhost:27017/api"),
    SESSION_SECRET: getEnv("SESSION_SECRET", "your_session_secret"),
    SESSION_EXPIRES_IN: getEnv("SESSION_EXPIRES_IN", "12h"),

    // JWT_ACCESS_SECRET: getEnv("JWT_ACCESS_SECRET"),
    // JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    // JWT_ACCESS_EXPIRATION: getEnv("JWT_ACCESS_EXPIRATION", "15m"),
    // JWT_REFRESH_EXPIRATION: getEnv("JWT_REFRESH_EXPIRATION", "7d"),
    // JWT_REFRESH_EXPIRATION_MS: 7 * 24 * 60 * 60 * 1000,

    GOOGLE_CLIENT_ID: getEnv("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: getEnv("GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"),
    GOOGLE_CALLBACK_URL: getEnv("GOOGLE_CALLBACK_URL", "http://localhost:5000"),

    APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
    FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
    FRONTEND_GOOGLE_CALLBACK_URL: getEnv("FRONTEND_GOOGLE_CALLBACK_URL", "http://localhost:3000"),
});

export const defaultAdminAccount = {
    email: getEnv("ADMIN_EMAIL", "it-dym@dymvietnam.net"),
    password: getEnv("ADMIN_PASSWORD", "Dym@2025"),
    name: getEnv("ADMIN_NAME", "IT DYM VIETNAM"),
};

export const config = appConfig();
