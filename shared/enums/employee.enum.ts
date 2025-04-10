export const EmployeeTypeEnum = {
    FULL_TIME: "FULL_TIME",
    PART_TIME: "PART_TIME",
    INTERN: "INTERN",
} as const;

export const EmployeeStatusEnum = {
    TERMINATED: "TERMINATED",
    PERMANENT: "PERMANENT",
    PROBATION: "PROBATION",
} as const;

export const WorkTypeEnum = {
    REMOTE: "REMOTE",
    ONSITE: "ONSITE",
    HYBRID: "HYBRID",
} as const;

export type EmployeeTypeEnumType = keyof typeof EmployeeTypeEnum;
export type EmployeeStatusEnumType = keyof typeof EmployeeStatusEnum;
export type WorkTypeEnumType = keyof typeof WorkTypeEnum;