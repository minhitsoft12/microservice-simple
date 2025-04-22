export interface BaseFilterQuery {
    pagination: { limit: number; skip: number; page: number };
    sort: { field: string; order: "asc" | "desc" };
    search: RegExp;
}

export interface UserFilter {
    name: string;
    email: string;
}

export interface FilterQuery<T = Record<string, any>> extends BaseFilterQuery {
    filters: T;
}

export type UserFiltersQuery = FilterQuery<UserFilter>;
