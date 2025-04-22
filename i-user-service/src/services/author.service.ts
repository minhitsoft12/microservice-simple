import RoleModel, {RoleDocument} from "../models/role.model";
import mongoose from "mongoose";
import PermissionModel, {PermissionDocument} from "../models/permission.model";

/**
 * Service class for handling role-related and permission operations
 */
export class AuthorService {
  /**
   * Parse query parameters for filtering
   */
  parseQueryParams<T>(query: any): T {
    // Implement query parsing logic
    return query as T;
  }

  /**
   * Get all roles with pagination
   */
  async getAllRoles(query: any) {
    const {page = 1, limit = 10, ...filters} = query;
    const skip = (page - 1) * limit;

    const filterQuery: any = {...filters};

    const roles = await RoleModel.find(filterQuery)
      .populate("permissions")
      .skip(skip)
      .limit(limit)
      .sort({createdAt: -1});

    const totalCount = await RoleModel.countDocuments(filterQuery);
    const totalPage = Math.ceil(totalCount / limit);

    return {
      roles,
      totalCount,
      totalPage,
      page: Number(page),
      skip,
      limit: Number(limit)
    };
  }

  /**
   * Get a role by ID
   */
  async getRoleById(roleId: string) {
    const role = await RoleModel.findById(roleId).populate("permissions");

    if (!role) {
      throw new Error("Role not found");
    }

    return {role};
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(roleId: string) {
    const role = await RoleModel.findById(roleId).populate("permissions");

    if (!role) {
      throw new Error("Role not found");
    }

    return {permissions: role.permissions};
  }

  /**
   * Create a new role
   */
  async createRole(userId: mongoose.Types.ObjectId, roleData: Partial<RoleDocument>) {
    const role = new RoleModel({
      ...roleData,
      createdBy: userId
    });

    await role.save();
    return {role};
  }

  /**
   * Update an existing role
   */
  async updateRole(
    userId: mongoose.Types.ObjectId,
    roleId: string,
    roleData: Partial<RoleDocument>
  ) {
    const role = await RoleModel.findByIdAndUpdate(
      roleId,
      {
        ...roleData,
        updatedBy: userId
      },
      {new: true}
    ).populate("permissions");

    if (!role) {
      throw new Error("Role not found");
    }

    return {role};
  }

  /**
   * Delete a role
   */
  async deleteRole(userId: mongoose.Types.ObjectId, roleId: string) {
    const role = await RoleModel.findByIdAndDelete(roleId);

    if (!role) {
      throw new Error("Role not found");
    }

    return {success: true};
  }

  /**
   * Get all permissions with pagination
   */
  async getAllPermissions(query: any) {
    const {page = 1, limit = 10, status, ...filters} = query;
    const skip = (page - 1) * limit;

    const filterQuery: any = {...filters};
    if (status) filterQuery.status = status;
    if (!filterQuery.deletedAt) filterQuery.deletedAt = null;

    const permissions = await PermissionModel.find(filterQuery)
      .skip(skip)
      .limit(limit)
      .sort({createdAt: -1});

    const totalCount = await PermissionModel.countDocuments(filterQuery);
    const totalPage = Math.ceil(totalCount / limit);

    return {
      permissions,
      totalCount,
      totalPage,
      page: Number(page),
      skip,
      limit: Number(limit)
    };
  }

  /**
   * Get a permission by ID
   */
  async getPermissionById(permissionId: string) {
    const permission = await PermissionModel.findOne({
      _id: permissionId,
      deletedAt: null
    });

    if (!permission) {
      throw new Error("Permission not found");
    }

    return {permission};
  }

  /**
   * Create a new permission
   */
  async createPermission(
    userId: mongoose.Types.ObjectId,
    permissionData: Partial<PermissionDocument>
  ) {
    const permission = new PermissionModel({
      ...permissionData,
      createdBy: userId
    });

    await permission.save();
    return {permission};
  }

  /**
   * Update an existing permission
   */
  async updatePermission(
    userId: mongoose.Types.ObjectId,
    permissionId: string,
    permissionData: Partial<PermissionDocument>
  ) {
    const permission = await PermissionModel.findOneAndUpdate(
      {_id: permissionId, deletedAt: null},
      {
        ...permissionData,
        updatedBy: userId
      },
      {new: true}
    );

    if (!permission) {
      throw new Error("Permission not found");
    }

    return {permission};
  }

  /**
   * Soft delete a permission
   */
  async deletePermission(userId: mongoose.Types.ObjectId, permissionId: string) {
    const permission = await PermissionModel.findOneAndUpdate(
      {_id: permissionId, deletedAt: null},
      {
        deletedAt: new Date(),
        deletedBy: userId
      }
    );

    if (!permission) {
      throw new Error("Permission not found or already deleted");
    }

    return {success: true};
  }

  /**
   * Get permissions by role ID
   */
  async getPermissionsByRoleId(roleId: string) {
    const role = await RoleModel.findById(roleId).populate("permissions");

    if (!role) {
      throw new Error("Role not found");
    }

    return {permissions: role.permissions};
  }
}