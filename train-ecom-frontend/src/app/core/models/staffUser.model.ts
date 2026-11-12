import { Role } from "./auth.model";

export enum StaffUsersListField {
    Id = 1,
    Name = 2,
    Email = 3,
    PhoneNumber = 4
}

export interface StaffUser extends Record<string, unknown> {
    id: number;
    name: string;
    email: string;
    phoneNumber: string,
    role: Role;
    isBlocked: boolean;
}

export interface StaffuserListResponse {
    items: StaffUser[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface StaffUserFilter {
    searchTerm?: string;
    searchField?: StaffUsersListField;
    roleFilter?: Role[];
    pageNumber: number;
    pageSize: number;
}

export interface CreateStaffUser {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    role: Role;
}

export interface CreateStaffUserResponse {
    message: string;
}