import "dotenv/config";
import express, {NextFunction, Request, Response} from "express";
import cors from "cors";
import session from "cookie-session";
import {AppMode, config} from "./config/app.config";
import connectDatabase from "./config/database.config";
import {asyncHandler} from "./middlewares/asyncHandler.middleware";
import {HTTP_STATUS} from "./config/http.config";
import {errorHandler} from "./middlewares/errorHandler.middleware";

import "./config/passport.config";
import passport from "passport";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import authenticate from "./middlewares/authenticate.middleware";
import {TCPTransport} from "./tcpTransport";
import {TCPRequest, TCPResponse, TCPRouteMapper,} from "./services/tcpRouteMapper.service";
import {userController} from "./modules/user.module";
import {authController} from "./modules/auth.module";
import {roleController} from "./modules/author.module"

const app = express();
const BASE_PATH = config.BASE_PATH;
const isServiceMode: boolean = config.APP_MODE === AppMode.SERVICE;

app.get(
  `/`,
  asyncHandler(
    async (
      req: Request | TCPRequest,
      res: Response | TCPResponse,
      next?: NextFunction
    ) => {
        res.status(HTTP_STATUS.OK).json({ message: "Hello!" });
    }
  )
);

const tcpTransport = new TCPTransport(Number(config.TCP_PORT), config.HOST);
const tcpRouteMapper = new TCPRouteMapper(tcpTransport);

if (!isServiceMode) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use(
      session({
          name: "session",
          keys: [config.SESSION_SECRET],
          maxAge: 24 * 60 * 60 * 1000,
          secure: config.NODE_ENV === "production",
          httpOnly: true,
          sameSite: "lax",
      })
    );

    app.use((req, res, next) => {
        if (req.session && !req.session.regenerate) {
            req.session.regenerate = (cb: () => void) => {
                cb();
            };
        }
        if (req.session && !req.session.save) {
            req.session.save = (cb: () => void) => {
                cb();
            };
        }
        next();
    });

    app.use(passport.initialize());
    app.use(passport.session());

    app.use(cors({ origin: config.FRONTEND_ORIGIN, credentials: true }));
    app.use(`${BASE_PATH}/auth`, authRoutes);
    app.use(`${BASE_PATH}/user`, authenticate, userRoutes);

    app.use(errorHandler);
}

function registerTCPRoutes(tcpRouteMapper: TCPRouteMapper) {
    tcpRouteMapper.registerRoute("USER.VERIFY", authController.verifyUser);
    tcpRouteMapper.registerRoute(
        "USER.GET_ALL_USERS",
      userController.getAllUsers.TCP
    );
    tcpRouteMapper.registerRoute(
        "USER.GET_USER",
      userController.getUser.TCP
    );
    tcpRouteMapper.registerRoute("USER.UPDATE_USER.:id", userController.updateUser.TCP);
    tcpRouteMapper.registerRoute("USER.CREATE_USER", userController.createUser.TCP);
    tcpRouteMapper.registerRoute(
        "USER.DELETE_USER",
      userController.deleteUser.TCP
    );
    tcpRouteMapper.registerRoute(
        "USER.GET_PROFILE",
      userController.getProfile.TCP
    );
    tcpRouteMapper.registerRoute(
        "USER.UPDATE_PROFILE.:id",
      userController.updateProfile.TCP
    );

    // Authorize Mapper
    tcpRouteMapper.registerRoute("ROLE.GET_ALL_ROLES", roleController.getRoles.TCP)
    tcpRouteMapper.registerRoute("ROLE.GET_ROLE", roleController.getRole.TCP)
    tcpRouteMapper.registerRoute("ROLE.GET_PERMISSION_BY_ROLE.:id", roleController.getPermissionsByRole.TCP)
}

async function startApp() {
    try {
        await connectDatabase();
        if (isServiceMode) {
            await tcpTransport.startServer();
            registerTCPRoutes(tcpRouteMapper);

            return
        }

        app.listen(Number(config.PORT), config.HOST, async () => {
            console.log(
                `Server is running on port ${config.PORT} in ${config.NODE_ENV}`
            );
        });
    } catch (e) {
        console.error("Failed to start services:", e);
        process.exit(1);
    }
}

process.on("SIGINT", async () => {
    console.log("Shutting down services...");
    await tcpTransport.shutdown();
    process.exit(0);
});

void startApp();
