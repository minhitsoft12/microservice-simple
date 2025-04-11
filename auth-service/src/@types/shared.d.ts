declare module '@shared/*' {
  export const SERVICE_NAMES: Record<'AUTH_SERVICE' | 'USER_SERVICE', string>;
  export const UserServiceTCPMessages: Record<
    'VERIFICATION' | 'GET_PROFILE' | 'UPDATE_PROFILE' | 'DELETE_ACCOUNT',
    string
  >;

  export declare const GenderEnum: {
    readonly MALE: 'MALE';
    readonly FEMALE: 'FEMALE';
    readonly OTHER: 'OTHER';
  };
  export declare const MaritalStatusEnum: {
    readonly SINGLE: 'SINGLE';
    readonly MARRIED: 'MARRIED';
    readonly IN_A_RELATIONSHIP: 'IN_A_RELATIONSHIP';
    readonly OTHER: 'OTHER';
  };
  export declare const UserStatusEnum: {
    readonly ONBOARDING: 'ONBOARDING';
    readonly ACTIVE: 'ACTIVE';
    readonly INACTIVE: 'INACTIVE';
  };
  export type GenderEnumType = keyof typeof GenderEnum;
  export type MaritalStatusEnumType = keyof typeof MaritalStatusEnum;
  export type UserStatusEnumType = keyof typeof UserStatusEnum;

  export interface User {
    _id: string;
    name: string;
    nickName?: string;
    bio?: string;
    email: string;
    password?: string;
    profilePicture?: string | null;
    status: UserStatusEnumType;
    onBoardingCompleted: boolean;
    roleId: string;
    lastLogin: Date | null;
    gender?: GenderEnumType;
    address?: string;
    phone?: string;
    maritalStatus?: MaritalStatusEnumType;
    birthday?: Date;
    createdBy?: string;
    updatedBy?: string;
    createdAt: Date;
    updatedAt: Date;
    currentTeam?: string | null;
  }

  export declare const Roles: {
    readonly ADMIN: 'ADMIN';
    readonly MANAGER: 'MANAGER';
    readonly LEADER: 'LEADER';
    readonly MEMBER: 'MEMBER';
  };
  export declare const Permissions: {
    readonly VIEW_ALL_TEAMS: 'VIEW_ALL_TEAMS';
    readonly VIEW_TEAM: 'VIEW_TEAM';
    readonly CREATE_TEAM: 'CREATE_TEAM';
    readonly DELETE_TEAM: 'DELETE_TEAM';
    readonly EDIT_TEAM: 'EDIT_TEAM';
    readonly VIEW_ALL_USERS: 'VIEW_ALL_USERS';
    readonly CREATE_USER: 'CREATE_USER';
    readonly DELETE_USER: 'DELETE_USER';
    readonly EDIT_USER: 'EDIT_USER';
    readonly VIEW_ALL_ROLES: 'VIEW_ALL_ROLES';
    readonly CHANGE_USER_ROLE: 'CHANGE_USER_ROLE';
    readonly VIEW_ALL_MEMBERS: 'VIEW_ALL_MEMBERS';
    readonly ADD_MEMBER: 'ADD_MEMBER';
    readonly REMOVE_MEMBER: 'REMOVE_MEMBER';
    readonly VIEW_ALL_PROJECTS: 'VIEW_ALL_PROJECTS';
    readonly VIEW_PROJECT: 'VIEW_PROJECT';
    readonly CREATE_PROJECT: 'CREATE_PROJECT';
    readonly DELETE_PROJECT: 'DELETE_PROJECT';
    readonly EDIT_PROJECT: 'EDIT_PROJECT';
    readonly CREATE_TASK: 'CREATE_TASK';
    readonly DELETE_TASK: 'DELETE_TASK';
    readonly EDIT_TASK: 'EDIT_TASK';
    readonly VIEW_ONLY: 'VIEW_ONLY';
  };
  export declare const RoleStatusEnum: {
    readonly DELETED: 'DELETED';
    readonly ACTIVE: 'ACTIVE';
    readonly INACTIVE: 'INACTIVE';
  };
  export declare const PermissionStatusEnum: {
    readonly DELETED: 'DELETED';
    readonly ACTIVE: 'ACTIVE';
    readonly INACTIVE: 'INACTIVE';
  };
  export type RoleStatusEnumType = keyof typeof RoleStatusEnum;
  export type PermissionStatusEnumType = keyof typeof PermissionStatusEnum;
  export type PermissionType = keyof typeof Permissions;
  export type RoleType = keyof typeof Roles;
}
