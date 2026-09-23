import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import {
  Address,
  UserProfile,
  UpdateProfilePayload,
  AdminUserFilterParams,
  AdminUserListResponse,
  UpdateUserStatusPayload,
  UserStatusFilter,
  ApprovalStatus,
} from '../models/user.model';
import { Observable, of, tap, map } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Role } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private profileUrl = `${environment.apiBaseUrl}/auth/profile`;
  private addressBaseUrl = `${environment.apiBaseUrl}/addresses`;

  private http = inject(HttpClient);
  private addressesCache: Address[] | null = null;

  constructor() {}

  clearCache(): void {
    this.addressesCache = null;
  }

  getUserProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.profileUrl).pipe(
      map((profile) => {
        if (profile.vendorDetails) {
          const vd = profile.vendorDetails as Record<string, unknown> &
            typeof profile.vendorDetails;
          if ('bussinessName' in vd)
            vd.businessName = vd['bussinessName'] as string;
          if ('bussinessDescription' in vd)
            vd.businessDescription = vd['bussinessDescription'] as string;
        }
        return profile;
      }),
    );
  }

  updateUserProfile(
    profileData: UpdateProfilePayload,
  ): Observable<UserProfile> {
    const url = `${this.profileUrl}/update`;
    const payload: UpdateProfilePayload = { ...profileData };
    if (payload.businessDetails) {
      const businessDetails = payload.businessDetails as Record<
        string,
        unknown
      >;
      businessDetails['bussinessName'] = payload.businessDetails.businessName;
      businessDetails['bussinessDescription'] =
        payload.businessDetails.businessDescription;
    }
    return this.http.put<UserProfile>(url, payload);
  }

  getAllAddress(): Observable<Address[]> {
    if (this.addressesCache) {
      return of(this.addressesCache);
    }
    const url = `${this.addressBaseUrl}/all`;
    return this.http
      .get<Address[]>(url)
      .pipe(tap((addresses) => (this.addressesCache = addresses)));
  }

  addAddress(addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/create`;
    return this.http
      .post<Address>(url, addressData)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  updateAddress(id: number, addressData: Address): Observable<Address> {
    const url = `${this.addressBaseUrl}/update/${id}`;
    return this.http
      .put<Address>(url, addressData)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  deleteAddress(id: number): Observable<void> {
    const url = `${this.addressBaseUrl}/delete/${id}`;
    return this.http
      .delete<void>(url)
      .pipe(tap(() => (this.addressesCache = null)));
  }

  setDefaultAddress(id: number): Observable<void> {
    const url = `${this.addressBaseUrl}/set-default/${id}`;
    return this.http
      .patch<void>(url, {})
      .pipe(tap(() => (this.addressesCache = null)));
  }

  private normalizeUserStatus(
    status: UserStatusFilter | string | number | undefined,
  ): number | undefined {
    if (status === undefined || status === null || status === '') {
      return undefined;
    }
    if (typeof status === 'number') {
      return status;
    }
    const value = status.trim().toLowerCase();
    if (value === 'all') return UserStatusFilter.All;
    if (value === 'active') return UserStatusFilter.Active;
    if (value === 'blocked') return UserStatusFilter.Blocked;
    return Number(status) || undefined;
  }

  private normalizeRole(
    role: Role | string | number | undefined,
  ): number | undefined {
    if (role === undefined || role === null || role === '') {
      return undefined;
    }
    if (typeof role === 'number') {
      return role;
    }
    const normalized = role.trim();
    const roleMap: Record<string, number> = {
      customer: Role.Customer,
      vendor: Role.Vendor,
      admin: Role.Admin,
      accounting: Role.Accounting,
      officeadmin: Role.OfficeAdmin,
    };
    return roleMap[normalized.toLowerCase()] ?? Number(normalized) ?? undefined;
  }

  private normalizeApprovalStatus(
    status: ApprovalStatus | string | number | undefined,
  ): number | undefined {
    if (status === undefined || status === null || status === '') {
      return undefined;
    }
    if (typeof status === 'number') {
      return status;
    }
    const normalized = status.trim().toLowerCase();
    const statusMap: Record<string, number> = {
      pending: ApprovalStatus.Pending,
      approved: ApprovalStatus.Approved,
      rejected: ApprovalStatus.Rejected,
    };
    return statusMap[normalized] ?? Number(normalized) ?? undefined;
  }

  // Admin: Fetch all users
  getAllUsers(
    filter?: AdminUserFilterParams,
  ): Observable<AdminUserListResponse> {
    let params = new HttpParams();
    if (filter) {
      const searchValue = filter.Search ?? filter.search;
      const roleValue = filter.Role ?? filter.role;
      const approvalValue = filter.ApprovalStatus ?? filter.approvalStatus;
      const statusValue = filter.UserStatus ?? filter.status;
      const pageNumberValue = filter.PageNumber ?? filter.pageNumber;
      const pageSizeValue = filter.PageSize ?? filter.pageSize;

      if (searchValue) {
        params = params.set('Search', String(searchValue));
      }
      const normalizedApproval = this.normalizeApprovalStatus(approvalValue);
      if (normalizedApproval !== undefined) {
        params = params.set('ApprovalStatus', String(normalizedApproval));
      }
      const normalizedRole = this.normalizeRole(roleValue);
      if (normalizedRole !== undefined) {
        params = params.set('Role', String(normalizedRole));
      }
      const normalizedStatus = this.normalizeUserStatus(statusValue);
      if (normalizedStatus !== undefined) {
        params = params.set('UserStatus', String(normalizedStatus));
      }
      if (pageNumberValue !== undefined) {
        params = params.set('PageNumber', pageNumberValue.toString());
      }
      if (pageSizeValue !== undefined) {
        params = params.set('PageSize', pageSizeValue.toString());
      }
    }
    const url = `${environment.apiBaseUrl}/admin/users/all`;
    return this.http.get<AdminUserListResponse>(url, { params });
  }

  // Admin: Update user status (block/unblock)
  updateUserStatus(
    userId: number,
    payload: UpdateUserStatusPayload,
  ): Observable<void> {
    const url = `${environment.apiBaseUrl}/admin/users/${userId}/update-status`;
    return this.http.patch<void>(url, payload);
  }

  // delete api
  deleteUser(userId: number): Observable<{ status: boolean; message: string }> {
    const url = `${environment.apiBaseUrl}/admin/users/${userId}/delete`;
    return this.http.delete<{ status: boolean; message: string }>(url);
  }
}
