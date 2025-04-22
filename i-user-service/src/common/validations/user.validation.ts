import { z } from "zod";
import { UserStatusEnum } from "../enums/user.enum";

export const nameSchema = z.string().trim().min(3).max(255);
export const emailSchema = z.string().email();
export const currentTeamSchema = z.string().trim().min(1).optional();
export const nickNameSchema = z.string().trim().min(3).max(255).optional();
export const bioSchema = z.string().trim().max(255).optional();
export const profilePictureSchema = z.string().trim().max(255).optional();
export const isActiveSchema = z.boolean();
export const statusSchema = z.enum(
    Object.values(UserStatusEnum) as [string, ...string[]]
);
export const lastLogin = z.date()

export const roleIdSchema = z
    .string()
    .trim()
    .min(1, { message: "Role ID is required" });
export const userIdSchema = z
    .string()
    .trim()
    .min(1, { message: "User ID is required" });

export const changeRoleSchema = z.object({
    roleId: roleIdSchema,
    userId: userIdSchema,
});

export const updateCurrentUserSchema = z.object({
    name: nameSchema.optional(),
    nickName: nickNameSchema,
    bio: bioSchema,
    profilePicture: profilePictureSchema,
});
export const createUserSchema = z.object({
    name: nameSchema,
    email: emailSchema,
    roleId: roleIdSchema,
    nickName: nickNameSchema,
    bio: bioSchema,
    profilePicture: profilePictureSchema,
    isActive: isActiveSchema,
    currentTeam: currentTeamSchema,
});
export const updateUserSchema = z.object({
    name: nameSchema.optional(),
    nickName: nickNameSchema.optional(),
    bio: bioSchema.optional(),
    profilePicture: profilePictureSchema.optional(),
    onBoardingCompleted: z.boolean().optional(),
    isActive: isActiveSchema.optional(),
    roleId: roleIdSchema.optional(),
    status: statusSchema.optional(),
    lastLogin: lastLogin.optional(),
    teams: z.array(z.string().trim().min(1)).optional(),
});
