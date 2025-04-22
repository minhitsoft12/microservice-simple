import {ControllerMethod, CRUDController, GenericRequest, GenericResponse} from "./controller";
import {AuthorService} from "../services/author.service";
import {HTTP_STATUS} from "../config/http.config";

/**
 * Controller for role management
 */
export class RoleController extends CRUDController<AuthorService> {
  public readonly getPermissionsByRole: ControllerMethod;
  public readonly getRole: ControllerMethod;
  public readonly getRoles: ControllerMethod;

  constructor(authorService: AuthorService) {
    super(authorService);

    this.getPermissionsByRole = this.createControllerMethod(this.getRolePermissions);
    this.getRole = this.createControllerMethod(this.getItemById);
    this.getRoles = this.createControllerMethod(this.getAllItems);
  }

  protected getCollectionName(): string {
    return "roles";
  }

  protected getItemName(): string {
    return "role";
  }

  /**
   * Get all roles with pagination
   */
  protected async getAllItems(req: GenericRequest, res: GenericResponse): Promise<any> {
    const query = this.service.parseQueryParams(req.query);
    const results = await this.service.getAllRoles(query);

    return this.sendSuccess(
      res,
      "Roles fetched successfully",
      this.formatPaginationResponse({
        data: results.roles,
        totalCount: results.totalCount,
        totalPage: results.totalPage,
        page: results.page,
        skip: results.skip,
        limit: results.limit
      })
    );
  }

  /**
   * Get a role by ID
   */
  protected async getItemById(req: GenericRequest, res: GenericResponse): Promise<any> {
    const roleId = req.params.id;

    try {
      const {role} = await this.service.getRoleById(roleId);
      return this.sendSuccess(res, "Role fetched successfully", {role});
    } catch (error: any) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: error.message || "Role not found"
      });
    }
  }

  /**
   * Create a new role
   */
  protected async createItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;

    try {
      const {role} = await this.service.createRole(userId, req.body);
      return this.sendSuccess(
        res,
        "Role created successfully",
        {role},
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to create role"
      });
    }
  }

  /**
   * Update an existing role
   */
  protected async updateItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;
    const roleId = req.params.id;

    try {
      const {role} = await this.service.updateRole(userId, roleId, req.body);
      return this.sendSuccess(res, "Role updated successfully", {role});
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to update role"
      });
    }
  }

  /**
   * Delete a role
   */
  protected async deleteItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;
    const roleId = req.params.id;

    try {
      await this.service.deleteRole(userId, roleId);
      return this.sendSuccess(res, "Role deleted successfully");
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to delete role"
      });
    }
  }

  /**
   * Get permissions for a specific role
   */
  protected async getRolePermissions(req: GenericRequest, res: GenericResponse): Promise<any> {
    const roleId = req.params.id;

    try {
      const {permissions} = await this.service.getRolePermissions(roleId);
      return this.sendSuccess(res, "Role permissions fetched successfully", {permissions});
    } catch (error: any) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: error.message || "Role not found"
      });
    }
  }
}

/**
 * Controller for permission management
 */
export class PermissionController extends CRUDController<AuthorService> {
  public readonly getByRoleId: ControllerMethod;

  constructor(authorService: AuthorService) {
    super(authorService);

    this.getByRoleId = this.createControllerMethod(this.getPermissionsByRoleId);
  }

  protected getCollectionName(): string {
    return "permissions";
  }

  protected getItemName(): string {
    return "permission";
  }

  /**
   * Get all permissions with pagination
   */
  protected async getAllItems(req: GenericRequest, res: GenericResponse): Promise<any> {
    const query = this.service.parseQueryParams(req.query);
    const results = await this.service.getAllPermissions(query);

    return this.sendSuccess(
      res,
      "Permissions fetched successfully",
      this.formatPaginationResponse({
        data: results.permissions,
        totalCount: results.totalCount,
        totalPage: results.totalPage,
        page: results.page,
        skip: results.skip,
        limit: results.limit
      })
    );
  }

  /**
   * Get a permission by ID
   */
  protected async getItemById(req: GenericRequest, res: GenericResponse): Promise<any> {
    const permissionId = req.params.id;

    try {
      const {permission} = await this.service.getPermissionById(permissionId);
      return this.sendSuccess(res, "Permission fetched successfully", {permission});
    } catch (error: any) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: error.message || "Permission not found"
      });
    }
  }

  /**
   * Create a new permission
   */
  protected async createItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;

    try {
      const {permission} = await this.service.createPermission(userId, req.body);
      return this.sendSuccess(
        res,
        "Permission created successfully",
        {permission},
        HTTP_STATUS.CREATED
      );
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to create permission"
      });
    }
  }

  /**
   * Update an existing permission
   */
  protected async updateItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;
    const permissionId = req.params.id;

    try {
      const {permission} = await this.service.updatePermission(userId, permissionId, req.body);
      return this.sendSuccess(res, "Permission updated successfully", {permission});
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to update permission"
      });
    }
  }

  /**
   * Soft delete a permission
   */
  protected async deleteItem(req: GenericRequest, res: GenericResponse): Promise<any> {
    const userId = req.user?._id;
    const permissionId = req.params.id;

    try {
      await this.service.deletePermission(userId, permissionId);
      return this.sendSuccess(res, "Permission deleted successfully");
    } catch (error: any) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: error.message || "Failed to delete permission"
      });
    }
  }

  /**
   * Get permissions by role ID
   */
  protected async getPermissionsByRoleId(req: GenericRequest, res: GenericResponse): Promise<any> {
    const roleId = req.params.roleId;

    try {
      const {permissions} = await this.service.getPermissionsByRoleId(roleId);
      return this.sendSuccess(res, "Permissions fetched successfully", {permissions});
    } catch (error: any) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        message: error.message || "Role not found"
      });
    }
  }
}