import {NextFunction, Request, Response} from "express";
import {asyncHandler} from "../middlewares/asyncHandler.middleware";
import {AuthService} from "../services/auth.service";
import {config} from "../config/app.config";
import {registerSchema} from "../common/validations/auth.validation";
import {HTTP_STATUS} from "../config/http.config";
import passport from "passport";
import {TCPRequest, TCPResponse} from "../services/tcpRouteMapper.service";

export class AuthController {
    private authService: AuthService;
    constructor(authService: AuthService) {
        this.authService = authService;
    }

    public googleLoginCallback = asyncHandler(
        async (req: Request, res: Response): Promise<any> => {
            const currentTeam = req.user?.currentTeam;

            if (!currentTeam) {
                return res.redirect(`${config.FRONTEND_ORIGIN}/profile`);
            }
            return res.redirect(
                `${config.FRONTEND_ORIGIN}/team/${currentTeam}`
            );
        }
    );
    public register = asyncHandler(
        async (req: Request, res: Response): Promise<any> => {
            const body = registerSchema.parse({
                ...req.body,
            });

            const { userId } = await this.authService.register(body);
            return res.status(HTTP_STATUS.CREATED).json({
                message: "User register successfully",
                user: {
                    userId,
                },
            });
        }
    );
    public login = asyncHandler(
        async (
            req: Request,
            res: Response,
            next: NextFunction
        ): Promise<any> => {
            passport.authenticate(
                "local",
                (
                    err: Error | null,
                    user: Express.User | false,
                    info: { message: string | null }
                ) => {
                    if (err) {
                        return next(err);
                    }
                    if (!user) {
                        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                            message:
                                info?.message || "Invalid email or password",
                        });
                    }
                    req.logIn(user, (err) => {
                        if (err) {
                            return next(err);
                        }
                        return res.status(HTTP_STATUS.OK).json({
                            message: "Logged in successfully",
                            user,
                        });
                    });
                }
            )(req, res, next);
        }
    );
    public logout = asyncHandler(
        async (req: Request, res: Response): Promise<any> => {
            req.logout((err) => {
                if (err) {
                    console.error("Logout error: ", err);
                    return res
                        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
                        .json({ error: "Failed to logout" });
                }
            });

            req.session = null;
            return res.status(HTTP_STATUS.OK).json({
                message: "Logout successfully",
            });
        }
    );
  public verifyUser: any = async (req: Request | TCPRequest, res: Response | TCPResponse): Promise<any> => {
    try {
      const user = await this.authService.verifyUser(req.body);
      console.log('verifyUser', user)

      if (!user) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: "Invalid email or password",
        });
      }

      return res.status(HTTP_STATUS.OK).json({
        message: "Logged in successfully",
        user,
      });
    } catch (error: any) {
      return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({message: error?.message});
    }
  }
}
