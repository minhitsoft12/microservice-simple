import {Request, Response} from "express";
import {ControllerMethod, CRUDController} from "./controller";
import {UserService} from "../services/user.service";
import {TCPRequest, TCPResponse} from "../services/tcpRouteMapper.service";
import {HTTP_STATUS} from "../config/http.config";
import {createUserSchema, updateUserSchema, userIdSchema} from "../common/validations/user.validation";
import {UserDocument} from "../models/user.model";

/**
 * Generic request and response types that can be either HTTP or TCP
 */
type GenericRequest = Request | TCPRequest;
type GenericResponse = Response | TCPResponse;

export class UserController extends CRUDController<UserService> {
    public readonly getAllUsers: ControllerMethod;
    public readonly getUser: ControllerMethod;
    public readonly updateUser: ControllerMethod;
    public readonly createUser: ControllerMethod;
    public readonly deleteUser: ControllerMethod;
    public readonly getProfile: ControllerMethod;
    public readonly updateProfile: ControllerMethod;

    constructor(userService: UserService) {
        super(userService);

        this.getAllUsers = this.createControllerMethod(this.getAllItems);
        this.getProfile = this.createControllerMethod(this.getUserProfile);
        this.updateProfile = this.createControllerMethod(this.updateUserProfile);
        this.getUser = this.createControllerMethod(this.getItemById)
        this.updateUser = this.createControllerMethod(this.updateItem)
        this.createUser = this.createControllerMethod(this.createItem)
        this.deleteUser = this.createControllerMethod(this.deleteItem)
    }

    /**
     * @override from base class to provide user-specific collection name
     */
    protected getCollectionName(): string {
        return "users";
    }

    /**
     * @override from base class to provide user-specific item name
     */
    protected getItemName(): string {
        return "user";
    }

    /**
     * Retrieves all users with filtering and pagination
     */
    protected async getAllItems(req: GenericRequest, res: GenericResponse): Promise<any> {
        const query = this.service.parseQueryParams<
          Partial<Record<keyof UserDocument, unknown>>
        >(req.query);

        const results = await this.service.getAllUsers(query);

        return this.sendSuccess(
          res,
          "Users fetched successfully",
          this.formatPaginationResponse({
              data: results.users,
              totalCount: results.totalCount,
              totalPage: results.totalPage,
              page: results.page,
              skip: results.skip,
              limit: results.limit
          })
        );
    }

    /**
     * Retrieves a user by ID
     */
    protected async getItemById(req: GenericRequest, res: GenericResponse): Promise<any> {
        const userId = userIdSchema.parse(req.params.id);
        const {user} = await this.service.getUserById(userId);

        return this.sendSuccess(res, "User fetched successfully", {
            user: {
                ...user.toObject(),
            },
        });
    }

    /**
     * Creates a new user
     */
    protected async createItem(req: GenericRequest, res: GenericResponse): Promise<any> {
        const body = createUserSchema.parse(req.body);
        const userId = req.user?._id;

        const {user} = await this.service.createUser(userId, body);

        return this.sendSuccess(
          res,
          "User created successfully",
          {user},
          HTTP_STATUS.CREATED
        );
    }

    /**
     * Updates an existing user
     */
    protected async updateItem(req: GenericRequest, res: GenericResponse): Promise<any> {
        let body = req.body;
        if (body.lastLogin) body.lastLogin = new Date(body.lastLogin);
        body = updateUserSchema.parse(body);

        const updatedByUser = req.user?._id;
        const userId = userIdSchema.parse(req.params.id);

        const {user} = await this.service.updateUser(updatedByUser, userId, body);

        return this.sendSuccess(res, "User updated successfully", {user});
    }

    /**
     * Deletes a user
     */
    protected async deleteItem(req: GenericRequest, res: GenericResponse): Promise<any> {
        const userId = req.user?._id;
        const userDeleteId = userIdSchema.parse(req.params.id);

        // Uncomment when implementing actual deletion
        // await this.service.deleteUser(userId, userDeleteId);

        return this.sendSuccess(res, "User deleted successfully");
    }

    /**
     * Retrieves the current user's profile
     */
    protected async getUserProfile(req: GenericRequest, res: GenericResponse): Promise<any> {
        const userId = req.user?._id;
        const {user} = await this.service.getCurrentUser(userId);

        return this.sendSuccess(res, "User profile fetched successfully", {
            user: {
                ...user.toObject(),
            },
        });
    }

    /**
     * Updates the current user's profile
     */
    protected async updateUserProfile(req: GenericRequest, res: GenericResponse): Promise<any> {
        let body = req.body;
        if (body.lastLogin) body.lastLogin = new Date(body.lastLogin);
        body = updateUserSchema.parse(body);

        const userId = req.user?._id;
        const {user} = await this.service.updateCurrentUser(userId, body);

        return this.sendSuccess(res, "User profile updated successfully", {user});
    }
}