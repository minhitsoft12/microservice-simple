import {Permission} from "./permission.interface";

export interface User {
    _id: string;
    name: string;
    email: string;
    status: string;
    profilePicture: string | null;
    currentTeam: string | null;
    roleId: string;
    onBoardingCompleted: boolean;
    lastLogin: string;
    gender: string | null;
    maritalStatus: string | null;
    birthday: string | null;
    createdAt: string;
    updatedAt: string;
    address?: string;
    phone?: string;
    createdBy?: string;
    nickName?: string;
    bio?: string;
    __v: number;
    updatedBy: string;
    permissions: Permission[];
    roles?: string[];
}