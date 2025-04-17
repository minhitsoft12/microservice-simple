import { BaseStatusEnum } from "./status.enum";

export const GenderEnum = {
    MALE: "MALE",
    FEMALE: "FEMALE",
    OTHER: "OTHER",
} as const;

export const MaritalStatusEnum = {
    SINGLE: "SINGLE",
    MARRIED: "MARRIED",
    IN_A_RELATIONSHIP: "IN_A_RELATIONSHIP",
    OTHER: "OTHER",
} as const;

export const UserStatusEnum = {
    ...BaseStatusEnum,
    ONBOARDING: "ONBOARDING",
} as const;

export type GenderEnumType = keyof typeof GenderEnum;
export type MaritalStatusEnumType = keyof typeof MaritalStatusEnum;
export type UserStatusEnumType = keyof typeof UserStatusEnum;