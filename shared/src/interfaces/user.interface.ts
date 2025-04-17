import {GenderEnumType, MaritalStatusEnumType, UserStatusEnumType} from "../enums/user.enum";

export interface User {
    _id: string
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