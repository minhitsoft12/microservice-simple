import { BaseStatusEnum } from "./status.enum";

export const Roles = {
    ADMIN: "ADMIN",
    MANAGER: "MANAGER",
    LEADER: "LEADER",
    MEMBER: "MEMBER",
} as const;

export const Permissions = {
    VIEW_ALL_TEAMS: "VIEW_ALL_TEAMS",
    VIEW_TEAM: "VIEW_TEAM",
    CREATE_TEAM: "CREATE_TEAM",
    DELETE_TEAM: "DELETE_TEAM",
    EDIT_TEAM: "EDIT_TEAM",

    VIEW_ALL_USERS: "VIEW_ALL_USERS",
    CREATE_USER: "CREATE_USER",
    DELETE_USER: "DELETE_USER",
    EDIT_USER: "EDIT_USER",

    VIEW_ALL_ROLES: "VIEW_ALL_ROLES",
    CHANGE_USER_ROLE: "CHANGE_USER_ROLE",

    VIEW_ALL_MEMBERS: "VIEW_ALL_MEMBERS",
    ADD_MEMBER: "ADD_MEMBER",
    REMOVE_MEMBER: "REMOVE_MEMBER",

    VIEW_ALL_PROJECTS: "VIEW_ALL_PROJECTS",
    VIEW_PROJECT: "VIEW_PROJECT",
    CREATE_PROJECT: "CREATE_PROJECT",
    DELETE_PROJECT: "DELETE_PROJECT",
    EDIT_PROJECT: "EDIT_PROJECT",

    CREATE_TASK: "CREATE_TASK",
    DELETE_TASK: "DELETE_TASK",
    EDIT_TASK: "EDIT_TASK",

    VIEW_ONLY: "VIEW_ONLY",
} as const;

export const RoleStatusEnum = {
    ...BaseStatusEnum,
    DELETED: "DELETED",
} as const;

export const PermissionStatusEnum = {
    ...BaseStatusEnum,
    DELETED: "DELETED",
} as const;

export type RoleStatusEnumType = keyof typeof RoleStatusEnum;
export type PermissionStatusEnumType = keyof typeof PermissionStatusEnum;
export type PermissionType = keyof typeof Permissions;

export type RoleType = keyof typeof Roles;